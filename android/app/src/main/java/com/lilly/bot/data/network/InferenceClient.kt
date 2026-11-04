package com.lilly.bot.data.network

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.ChatMessage

interface InferenceClient {

    suspend fun streamCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float? = null,
        onDelta: (String) -> Unit
    ): String

    suspend fun generateCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float? = null
    ): String
}
