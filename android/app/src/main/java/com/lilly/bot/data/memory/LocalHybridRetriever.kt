package com.lilly.bot.data.memory

import com.lilly.bot.domain.model.MemoryTier
import kotlin.math.ln

class LocalHybridRetriever(
    private val repository: FileMemoryRepository
) {

    data class RetrievalResult(
        val tier: MemoryTier,
        val filename: String,
        val snippet: String,
        val score: Float
    )

    /**
     * Executes local keyword / BM25-based memory recall across all tiers.
     */
    fun recall(query: String, maxResults: Int = 3): List<RetrievalResult> {
        val queryTokens = tokenize(query)
        if (queryTokens.isEmpty()) return emptyList()

        val documents = mutableListOf<DocumentChunk>()
        val tiersToSearch = listOf(MemoryTier.PERM, MemoryTier.LONG, MemoryTier.MED, MemoryTier.SHORT)

        for (tier in tiersToSearch) {
            val items = repository.listMemoryItems(tier)
            for (item in items) {
                // Chunk by paragraph or every 4 lines
                val paragraphs = item.content.split(Regex("\\n\\n+")).map { it.trim() }.filter { it.isNotEmpty() }
                for ((idx, para) in paragraphs.withIndex()) {
                    documents.add(
                        DocumentChunk(
                            tier = tier,
                            filename = item.filename,
                            chunkIndex = idx,
                            content = para,
                            tokens = tokenize(para)
                        )
                    )
                }
            }
        }

        if (documents.isEmpty()) return emptyList()

        // BM25 parameters
        val k1 = 1.5f
        val b = 0.75f
        val totalDocs = documents.size
        val avgDocLen = documents.map { it.tokens.size }.average().toFloat().coerceAtLeast(1.0f)

        // Document frequency for query terms
        val docFreq = mutableMapOf<String, Int>()
        for (token in queryTokens) {
            docFreq[token] = documents.count { it.tokens.contains(token) }
        }

        val scoredResults = documents.map { doc ->
            var score = 0.0f
            val docLen = doc.tokens.size.toFloat()

            // Tier priority weights (permTerm and longTerm prioritized)
            val tierMultiplier = when (doc.tier) {
                MemoryTier.PERM -> 1.4f
                MemoryTier.LONG -> 1.25f
                MemoryTier.MED -> 1.1f
                MemoryTier.SHORT -> 1.0f
                MemoryTier.MEDIA -> 0.8f
            }

            for (term in queryTokens) {
                val df = docFreq[term] ?: 0
                if (df == 0) continue

                // IDF calculation
                val idf = ln((totalDocs - df + 0.5f) / (df + 0.5f) + 1.0f)
                val tf = doc.tokens.count { it == term }.toFloat()

                val termScore = idf * ((tf * (k1 + 1.0f)) / (tf + k1 * (1.0f - b + b * (docLen / avgDocLen))))
                score += termScore.toFloat()
            }

            RetrievalResult(
                tier = doc.tier,
                filename = doc.filename,
                snippet = doc.content,
                score = score * tierMultiplier
            )
        }

        return scoredResults
            .filter { it.score > 0.05f }
            .sortedByDescending { it.score }
            .take(maxResults)
    }

    private fun tokenize(text: String): List<String> {
        return text.lowercase()
            .split(Regex("[^a-z0-9]+"))
            .filter { it.length > 2 && !STOP_WORDS.contains(it) }
    }

    private data class DocumentChunk(
        val tier: MemoryTier,
        val filename: String,
        val chunkIndex: Int,
        val content: String,
        val tokens: List<String>
    )

    companion object {
        private val STOP_WORDS = setOf(
            "the", "and", "that", "have", "for", "not", "with", "you", "this",
            "but", "his", "from", "they", "say", "her", "she", "will", "one",
            "all", "would", "there", "their", "what", "out", "about", "who"
        )
    }
}
