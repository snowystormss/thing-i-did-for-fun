package com.lilly.bot.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lilly.bot.domain.model.ChatMessage
import com.lilly.bot.domain.model.CompanionMode
import com.lilly.bot.domain.model.Role
import com.lilly.bot.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LillyChatScreen(
    viewModel: LillyViewModel,
    modifier: Modifier = Modifier
) {
    val messages by viewModel.messages.collectAsState()
    val companionState by viewModel.companionState.collectAsState()
    var inputText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size, companionState.streamBuffer) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Lilly", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold, fontSize = 18.sp)
                        val statusText = when (companionState.mode) {
                            CompanionMode.AWAKE -> "Awake & Alert"
                            CompanionMode.SLEEP_INERTIA -> "Waking up (Sleep Inertia)"
                            CompanionMode.DREAMING -> "Dreaming & Reflecting"
                            CompanionMode.DEEP_SLEEP -> "Deep Sleep / Hibernating"
                        }
                        Text(
                            text = statusText,
                            fontSize = 12.sp,
                            color = when (companionState.mode) {
                                CompanionMode.AWAKE -> AccentEmerald
                                CompanionMode.SLEEP_INERTIA -> AccentAmber
                                else -> TextSecondary
                            }
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.clearChat() }) {
                        Icon(Icons.Default.Delete, contentDescription = "Clear History", tint = TextSecondary)
                    }
                },
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
        ) {
            // Chat message list
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (messages.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                "Start a conversation with Lilly.\nHer responses reflect her 4-tier memory and personality.",
                                color = TextSecondary,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                fontSize = 14.sp
                            )
                        }
                    }
                }

                items(messages, key = { it.id }) { msg ->
                    MessageRow(msg)
                }

                // Streaming preview bubble
                if (companionState.isStreaming && companionState.streamBuffer.isNotEmpty()) {
                    item {
                        StreamingBubble(companionState.streamBuffer)
                    }
                }
            }

            // Input Bar
            Surface(
                color = DarkSurface,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = { Text("Message Lilly...", color = TextSecondary) },
                        modifier = Modifier.weight(1f),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = DarkCard,
                            unfocusedContainerColor = DarkCard,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(24.dp),
                        maxLines = 4
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = {
                            if (inputText.isNotBlank()) {
                                val text = inputText
                                inputText = ""
                                viewModel.sendMessage(text)
                            }
                        },
                        colors = IconButtonDefaults.iconButtonColors(
                            containerColor = AccentPurple,
                            contentColor = Color.White
                        )
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send")
                    }
                }
            }
        }
    }
}

@Composable
fun MessageRow(msg: ChatMessage) {
    val isUser = msg.role == Role.USER

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        if (!isUser && msg.triggeredTools.isNotEmpty()) {
            Row(
                modifier = Modifier.padding(bottom = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    Icons.Default.Psychology,
                    contentDescription = "Tool Used",
                    tint = AccentPurple,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Lilly referenced memory/cloud",
                    fontSize = 11.sp,
                    color = AccentPurple
                )
            }
        }

        if (isUser) {
            Box(
                modifier = Modifier
                    .widthIn(max = 300.dp)
                    .clip(RoundedCornerShape(16.dp, 16.dp, 4.dp, 16.dp))
                    .background(AccentPurple)
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Text(text = msg.content, color = Color.White, fontSize = 15.sp)
            }
        } else {
            // Render multi-bubbles if available
            val displayBubbles = if (msg.bubbles.isNotEmpty()) msg.bubbles else listOf(msg.content)
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                for (bubble in displayBubbles) {
                    Box(
                        modifier = Modifier
                            .widthIn(max = 320.dp)
                            .clip(RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp))
                            .background(DarkCard)
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Text(text = bubble, color = TextPrimary, fontSize = 15.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun StreamingBubble(bufferText: String) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 320.dp)
                .clip(RoundedCornerShape(16.dp, 16.dp, 16.dp, 4.dp))
                .background(DarkCard.copy(alpha = 0.8f))
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Text(text = "$bufferText ▌", color = TextSecondary, fontSize = 15.sp)
        }
    }
}
