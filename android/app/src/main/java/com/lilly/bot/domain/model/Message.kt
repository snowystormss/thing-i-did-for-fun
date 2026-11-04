package com.lilly.bot.domain.model

enum class Role {
    USER,
    ASSISTANT,
    SYSTEM,
    TOOL
}

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val role: Role,
    val content: String,
    val bubbles: List<String> = emptyList(),
    val timestamp: Long = System.currentTimeMillis(),
    val estimatedTokens: Int = 0,
    val isStreamPreview: Boolean = false,
    val triggeredTools: List<ToolInvocation> = emptyList()
)
