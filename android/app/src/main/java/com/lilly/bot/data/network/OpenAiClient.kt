package com.lilly.bot.data.network

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.ChatMessage
import com.lilly.bot.domain.model.Role
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class OpenAiClient : InferenceClient {

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
        val payload = buildPayload(systemPrompt, history, settings, temperature, stream = true)
        val requestBuilder = Request.Builder()
            .url(settings.apiUrl)
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .header("Accept", "text/event-stream")

        if (apiKey.isNotBlank()) {
            requestBuilder.header("Authorization", "Bearer $apiKey")
        }

        val request = requestBuilder.build()
        val fullResponse = StringBuilder()

        suspendCancellableCoroutine { continuation ->
            val factory = EventSources.createFactory(okHttpClient)
            val eventSource = factory.newEventSource(request, object : EventSourceListener() {
                override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
                    if (data == "[DONE]") {
                        if (continuation.isActive) {
                            continuation.resume(fullResponse.toString())
                        }
                        return
                    }
                    try {
                        val json = JSONObject(data)
                        val choices = json.optJSONArray("choices") ?: return
                        if (choices.length() > 0) {
                            val choice = choices.getJSONObject(0)
                            val delta = choice.optJSONObject("delta")
                            val content = delta?.optString("content") ?: ""
                            if (content.isNotEmpty()) {
                                fullResponse.append(content)
                                onDelta(content)
                            }
                        }
                    } catch (e: Exception) {
                        // ignore malformed SSE ping
                    }
                }

                override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
                    if (continuation.isActive) {
                        continuation.resumeWithException(
                            t ?: IOException("SSE connection failed with HTTP ${response?.code}")
                        )
                    }
                }

                override fun onClosed(eventSource: EventSource) {
                    if (continuation.isActive) {
                        continuation.resume(fullResponse.toString())
                    }
                }
            })

            continuation.invokeOnCancellation {
                eventSource.cancel()
            }
        }
    }

    override suspend fun generateCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float?
    ): String = withContext(Dispatchers.IO) {
        val payload = buildPayload(systemPrompt, history, settings, temperature, stream = false)
        val requestBuilder = Request.Builder()
            .url(settings.apiUrl)
            .post(payload.toString().toRequestBody("application/json".toMediaType()))

        if (apiKey.isNotBlank()) {
            requestBuilder.header("Authorization", "Bearer $apiKey")
        }

        val response = okHttpClient.newCall(requestBuilder.build()).execute()
        if (!response.isSuccessful) {
            throw IOException("HTTP ${response.code}: ${response.body?.string()}")
        }

        val bodyStr = response.body?.string() ?: ""
        val json = JSONObject(bodyStr)
        val choices = json.getJSONArray("choices")
        val message = choices.getJSONObject(0).getJSONObject("message")
        message.optString("content", "")
    }

    private fun buildPayload(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        temperature: Float?,
        stream: Boolean
    ): JSONObject {
        val json = JSONObject()
        json.put("model", settings.modelName)
        json.put("temperature", (temperature ?: settings.temperature).toDouble())
        json.put("stream", stream)

        val messagesArray = JSONArray()

        // System prompt
        if (systemPrompt.isNotBlank()) {
            val sysObj = JSONObject()
            sysObj.put("role", "system")
            sysObj.put("content", systemPrompt)
            messagesArray.put(sysObj)
        }

        // History
        for (msg in history) {
            val msgObj = JSONObject()
            val roleStr = when (msg.role) {
                Role.USER -> "user"
                Role.ASSISTANT -> "assistant"
                Role.SYSTEM -> "system"
                Role.TOOL -> "tool"
            }
            msgObj.put("role", roleStr)
            msgObj.put("content", msg.content)
            messagesArray.put(msgObj)
        }

        json.put("messages", messagesArray)
        return json
    }
}
