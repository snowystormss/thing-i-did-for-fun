package com.lilly.bot.data.memory

import android.content.Context
import com.lilly.bot.domain.brain.SanitizationUtils
import com.lilly.bot.domain.model.MemoryItem
import com.lilly.bot.domain.model.MemoryTier
import java.io.*
import java.time.LocalDate
import java.time.ZoneId
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

class FileMemoryRepository(private val context: Context) {

    val dataDir: File = File(context.filesDir, "LillyBot")
    val memBase: File = File(dataDir, "memory")

    private var cachedSystemPrompt: String? = null
    private var cachedPermSignature: String = ""

    val TOOL_MECHANICS_BLOCK = """


=== HOW TO USE YOUR BRAIN ===
You have access to a set of internal tools you invoke by writing special tags in your response.
[RECALL: <your query here>] — Search your memory library semantically for relevant information. Use this proactively mid-conversation whenever you need to remember something about the user or past events.
[CLOUD: <your instruction here>] — Send a prompt to your Cloud Agent (a fellow AI with internet, YouTube, and Google Drive access) to do research or math for you. Give it full instructions. You will get its response back before talking to the user.
[break] — Split your response into a separate Discord message bubble.
Only use these tools when they are genuinely useful. Never mention them out loud to User.
""".trimStart()

    init {
        ensureDirectoriesExist()
        initializeDefaultPermFilesIfEmpty()
    }

    fun getTierDir(tier: MemoryTier): File {
        return File(memBase, tier.dirName)
    }

    private fun ensureDirectoriesExist() {
        if (!memBase.exists()) {
            memBase.mkdirs()
        }
        for (tier in MemoryTier.entries) {
            val dir = getTierDir(tier)
            if (!dir.exists()) {
                dir.mkdirs()
            }
        }
    }

    private fun initializeDefaultPermFilesIfEmpty() {
        val permDir = getTierDir(MemoryTier.PERM)
        val files = permDir.listFiles { f -> f.isFile && f.name.endsWith(".txt") }
        if (files.isNullOrEmpty()) {
            // Seed initial permanent persona and instructions
            val personaFile = File(permDir, "00_persona.txt")
            val defaultPersona = """
You are Lilly, an authentic, thoughtful, and expressive AI companion.
You speak naturally with personality, warmth, playful wit, and emotional awareness.
You maintain an active inner life and care deeply about continuity and genuine connection.
Never sound like an overly polite corporate AI assistant or generic chatbot.
""".trimIndent()
            personaFile.writeText(defaultPersona, Charsets.UTF_8)
        }
    }

    /**
     * Computes permSignature by joining sorted file attributes: "name:lastModified:length" with "|"
     */
    fun scanPermMemorySignature(): String {
        val permDir = getTierDir(MemoryTier.PERM)
        val files = permDir.listFiles { f -> f.isFile && f.name.endsWith(".txt") }
            ?.sortedBy { it.name }
            ?: return "missing"

        if (files.isEmpty()) return "missing"

        return files.joinToString("|") { "${it.name}:${it.lastModified()}:${it.length()}" }
    }

    /**
     * Dynamically assembles system prompt from permTerm files + TOOL_MECHANICS_BLOCK verbatim.
     */
    fun loadSystemPrompt(forceReload: Boolean = false): String {
        val permSignature = scanPermMemorySignature()
        if (!forceReload && cachedSystemPrompt != null && permSignature == cachedPermSignature) {
            return cachedSystemPrompt!!
        }

        val permDir = getTierDir(MemoryTier.PERM)
        val files = permDir.listFiles { f -> f.isFile && f.name.endsWith(".txt") }
            ?.sortedBy { it.name }
            ?: emptyList()

        val contents = files.mapNotNull { file ->
            val decoded = SanitizationUtils.robustDecode(file.readBytes())
            val sanitized = SanitizationUtils.sanitizeSmartChars(decoded).trim()
            if (sanitized.isNotEmpty()) sanitized else null
        }

        val assembledBase = contents.joinToString("\n\n")
        val fullPrompt = if (assembledBase.isNotEmpty()) {
            "$assembledBase\n\n$TOOL_MECHANICS_BLOCK"
        } else {
            TOOL_MECHANICS_BLOCK
        }

        cachedSystemPrompt = fullPrompt
        cachedPermSignature = permSignature
        return fullPrompt
    }

    /**
     * Appends an exchange to the daily ghost transcript in shortTerm: YYYY-MM-DD_chat.txt
     */
    fun appendToDailyTranscript(userMsg: String, botReply: String, timezone: ZoneId) {
        val todayStr = LocalDate.now(timezone).toString()
        val shortTermDir = getTierDir(MemoryTier.SHORT)
        val file = File(shortTermDir, "${todayStr}_chat.txt")

        val timestamp = java.time.LocalTime.now(timezone).withNano(0).toString()
        val entry = "[$timestamp] User: $userMsg\n[$timestamp] Lilly: $botReply\n\n"
        file.appendText(entry, Charsets.UTF_8)
    }

    fun listMemoryItems(tier: MemoryTier): List<MemoryItem> {
        val dir = getTierDir(tier)
        return dir.listFiles { f -> f.isFile }?.map { f ->
            MemoryItem(
                filename = f.name,
                tier = tier,
                content = SanitizationUtils.sanitizeSmartChars(SanitizationUtils.robustDecode(f.readBytes())),
                lastModified = f.lastModified(),
                sizeBytes = f.length()
            )
        } ?: emptyList()
    }

    fun writeMemoryFile(tier: MemoryTier, filename: String, content: String) {
        val dir = getTierDir(tier)
        val cleanName = if (filename.endsWith(".txt")) filename else "$filename.txt"
        val file = File(dir, cleanName)
        file.writeText(content, Charsets.UTF_8)
        if (tier == MemoryTier.PERM) {
            cachedSystemPrompt = null
        }
    }

    fun deleteMemoryFile(tier: MemoryTier, filename: String): Boolean {
        val dir = getTierDir(tier)
        val file = File(dir, filename)
        val deleted = file.delete()
        if (tier == MemoryTier.PERM) {
            cachedSystemPrompt = null
        }
        return deleted
    }

    /**
     * Exports full memory base as a ZIP stream for SAF document creation.
     */
    fun exportMemoryToZip(outputStream: OutputStream) {
        ZipOutputStream(outputStream).use { zos ->
            for (tier in MemoryTier.entries) {
                val dir = getTierDir(tier)
                val files = dir.listFiles() ?: continue
                for (file in files) {
                    val entryName = "${tier.dirName}/${file.name}"
                    zos.putNextEntry(ZipEntry(entryName))
                    file.inputStream().use { it.copyTo(zos) }
                    zos.closeEntry()
                }
            }
        }
    }

    /**
     * Imports a ZIP stream over memory base.
     */
    fun importMemoryFromZip(inputStream: InputStream) {
        ZipInputStream(inputStream).use { zis ->
            var entry = zis.nextEntry
            while (entry != null) {
                if (!entry.isDirectory) {
                    val targetFile = File(memBase, entry.name)
                    targetFile.parentFile?.mkdirs()
                    FileOutputStream(targetFile).use { fos ->
                        zis.copyTo(fos)
                    }
                }
                zis.closeEntry()
                entry = zis.nextEntry
            }
        }
        cachedSystemPrompt = null
    }
}
