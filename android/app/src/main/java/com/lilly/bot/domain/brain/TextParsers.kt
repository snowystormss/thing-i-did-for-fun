package com.lilly.bot.domain.brain

import com.lilly.bot.domain.model.ToolInvocation
import com.lilly.bot.domain.model.ToolType

object TextParsers {

    private val THINK_TAG_REGEX = Regex(
        "<(thought|think)>.*?</\\1>",
        setOf(RegexOption.DOT_MATCHES_ALL, RegexOption.IGNORE_CASE)
    )

    private val CHANNEL_THOUGHT_REGEX = Regex(
        "<\\|channel\\|>thought.*?<\\|channel\\|>",
        RegexOption.DOT_MATCHES_ALL
    )

    private val END_OF_THOUGHT_REGEX = Regex(
        "<\\|thought\\|>.*?<\\|end_of_thought\\|>",
        RegexOption.DOT_MATCHES_ALL
    )

    private val ROLE_PREFIX_REGEX = Regex(
        "^(assistant|user):\\s*",
        RegexOption.IGNORE_CASE
    )

    private val BREAK_TOKEN_REGEX = Regex(
        "\\[break\\]",
        RegexOption.IGNORE_CASE
    )

    private val SECTION_HEADER_REGEX = Regex(
        "^\\[(SHORT|MED|LONG|PERM|TITLE)\\]",
        RegexOption.MULTILINE
    )

    private val RECALL_TOOL_REGEX = Regex(
        "\\[RECALL:\\s*(.+?)\\]",
        RegexOption.IGNORE_CASE
    )

    private val CLOUD_TOOL_REGEX = Regex(
        "\\[CLOUD:\\s*(.+?)\\]",
        RegexOption.IGNORE_CASE
    )

    /**
     * Removes all <thought>...</thought> and <think>...</think> spans
     * and collapses 3+ newlines to double newline.
     */
    fun stripModelThinking(text: String): String {
        val noTags = THINK_TAG_REGEX.replace(text, "")
        return noTags.replace(Regex("\\n{3,}"), "\n\n").trim()
    }

    /**
     * Strips model thinking, then searches for the first [SHORT], [MED], [LONG],
     * [PERM], or [TITLE] block. If found, returns text starting from that header.
     */
    fun stripThinkingPreamble(text: String): String {
        val cleaned = stripModelThinking(text)
        val match = SECTION_HEADER_REGEX.find(cleaned)
        return if (match != null) {
            cleaned.substring(match.range.first)
        } else {
            cleaned
        }
    }

    /**
     * Matches a bracketed section e.g. [SHORT] body up to next section or EOF.
     */
    fun parseSection(text: String, sectionName: String): String {
        val pattern = Regex(
            "^\\[${Regex.escape(sectionName)}\\](.*?)(?=^\\[[A-Z_]+\\]|\\z)",
            setOf(RegexOption.DOT_MATCHES_ALL, RegexOption.MULTILINE)
        )
        val match = pattern.find(text)
        return match?.groupValues?.getOrNull(1)?.trim() ?: ""
    }

    /**
     * Extracts [TITLE: ...] within a section body, takes up to 60 chars and returns safeSlug.
     */
    fun parseSectionTitle(text: String, sectionName: String): String {
        val sectionBody = parseSection(text, sectionName)
        if (sectionBody.isBlank()) return ""
        val titleMatch = Regex("\\[TITLE:\\s*(.+?)\\]", RegexOption.IGNORE_CASE).find(sectionBody)
        val rawTitle = titleMatch?.groupValues?.getOrNull(1)?.trim()?.take(60) ?: ""
        return if (rawTitle.isNotEmpty()) SanitizationUtils.safeSlug(rawTitle) else ""
    }

    /**
     * Strips thoughts, channel tokens, role prefixes, converts [break] to newlines,
     * and collapses excessive newlines.
     */
    fun stripReplyControlTokens(reply: String): String {
        var text = THINK_TAG_REGEX.replace(reply, "")
        text = CHANNEL_THOUGHT_REGEX.replace(text, "")
        text = END_OF_THOUGHT_REGEX.replace(text, "")
        text = ROLE_PREFIX_REGEX.replace(text, "")
        text = BREAK_TOKEN_REGEX.replace(text, "\n\n")
        text = text.replace(Regex("\\n{3,}"), "\n\n")
        return text.trim()
    }

    /**
     * Stream visible text: strips control tokens and hides incomplete tool tags at the end.
     */
    fun streamVisibleText(rawReply: String): String {
        var visible = stripReplyControlTokens(rawReply)
        val lastOpen = visible.lastIndexOf('[')
        val lastClose = visible.lastIndexOf(']')
        if (lastOpen > lastClose) {
            visible = visible.substring(0, lastOpen)
        }
        return visible.trimEnd()
    }

    /**
     * Extracts [RECALL: ...] and [CLOUD: ...] tool invocations from text.
     */
    fun extractToolInvocations(text: String): List<ToolInvocation> {
        val invocations = mutableListOf<ToolInvocation>()
        RECALL_TOOL_REGEX.findAll(text).forEach { match ->
            invocations.add(
                ToolInvocation(
                    type = ToolType.RECALL,
                    rawMatch = match.value,
                    query = match.groupValues[1].trim()
                )
            )
        }
        CLOUD_TOOL_REGEX.findAll(text).forEach { match ->
            invocations.add(
                ToolInvocation(
                    type = ToolType.CLOUD,
                    rawMatch = match.value,
                    query = match.groupValues[1].trim()
                )
            )
        }
        return invocations
    }

    /**
     * Splits a raw reply into discrete chat bubbles using [break], paragraphs,
     * and max length constraints, respecting maxReplyBubbles and maxBubbleChunkChars.
     */
    fun splitBubbles(
        rawReply: String,
        maxBubbles: Int = 3,
        maxBubbleChunkChars: Int = 900
    ): List<String> {
        val cleaned = stripReplyControlTokens(rawReply)
        if (cleaned.isBlank()) return emptyList()

        // Split by double-newlines first
        val parts = cleaned.split(Regex("\\n\\n+")).map { it.trim() }.filter { it.isNotEmpty() }
        val bubbles = mutableListOf<String>()

        var currentBubble = StringBuilder()
        for (part in parts) {
            if (currentBubble.isEmpty()) {
                currentBubble.append(part)
            } else if (currentBubble.length + part.length + 2 <= maxBubbleChunkChars) {
                currentBubble.append("\n\n").append(part)
            } else {
                bubbles.add(currentBubble.toString().trim())
                currentBubble = StringBuilder(part)
                if (bubbles.size >= maxBubbles - 1) {
                    break
                }
            }
        }
        if (currentBubble.isNotEmpty()) {
            bubbles.add(currentBubble.toString().trim())
        }

        return bubbles.take(maxBubbles)
    }
}
