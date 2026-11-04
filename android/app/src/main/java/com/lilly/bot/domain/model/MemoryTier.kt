package com.lilly.bot.domain.model

enum class MemoryTier(val dirName: String, val defaultRetentionDays: Int) {
    PERM("permTerm", Int.MAX_VALUE),
    LONG("longTerm", 365),
    MED("medTerm", 120),
    SHORT("shortTerm", 30),
    MEDIA("media", 30);

    companion object {
        fun fromDirName(name: String): MemoryTier? {
            return entries.find { it.dirName.equals(name, ignoreCase = true) }
        }
    }
}

data class MemoryItem(
    val filename: String,
    val tier: MemoryTier,
    val content: String,
    val lastModified: Long,
    val sizeBytes: Long
)
