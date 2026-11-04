package com.lilly.bot.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.lilly.bot.data.memory.FileMemoryRepository
import com.lilly.bot.data.memory.LocalHybridRetriever
import com.lilly.bot.data.network.CloudSearchClient
import com.lilly.bot.data.network.GeminiClient
import com.lilly.bot.data.network.InferenceClient
import com.lilly.bot.data.network.OpenAiClient
import com.lilly.bot.data.storage.InferenceProviderMode
import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.data.storage.SecureCredentials
import com.lilly.bot.data.storage.SettingsRepository
import com.lilly.bot.domain.brain.LillyBrain
import com.lilly.bot.domain.model.ChatMessage
import com.lilly.bot.domain.model.CompanionMode
import com.lilly.bot.domain.model.LillyCompanionState
import com.lilly.bot.domain.model.MemoryItem
import com.lilly.bot.domain.model.MemoryTier
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.InputStream
import java.io.OutputStream

class LillyViewModel(application: Application) : AndroidViewModel(application) {

    val memoryRepo = FileMemoryRepository(application)
    val retriever = LocalHybridRetriever(memoryRepo)
    val cloudClient = CloudSearchClient()
    val credentials = SecureCredentials(application)
    val settingsRepo = SettingsRepository(application)

    val brain = LillyBrain(
        memoryRepo = memoryRepo,
        retriever = retriever,
        cloudClient = cloudClient,
        credentials = credentials
    )

    val messages: StateFlow<List<ChatMessage>> = brain.messages
    val companionState: StateFlow<LillyCompanionState> = brain.companionState

    private val _settings = MutableStateFlow(LillySettings())
    val settings: StateFlow<LillySettings> = _settings.asStateFlow()

    private val _currentTierFiles = MutableStateFlow<List<MemoryItem>>(emptyList())
    val currentTierFiles: StateFlow<List<MemoryItem>> = _currentTierFiles.asStateFlow()

    private val _selectedTier = MutableStateFlow(MemoryTier.PERM)
    val selectedTier: StateFlow<MemoryTier> = _selectedTier.asStateFlow()

    private val _apiKeyInput = MutableStateFlow(credentials.apiKey)
    val apiKeyInput: StateFlow<String> = _apiKeyInput.asStateFlow()

    private val _cloudApiKeyInput = MutableStateFlow(credentials.cloudSearchApiKey)
    val cloudApiKeyInput: StateFlow<String> = _cloudApiKeyInput.asStateFlow()

    init {
        viewModelScope.launch {
            _settings.value = settingsRepo.settingsFlow.first()
            loadMemoryTier(MemoryTier.PERM)
        }
    }

    fun setApiKey(key: String) {
        _apiKeyInput.value = key
        credentials.apiKey = key
    }

    fun setCloudApiKey(key: String) {
        _cloudApiKeyInput.value = key
        credentials.cloudSearchApiKey = key
    }

    fun updateSettings(newSettings: LillySettings) {
        _settings.value = newSettings
        viewModelScope.launch {
            settingsRepo.updateSettings { newSettings }
        }
    }

    fun sendMessage(text: String) {
        if (text.isBlank()) return
        viewModelScope.launch {
            val currentSettings = _settings.value
            val client: InferenceClient = when (currentSettings.inferenceProviderMode) {
                InferenceProviderMode.OPENAI_COMPATIBLE -> OpenAiClient()
                InferenceProviderMode.GEMINI_NATIVE -> GeminiClient()
            }

            brain.sendMessage(
                userInput = text,
                settings = currentSettings,
                inferenceClient = client
            )
        }
    }

    fun clearChat() {
        brain.clearHistory()
    }

    fun loadMemoryTier(tier: MemoryTier) {
        _selectedTier.value = tier
        viewModelScope.launch {
            _currentTierFiles.value = memoryRepo.listMemoryItems(tier)
        }
    }

    fun saveMemoryFile(tier: MemoryTier, filename: String, content: String) {
        memoryRepo.writeMemoryFile(tier, filename, content)
        loadMemoryTier(tier)
    }

    fun deleteMemoryFile(tier: MemoryTier, filename: String) {
        memoryRepo.deleteMemoryFile(tier, filename)
        loadMemoryTier(tier)
    }

    fun exportMemory(outStream: OutputStream) {
        memoryRepo.exportMemoryToZip(outStream)
    }

    fun importMemory(inStream: InputStream) {
        memoryRepo.importMemoryFromZip(inStream)
        loadMemoryTier(_selectedTier.value)
    }
}
