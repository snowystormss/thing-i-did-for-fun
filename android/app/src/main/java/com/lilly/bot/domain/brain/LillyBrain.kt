package com.lilly.bot.domain.brain

import com.lilly.bot.data.memory.FileMemoryRepository
import com.lilly.bot.data.memory.LocalHybridRetriever
import com.lilly.bot.data.network.CloudSearchClient
import com.lilly.bot.data.network.InferenceClient
import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.data.storage.SecureCredentials
import com.lilly.bot.domain.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.ZoneId

class LillyBrain(
    private val memoryRepo: FileMemoryRepository,
    private val retriever: LocalHybridRetriever,
    private val cloudClient: CloudSearchClient,
    private val credentials: SecureCredentials,
    val sleepMachine: SleepStateMachine = SleepStateMachine(),
    val budgeter: TokenBudgeter = TokenBudgeter()
) {
    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _companionState = MutableStateFlow(LillyCompanionState())
    val companionState: StateFlow<LillyCompanionState> = _companionState.asStateFlow()

    fun getSystemPrompt(forceReload: Boolean = false): String {
        return memoryRepo.loadSystemPrompt(forceReload)
    }

    fun clearHistory() {
        _messages.value = emptyList()
    }

    /**
     * Main conversation turn: processes user input, manages sleep states,
     * performs token budgeting, executes tool loops, and splits reply bubbles.
     */
    suspend fun sendMessage(
        userInput: String,
        settings: LillySettings,
        inferenceClient: InferenceClient,
        onStreamPreview: ((String) -> Unit)? = null
    ): List<String> {
        val apiKey = credentials.apiKey
        if (apiKey.isBlank()) {
            val errorMsg = "API Key is required to speak with Lilly. Please configure your key in Settings."
            val errBubble = ChatMessage(role = Role.ASSISTANT, content = errorMsg, bubbles = listOf(errorMsg))
            _messages.value = _messages.value + errBubble
            return listOf(errorMsg)
        }

        val now = System.currentTimeMillis()
        val wakeResult = sleepMachine.onUserMessageReceived(now)
        _companionState.value = sleepMachine.getCurrentState()

        if (wakeResult.shouldResetContext && settings.resetContextOnStart) {
            clearHistory()
        }

        // Add user message
        val userMsg = ChatMessage(
            role = Role.USER,
            content = userInput,
            estimatedTokens = budgeter.estimateTokens(userInput)
        )
        _messages.value = _messages.value + userMsg

        // Assemble base system prompt
        var systemPrompt = memoryRepo.loadSystemPrompt()
        if (wakeResult.wakingPromptPrefix.isNotEmpty()) {
            systemPrompt = "${wakeResult.wakingPromptPrefix}\n\n$systemPrompt"
        }

        val timezone = try {
            ZoneId.of(settings.timezoneName)
        } catch (e: Exception) {
            ZoneId.of("America/Chicago")
        }

        val workingHistory = _messages.value.toMutableList()
        val executedTools = mutableListOf<ToolInvocation>()

        var currentAttempt = 0
        val maxToolIterations = 3
        var finalRawResponse = ""

        _companionState.value = _companionState.value.copy(isStreaming = true, streamBuffer = "")

        while (currentAttempt < maxToolIterations) {
            currentAttempt++

            // Budget history before sending
            val sysTokens = budgeter.estimateTokens(systemPrompt)
            val budgetedHistory = budgeter.budgetHistory(workingHistory, sysTokens)

            var streamingAcc = StringBuilder()

            val rawResponse = if (settings.streamPreviewEnabled) {
                inferenceClient.streamCompletion(
                    systemPrompt = systemPrompt,
                    history = budgetedHistory,
                    settings = settings,
                    apiKey = apiKey
                ) { token ->
                    streamingAcc.append(token)
                    val visible = TextParsers.streamVisibleText(streamingAcc.toString())
                    _companionState.value = _companionState.value.copy(streamBuffer = visible)
                    onStreamPreview?.invoke(visible)
                }
            } else {
                inferenceClient.generateCompletion(
                    systemPrompt = systemPrompt,
                    history = budgetedHistory,
                    settings = settings,
                    apiKey = apiKey
                )
            }

            finalRawResponse = rawResponse

            // Check for tool invocations
            val invocations = TextParsers.extractToolInvocations(rawResponse)
            if (invocations.isEmpty()) {
                // Done, no more tools invoked
                break
            }

            // Execute detected tools
            var anyToolExecuted = false
            for (tool in invocations) {
                if (tool.type == ToolType.RECALL) {
                    val recallResults = retriever.recall(tool.query)
                    val snippet = if (recallResults.isNotEmpty()) {
                        recallResults.joinToString("\n\n") { "[Memory from ${it.tier.dirName}/${it.filename}]: ${it.snippet}" }
                    } else {
                        "[No relevant memories found for: '${tool.query}']"
                    }
                    val completed = tool.copy(result = snippet, isCompleted = true)
                    executedTools.add(completed)

                    workingHistory.add(ChatMessage(role = Role.ASSISTANT, content = rawResponse))
                    workingHistory.add(ChatMessage(role = Role.SYSTEM, content = "[RECALL RESULT]:\n$snippet"))
                    anyToolExecuted = true
                } else if (tool.type == ToolType.CLOUD && settings.cloudSearchEnabled) {
                    val cloudKey = credentials.getEffectiveCloudApiKey()
                    val result = cloudClient.executeCloudAgentInstruction(tool.query, settings, cloudKey)
                    val completed = tool.copy(result = result, isCompleted = true)
                    executedTools.add(completed)

                    workingHistory.add(ChatMessage(role = Role.ASSISTANT, content = rawResponse))
                    workingHistory.add(ChatMessage(role = Role.SYSTEM, content = "[CLOUD AGENT RESULT]:\n$result"))
                    anyToolExecuted = true
                }
            }

            if (!anyToolExecuted) {
                break
            }
        }

        _companionState.value = _companionState.value.copy(isStreaming = false, streamBuffer = "")

        // Clean final output and split bubbles
        val bubbles = TextParsers.splitBubbles(
            rawReply = finalRawResponse,
            maxBubbles = settings.maxReplyBubbles,
            maxBubbleChunkChars = settings.maxBubbleChunkChars
        )

        val cleanContent = TextParsers.stripReplyControlTokens(finalRawResponse)

        val assistantMessage = ChatMessage(
            role = Role.ASSISTANT,
            content = cleanContent,
            bubbles = bubbles,
            estimatedTokens = budgeter.estimateTokens(cleanContent),
            triggeredTools = executedTools
        )

        _messages.value = _messages.value + assistantMessage

        // Append to short-term daily transcript
        memoryRepo.appendToDailyTranscript(userInput, cleanContent, timezone)

        return bubbles
    }
}
