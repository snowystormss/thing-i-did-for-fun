package com.lilly.bot.data.network

import com.lilly.bot.data.storage.LillySettings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

class CloudSearchClient {

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(45, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    /**
     * Executes cloud research or math instruction via Gemini API.
     */
    suspend fun executeCloudAgentInstruction(
        instruction: String,
        settings: LillySettings,
        cloudApiKey: String
    ): String = withContext(Dispatchers.IO) {
        if (cloudApiKey.isBlank()) {
            return@withContext "[Error: Cloud Agent API key not configured]"
        }

        val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/${settings.cloudSearchModel}:generateContent?key=$cloudApiKey"

        val payload = JSONObject()

        val sysInstruction = JSONObject()
        val sysParts = JSONArray()
        val sysText = JSONObject()
        sysText.put(
            "text",
            "You are Lilly's Cloud Agent. You assist Lilly with factual research, mathematical computations, or summarizing information. Be concise, accurate, and direct."
        )
        sysParts.put(sysText)
        sysInstruction.put("parts", sysParts)
        payload.put("systemInstruction", sysInstruction)

        val contents = JSONArray()
        val userContent = JSONObject()
        userContent.put("role", "user")
        val userParts = JSONArray()
        val userText = JSONObject()
        userText.put("text", instruction)
        userParts.put(userText)
        userContent.put("parts", userParts)
        contents.put(userContent)
        payload.put("contents", contents)

        val request = Request.Builder()
            .url(endpoint)
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()

        return@withContext try {
            val response = okHttpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                "[Error calling Cloud Agent: HTTP ${response.code}]"
            } else {
                val bodyStr = response.body?.string() ?: ""
                val obj = JSONObject(bodyStr)
                val candidates = obj.getJSONArray("candidates")
                val content = candidates.getJSONObject(0).getJSONObject("content")
                val parts = content.getJSONArray("parts")
                parts.getJSONObject(0).getString("text").trim()
            }
        } catch (e: Exception) {
            "[Cloud Agent connection failed: ${e.message}]"
        }
    }
}
