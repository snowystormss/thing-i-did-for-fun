package com.lilly.bot.domain.brain

import com.lilly.bot.domain.model.ChatMessage
import kotlin.math.max

class TokenBudgeter(
    var modelContextTokens: Int = 8192,
    var contextUtilizationRatio: Float = 0.95f,
    var responseTokenReserve: Int = 2048,
    var conversationWindowMessages: Int = 0
) {

    /**
     * Approximates token count for text (~4 characters per token average).
     */
    fun estimateTokens(text: String): Int {
        if (text.isEmpty()) return 0
        // Heuristic combining word boundaries and character counts
        val words = text.split(Regex("\\s+")).size
        val chars = text.length
        return max(words, (chars / 3.8).toInt())
    }

    /**
     * Calculates maximum tokens allocated for conversation history (excluding reserve and system prompt).
     */
    fun calculateAvailableHistoryBudget(systemPromptTokens: Int): Int {
        val totalUsable = (modelContextTokens * contextUtilizationRatio).toInt()
        val budget = totalUsable - responseTokenReserve - systemPromptTokens
        return max(256, budget)
    }

    /**
     * Prunes and formats conversation history to fit strictly within token budget.
     * Walks backwards from the newest message to older messages.
     */
    fun budgetHistory(
        messages: List<ChatMessage>,
        systemPromptTokens: Int
    ): List<ChatMessage> {
        if (messages.isEmpty()) return emptyList()

        // Apply message count window cap if set
        var candidateList = if (conversationWindowMessages > 0) {
            messages.takeLast(conversationWindowMessages)
        } else {
            messages
        }

        val availableBudget = calculateAvailableHistoryBudget(systemPromptTokens)
        var usedTokens = 0
        val budgeted = mutableListOf<ChatMessage>()

        // Walk backwards: newest message is kept first
        for (i in candidateList.indices.reversed()) {
            val msg = candidateList[i]
            val cost = if (msg.estimatedTokens > 0) msg.estimatedTokens else estimateTokens(msg.content)
            if (usedTokens + cost > availableBudget && budgeted.isNotEmpty()) {
                // Out of budget, discard older messages
                break
            }
            usedTokens += cost
            budgeted.add(msg)
        }

        return budgeted.reversed()
    }
}
