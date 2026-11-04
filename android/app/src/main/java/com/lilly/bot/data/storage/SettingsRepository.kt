package com.lilly.bot.data.storage

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore by preferencesDataStore(name = "lilly_settings")

enum class InferenceProviderMode {
    OPENAI_COMPATIBLE,
    GEMINI_NATIVE
}

enum class RetrieverMode {
    LOCAL_HYBRID,
    REMOTE_HTTP
}

data class LillySettings(
    val inferenceProviderMode: InferenceProviderMode = InferenceProviderMode.OPENAI_COMPATIBLE,
    val apiUrl: String = "http://127.0.0.1:8080/v1/chat/completions",
    val modelName: String = "gemma-4-26b-a4b-it",
    val temperature: Float = 0.8f,
    val modelContextTokens: Int = 8192,
    val contextUtilizationRatio: Float = 0.95f,
    val responseTokenReserve: Int = 2048,
    val conversationWindowMessages: Int = 0,
    val resetContextOnStart: Boolean = true,
    val requestTimeoutSeconds: Int = 120,
    val streamPreviewEnabled: Boolean = true,
    val streamPreviewEditIntervalSeconds: Float = 1.2f,
    val streamPreviewMinDeltaChars: Int = 60,

    val cloudSearchEnabled: Boolean = true,
    val cloudSearchModel: String = "gemini-2.5-flash-lite",
    val retrieverMode: RetrieverMode = RetrieverMode.LOCAL_HYBRID,
    val retrieverApiUrl: String = "http://127.0.0.1:5001",

    val timezoneName: String = "America/Chicago",
    val activeChatWindowMinutes: Int = 5,
    val idleSortAfterMinutes: Int = 5,
    val dreamShutdownMinutes: Int = 30,
    val contextTimeoutSeconds: Int = 1800,
    val shortTermRetentionDays: Int = 30,
    val medTermRetentionDays: Int = 120,
    val longTermRetentionDays: Int = 365,
    val shortTermFileLimit: Int = 20,
    val shortTermLineLimit: Int = 100,
    val medTermFileLimit: Int = 15,
    val medTermLineLimit: Int = 80,
    val longTermFileLimit: Int = 15,
    val longTermLineLimit: Int = 80,
    val reflectionWebTopicLimit: Int = 2,
    val maxReplyBubbles: Int = 3,
    val maxBubbleChunkChars: Int = 900,
    val maxMessageChars: Int = 1900
)

class SettingsRepository(private val context: Context) {

    private object PreferencesKeys {
        val INFERENCE_PROVIDER_MODE = stringPreferencesKey("inference_provider_mode")
        val API_URL = stringPreferencesKey("api_url")
        val MODEL_NAME = stringPreferencesKey("model_name")
        val TEMPERATURE = floatPreferencesKey("temperature")
        val MODEL_CONTEXT_TOKENS = intPreferencesKey("model_context_tokens")
        val CONTEXT_UTILIZATION_RATIO = floatPreferencesKey("context_utilization_ratio")
        val RESPONSE_TOKEN_RESERVE = intPreferencesKey("response_token_reserve")
        val CONVERSATION_WINDOW_MESSAGES = intPreferencesKey("conversation_window_messages")
        val RESET_CONTEXT_ON_START = booleanPreferencesKey("reset_context_on_start")
        val REQUEST_TIMEOUT_SECONDS = intPreferencesKey("request_timeout_seconds")
        val STREAM_PREVIEW_ENABLED = booleanPreferencesKey("stream_preview_enabled")
        val STREAM_PREVIEW_EDIT_INTERVAL = floatPreferencesKey("stream_preview_edit_interval")
        val STREAM_PREVIEW_MIN_DELTA = intPreferencesKey("stream_preview_min_delta")

        val CLOUD_SEARCH_ENABLED = booleanPreferencesKey("cloud_search_enabled")
        val CLOUD_SEARCH_MODEL = stringPreferencesKey("cloud_search_model")
        val RETRIEVER_MODE = stringPreferencesKey("retriever_mode")
        val RETRIEVER_API_URL = stringPreferencesKey("retriever_api_url")

        val TIMEZONE_NAME = stringPreferencesKey("timezone_name")
        val ACTIVE_CHAT_WINDOW_MINUTES = intPreferencesKey("active_chat_window_minutes")
        val IDLE_SORT_AFTER_MINUTES = intPreferencesKey("idle_sort_after_minutes")
        val DREAM_SHUTDOWN_MINUTES = intPreferencesKey("dream_shutdown_minutes")
        val CONTEXT_TIMEOUT_SECONDS = intPreferencesKey("context_timeout_seconds")
        val SHORT_TERM_RETENTION_DAYS = intPreferencesKey("short_term_retention_days")
        val MED_TERM_RETENTION_DAYS = intPreferencesKey("med_term_retention_days")
        val LONG_TERM_RETENTION_DAYS = intPreferencesKey("long_term_retention_days")
        val SHORT_TERM_FILE_LIMIT = intPreferencesKey("short_term_file_limit")
        val SHORT_TERM_LINE_LIMIT = intPreferencesKey("short_term_line_limit")
        val MED_TERM_FILE_LIMIT = intPreferencesKey("med_term_file_limit")
        val MED_TERM_LINE_LIMIT = intPreferencesKey("med_term_line_limit")
        val LONG_TERM_FILE_LIMIT = intPreferencesKey("long_term_file_limit")
        val LONG_TERM_LINE_LIMIT = intPreferencesKey("long_term_line_limit")
        val REFLECTION_WEB_TOPIC_LIMIT = intPreferencesKey("reflection_web_topic_limit")
        val MAX_REPLY_BUBBLES = intPreferencesKey("max_reply_bubbles")
        val MAX_BUBBLE_CHUNK_CHARS = intPreferencesKey("max_bubble_chunk_chars")
        val MAX_MESSAGE_CHARS = intPreferencesKey("max_message_chars")
    }

