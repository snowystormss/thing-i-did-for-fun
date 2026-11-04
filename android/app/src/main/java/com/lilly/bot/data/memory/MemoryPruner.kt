package com.lilly.bot.data.memory

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.MemoryTier
import java.io.File
import java.util.concurrent.TimeUnit

class MemoryPruner(
    private val repository: FileMemoryRepository
) {

    data class PruneReport(
        val filesDeleted: Int,
        val filesTruncated: Int,
        val details: List<String>
    )

    fun runPrune(settings: LillySettings, now: Long = System.currentTimeMillis()): PruneReport {
        var deletedCount = 0
        var truncatedCount = 0
        val logs = mutableListOf<String>()

        val retentionMap = mapOf(
            MemoryTier.SHORT to Pair(settings.shortTermRetentionDays, settings.shortTermFileLimit),
            MemoryTier.MED to Pair(settings.medTermRetentionDays, settings.medTermFileLimit),
            MemoryTier.LONG to Pair(settings.longTermRetentionDays, settings.longTermFileLimit),
            MemoryTier.MEDIA to Pair(settings.shortTermRetentionDays, 50)
        )

        val lineLimitMap = mapOf(
            MemoryTier.SHORT to settings.shortTermLineLimit,
            MemoryTier.MED to settings.medTermLineLimit,
            MemoryTier.LONG to settings.longTermLineLimit
        )

        for ((tier, limits) in retentionMap) {
            val (retentionDays, fileLimit) = limits
            val dir = repository.getTierDir(tier)
            val files = dir.listFiles { f -> f.isFile }?.toList() ?: continue

            val maxAgeMillis = TimeUnit.DAYS.toMillis(retentionDays.toLong())

            // 1. Age-based pruning
            for (file in files) {
                val age = now - file.lastModified()
                if (age > maxAgeMillis) {
                    if (file.delete()) {
                        deletedCount++
                        logs.add("Pruned expired file from ${tier.dirName}: ${file.name}")
                    }
                }
            }

            // 2. File count limit (keep newest)
            val remainingFiles = dir.listFiles { f -> f.isFile }?.sortedByDescending { it.lastModified() } ?: emptyList()
            if (remainingFiles.size > fileLimit) {
                val excess = remainingFiles.drop(fileLimit)
                for (file in excess) {
                    if (file.delete()) {
                        deletedCount++
                        logs.add("Pruned excess file over limit ($fileLimit) from ${tier.dirName}: ${file.name}")
                    }
                }
            }

            // 3. Line limit enforcement
            val lineLimit = lineLimitMap[tier] ?: continue
            val currentFiles = dir.listFiles { f -> f.isFile && f.name.endsWith(".txt") } ?: continue
            for (file in currentFiles) {
                val lines = file.readLines(Charsets.UTF_8)
                if (lines.size > lineLimit) {
                    val truncated = lines.takeLast(lineLimit).joinToString("\n")
                    file.writeText(truncated, Charsets.UTF_8)
                    truncatedCount++
                    logs.add("Truncated ${file.name} to last $lineLimit lines")
                }
            }
        }

        return PruneReport(deletedCount, truncatedCount, logs)
    }
}
