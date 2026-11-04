package com.lilly.bot.data.network

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.ChatMessage
import com.lilly.bot.domain.model.Role
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.IOException
import java.io.InputStreamReader
import java.util.concurrent.TimeUnit

class GeminiClient : InferenceClient {

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    override suspend fun streamCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float?,
        onDelta: (String) -> Unit
    ): String = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            throw IllegalArgumentException("Gemini API key is required but not provided.")
        }

        val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/${settings.modelName}:streamGenerateContent?alt=sse&key=$apiKey"
        val payload = buildGeminiPayload(systemPrompt, history, temperature ?: settings.temperature)

        val request = Request.Builder()
            .url(endpoint)
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .header("Accept", "text/event-stream")
            .build()

        val fullResponse = StringBuilder()
        val response = okHttpClient.newCall(request).execute()

        if (!response.isSuccessful) {
            throw IOException("Gemini API Error ${response.code}: ${response.body?.string()}")
        }

        val reader = BufferedReader(InputStreamReader(response.body?.byteStream() ?: throw IOException("Empty body")))
        var line: String?
        while (reader.readLine().also { line = it } != null) {
            val currentLine = line?.trim() ?: continue
            if (currentLine.startsWith("data: ")) {
                val dataJson = currentLine.removePrefix("data: ").trim()
                if (dataJson.isNotEmpty() && dataJson != "[DONE]") {
                    try {
                        val obj = JSONObject(dataJson)
                        val candidates = obj.optJSONArray("candidates") ?: continue
                        if (candidates.length() > 0) {
                            val candidate = candidates.getJSONObject(0)
                            val content = candidate.optJSONObject("content")
                            val parts = content?.optJSONArray("parts") ?: continue
                            for (i in 0 until parts.length()) {
                                val text = parts.getJSONObject(i).optString("text", "")
                                if (text.isNotEmpty()) {
                                    fullResponse.append(text)
                                    onDelta(text)
                                }
                            }
                        }
                    } catch (e: Exception) {
                        // ignore malformed line
                    }
                }
            }
        }

        fullResponse.toString()
    }

    override suspend fun generateCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float?
    ): String = withContext(Dispatchers.IO) {
        if (apiKey.isBlank()) {
            throw IllegalArgumentException("Gemini API key is required but not provided.")
        }

        val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/${settings.modelName}:generateContent?key=$apiKey"
        val payload = buildGeminiPayload(systemPrompt, history, temperature ?: settings.temperature)

        val request = Request.Builder()
            .url(endpoint)
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        val response = okHttpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            throw IOException("Gemini API Error ${response.code}: ${response.body?.string()}")
        }

        val bodyStr = response.body?.string() ?: ""
        val obj = JSONObject(bodyStr)
        val candidates = obj.getJSONArray("candidates")
        val content = candidates.getJSONObject(0).getJSONObject("content")
        val parts = content.getJSONArray("parts")
        parts.getJSONObject(0).getString("text")
    }

    private fun buildGeminiPayload(systemPrompt: String, history: List<ChatMessage>, temp: Float): JSONObject {
        val root = JSONObject()

        if (systemPrompt.isNotBlank()) {
            val sysInstruction = JSONObject()
            val sysParts = JSONArray()
            val textPart = JSONObject()
            textPart.put("text", systemPrompt)
            sysParts.put(textPart)
            sysInstruction.put("parts", sysParts)
            root.put("systemInstruction", sysInstruction)
        }

        val contents = JSONArray()
        for (msg in history) {
            val contentObj = JSONObject()
            contentObj.put("role", if (msg.role == Role.USER) "user" else "model")
            val parts = JSONArray()
            val textPart = JSONObject()
            textPart.put("text", msg.content)
            parts.put(textPart)
            contentObj.put("parts", parts)
            contents.put(contentObj)
        }

        root.put("contents", contents)

        val genConfig = JSONObject()
        genConfig.put("temperature", temp.toDouble())
        root.put("generationConfig", genConfig)

        return root
    }
}