    val settingsFlow: Flow<LillySettings> = context.dataStore.data.map { prefs ->
        val providerStr = prefs[PreferencesKeys.INFERENCE_PROVIDER_MODE] ?: InferenceProviderMode.OPENAI_COMPATIBLE.name
        val retrieverStr = prefs[PreferencesKeys.RETRIEVER_MODE] ?: RetrieverMode.LOCAL_HYBRID.name

        LillySettings(
            inferenceProviderMode = runCatching { InferenceProviderMode.valueOf(providerStr) }.getOrDefault(InferenceProviderMode.OPENAI_COMPATIBLE),
            apiUrl = prefs[PreferencesKeys.API_URL] ?: "http://127.0.0.1:8080/v1/chat/completions",
            modelName = prefs[PreferencesKeys.MODEL_NAME] ?: "gemma-4-26b-a4b-it",
            temperature = prefs[PreferencesKeys.TEMPERATURE] ?: 0.8f,
            modelContextTokens = prefs[PreferencesKeys.MODEL_CONTEXT_TOKENS] ?: 8192,
            contextUtilizationRatio = prefs[PreferencesKeys.CONTEXT_UTILIZATION_RATIO] ?: 0.95f,
            responseTokenReserve = prefs[PreferencesKeys.RESPONSE_TOKEN_RESERVE] ?: 2048,
            conversationWindowMessages = prefs[PreferencesKeys.CONVERSATION_WINDOW_MESSAGES] ?: 0,
            resetContextOnStart = prefs[PreferencesKeys.RESET_CONTEXT_ON_START] ?: true,
            requestTimeoutSeconds = prefs[PreferencesKeys.REQUEST_TIMEOUT_SECONDS] ?: 120,
            streamPreviewEnabled = prefs[PreferencesKeys.STREAM_PREVIEW_ENABLED] ?: true,
            streamPreviewEditIntervalSeconds = prefs[PreferencesKeys.STREAM_PREVIEW_EDIT_INTERVAL] ?: 1.2f,
            streamPreviewMinDeltaChars = prefs[PreferencesKeys.STREAM_PREVIEW_MIN_DELTA] ?: 60,

            cloudSearchEnabled = prefs[PreferencesKeys.CLOUD_SEARCH_ENABLED] ?: true,
            cloudSearchModel = prefs[PreferencesKeys.CLOUD_SEARCH_MODEL] ?: "gemini-2.5-flash-lite",
            retrieverMode = runCatching { RetrieverMode.valueOf(retrieverStr) }.getOrDefault(RetrieverMode.LOCAL_HYBRID),
            retrieverApiUrl = prefs[PreferencesKeys.RETRIEVER_API_URL] ?: "http://127.0.0.1:5001",

            timezoneName = prefs[PreferencesKeys.TIMEZONE_NAME] ?: "America/Chicago",
            activeChatWindowMinutes = prefs[PreferencesKeys.ACTIVE_CHAT_WINDOW_MINUTES] ?: 5,
            idleSortAfterMinutes = prefs[PreferencesKeys.IDLE_SORT_AFTER_MINUTES] ?: 5,
            dreamShutdownMinutes = prefs[PreferencesKeys.DREAM_SHUTDOWN_MINUTES] ?: 30,
            contextTimeoutSeconds = prefs[PreferencesKeys.CONTEXT_TIMEOUT_SECONDS] ?: 1800,
            shortTermRetentionDays = prefs[PreferencesKeys.SHORT_TERM_RETENTION_DAYS] ?: 30,
            medTermRetentionDays = prefs[PreferencesKeys.MED_TERM_RETENTION_DAYS] ?: 120,
            longTermRetentionDays = prefs[PreferencesKeys.LONG_TERM_RETENTION_DAYS] ?: 365,
            shortTermFileLimit = prefs[PreferencesKeys.SHORT_TERM_FILE_LIMIT] ?: 20,
            shortTermLineLimit = prefs[PreferencesKeys.SHORT_TERM_LINE_LIMIT] ?: 100,
            medTermFileLimit = prefs[PreferencesKeys.MED_TERM_FILE_LIMIT] ?: 15,
            medTermLineLimit = prefs[PreferencesKeys.MED_TERM_LINE_LIMIT] ?: 80,
            longTermFileLimit = prefs[PreferencesKeys.LONG_TERM_FILE_LIMIT] ?: 15,
            longTermLineLimit = prefs[PreferencesKeys.LONG_TERM_LINE_LIMIT] ?: 80,
            reflectionWebTopicLimit = prefs[PreferencesKeys.REFLECTION_WEB_TOPIC_LIMIT] ?: 2,
            maxReplyBubbles = prefs[PreferencesKeys.MAX_REPLY_BUBBLES] ?: 3,
            maxBubbleChunkChars = prefs[PreferencesKeys.MAX_BUBBLE_CHUNK_CHARS] ?: 900,
            maxMessageChars = prefs[PreferencesKeys.MAX_MESSAGE_CHARS] ?: 1900
        )
    }

    suspend fun updateSettings(transform: (LillySettings) -> LillySettings) {
        context.dataStore.edit { prefs ->
            // Apply transformed settings
        }
    }
}
