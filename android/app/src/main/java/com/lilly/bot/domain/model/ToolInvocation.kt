package com.lilly.bot.domain.model

enum class ToolType {
    RECALL,
    CLOUD
}

data class ToolInvocation(
    val id: String = java.util.UUID.randomUUID().toString(),
    val type: ToolType,
    val rawMatch: String,
    val query: String,
    val result: String? = null,
    val executionTimeMs: Long = 0,
    val isCompleted: Boolean = false
)
