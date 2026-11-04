package com.lilly.bot.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lilly.bot.data.storage.InferenceProviderMode
import com.lilly.bot.data.storage.RetrieverMode
import com.lilly.bot.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: LillyViewModel,
    modifier: Modifier = Modifier
) {
    val settings by viewModel.settings.collectAsState()
    val apiKey by viewModel.apiKeyInput.collectAsState()
    val cloudApiKey by viewModel.cloudApiKeyInput.collectAsState()

    var tempApiKey by remember(apiKey) { mutableStateOf(apiKey) }
    var tempCloudApiKey by remember(cloudApiKey) { mutableStateOf(cloudApiKey) }
    val scrollState = rememberScrollState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings & Brain Config", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface,
                    titleContentColor = TextPrimary
                )
            )
        },
        containerColor = DarkBackground,
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Section A: Inference & Provider Settings
            SettingsSectionHeader("A. Inference & Provider")

            // Provider Mode
            Text("Inference Provider Mode", color = TextSecondary, fontSize = 13.sp)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = settings.inferenceProviderMode == InferenceProviderMode.OPENAI_COMPATIBLE,
                    onClick = { viewModel.updateSettings(settings.copy(inferenceProviderMode = InferenceProviderMode.OPENAI_COMPATIBLE)) },
                    label = { Text("OpenAI-Compatible") }
                )
                FilterChip(
                    selected = settings.inferenceProviderMode == InferenceProviderMode.GEMINI_NATIVE,
                    onClick = { viewModel.updateSettings(settings.copy(inferenceProviderMode = InferenceProviderMode.GEMINI_NATIVE)) },
                    label = { Text("Gemini Native") }
                )
            }

            // API Key
            OutlinedTextField(
                value = tempApiKey,
                onValueChange = {
                    tempApiKey = it
                    viewModel.setApiKey(it)
                },
                label = { Text("Primary API Key (OpenAI or Gemini)") },
                placeholder = { Text("None (Required to speak with Lilly)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AccentPurple,
                    unfocusedBorderColor = DarkBorder,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            // API URL (for OpenAI compatible)
            if (settings.inferenceProviderMode == InferenceProviderMode.OPENAI_COMPATIBLE) {
                OutlinedTextField(
                    value = settings.apiUrl,
                    onValueChange = { viewModel.updateSettings(settings.copy(apiUrl = it)) },
                    label = { Text("API URL") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = AccentPurple,
                        unfocusedBorderColor = DarkBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )
            }

            // Model Name
            OutlinedTextField(
                value = settings.modelName,
                onValueChange = { viewModel.updateSettings(settings.copy(modelName = it)) },
                label = { Text("Model Name") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = AccentPurple,
                    unfocusedBorderColor = DarkBorder,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            // Temperature Slider
            Column {
                Text("Temperature: ${String.format("%.2f", settings.temperature)}", color = TextSecondary, fontSize = 13.sp)
                Slider(
                    value = settings.temperature,
                    onValueChange = { viewModel.updateSettings(settings.copy(temperature = it)) },
                    valueRange = 0.0f..1.5f,
                    colors = SliderDefaults.colors(
                        thumbColor = AccentPurple,
                        activeTrackColor = AccentPurple
                    )
                )
            }

            // Token Limits
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = settings.modelContextTokens.toString(),
                    onValueChange = { it.toIntOrNull()?.let { v -> viewModel.updateSettings(settings.copy(modelContextTokens = v)) } },
                    label = { Text("Context Tokens") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
                )
                OutlinedTextField(
                    value = settings.responseTokenReserve.toString(),
                    onValueChange = { it.toIntOrNull()?.let { v -> viewModel.updateSettings(settings.copy(responseTokenReserve = v)) } },
                    label = { Text("Reserve Tokens") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
                )
            }

            // Streaming Preview Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Stream Preview", color = TextPrimary, fontSize = 15.sp)
                    Text("Live token streaming edits", color = TextSecondary, fontSize = 12.sp)
                }
                Switch(
                    checked = settings.streamPreviewEnabled,
                    onCheckedChange = { viewModel.updateSettings(settings.copy(streamPreviewEnabled = it)) }
                )
            }

            // Section B: Cloud Search & Retriever
            SettingsSectionHeader("B. Cloud Search & Retriever")

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Enable Cloud Agent [CLOUD]", color = TextPrimary, fontSize = 15.sp)
                    Text("Allows internet research & math via Cloud Agent", color = TextSecondary, fontSize = 12.sp)
                }
                Switch(
                    checked = settings.cloudSearchEnabled,
                    onCheckedChange = { viewModel.updateSettings(settings.copy(cloudSearchEnabled = it)) }
                )
            }

            OutlinedTextField(
                value = tempCloudApiKey,
                onValueChange = {
                    tempCloudApiKey = it
                    viewModel.setCloudApiKey(it)
                },
                label = { Text("Cloud Agent API Key (Optional fallback)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
            )

            // Section C: Timers & Retention
            SettingsSectionHeader("C. Timers, Retention, & Sleep")

            OutlinedTextField(
                value = settings.timezoneName,
                onValueChange = { viewModel.updateSettings(settings.copy(timezoneName = it)) },
                label = { Text("Timezone (ZoneId)") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
            )

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = settings.idleSortAfterMinutes.toString(),
                    onValueChange = { it.toIntOrNull()?.let { v -> viewModel.updateSettings(settings.copy(idleSortAfterMinutes = v)) } },
                    label = { Text("Idle Sleep (min)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
                )
                OutlinedTextField(
                    value = settings.dreamShutdownMinutes.toString(),
                    onValueChange = { it.toIntOrNull()?.let { v -> viewModel.updateSettings(settings.copy(dreamShutdownMinutes = v)) } },
                    label = { Text("Dream Deep (min)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = settings.shortTermRetentionDays.toString(),
                    onValueChange = { it.toIntOrNull()?.let { v -> viewModel.updateSettings(settings.copy(shortTermRetentionDays = v)) } },
                    label = { Text("Short-term (days)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
                )
                OutlinedTextField(
                    value = settings.longTermRetentionDays.toString(),
                    onValueChange = { it.toIntOrNull()?.let { v -> viewModel.updateSettings(settings.copy(longTermRetentionDays = v)) } },
                    label = { Text("Long-term (days)") },
                    modifier = Modifier.weight(1f),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = AccentPurple, unfocusedBorderColor = DarkBorder)
                )
            }
        }
    }
}

@Composable
fun SettingsSectionHeader(title: String) {
    Text(
        text = title,
        color = AccentPurple,
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.padding(top = 8.dp)
    )
}
