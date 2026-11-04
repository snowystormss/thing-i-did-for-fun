package com.lilly.bot.domain.brain

import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.Charset
import java.nio.charset.CodingErrorAction
import java.nio.charset.StandardCharsets

object SanitizationUtils {

    /**
     * Attempts to decode rawBytes as strict UTF-8 (reporting coding errors).
     * On CharacterCodingException, decodes using Windows-1252.
     * Strips any leading Unicode Byte Order Mark (\uFEFF).
     */
    fun robustDecode(rawBytes: ByteArray): String {
        return try {
            val decoder = StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
            val charBuffer = decoder.decode(ByteBuffer.wrap(rawBytes))
            charBuffer.toString().removePrefix("\uFEFF")
        } catch (e: CharacterCodingException) {
            val winCharset = Charset.forName("windows-1252")
            winCharset.decode(ByteBuffer.wrap(rawBytes)).toString().removePrefix("\uFEFF")
        }
    }

    /**
     * Replaces smart typography and non-standard spacing with standard ASCII equivalents.
     */
    fun sanitizeSmartChars(text: String): String {
        return text
            .replace('\u2018', '\'')
            .replace('\u2019', '\'')
            .replace('\u201A', ',')
            .replace('\u201B', '\'')
            .replace('\u201C', '"')
            .replace('\u201D', '"')
            .replace('\u201E', '"')
            .replace('\u2013', '-')
            .replace("\u2014", "--")
            .replace("\u2026", "...")
            .replace('\u00A0', ' ')
            .replace("\u00AD", "")
            .replace('\u2022', '*')
            .replace('\u2212', '-')
            .replace('\u00B4', '\'')
    }

    /**
     * Converts arbitrary string into a filesystem-safe lowercase slug.
     */
    fun safeSlug(text: String): String {
        return text.lowercase()
            .replace(Regex("[^a-z0-9]+"), "_")
            .trim('_')
            .ifEmpty { "note" }
    }
}
