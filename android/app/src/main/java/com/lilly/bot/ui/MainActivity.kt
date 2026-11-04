package com.lilly.bot.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.lilly.bot.service.LillyForegroundService
import com.lilly.bot.ui.theme.DarkBackground
import com.lilly.bot.ui.theme.DarkSurface
import com.lilly.bot.ui.theme.LillyBotTheme

enum class MainTab {
    CHAT,
    MEMORY,
    SETTINGS
}

class MainActivity : ComponentActivity() {

    private val viewModel: LillyViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Optionally start background companion service
        runCatching {
            LillyForegroundService.start(this)
        }

        setContent {
            LillyBotTheme {
                var selectedTab by remember { mutableStateOf(MainTab.CHAT) }

                Scaffold(
                    bottomBar = {
                        NavigationBar(
                            containerColor = DarkSurface
                        ) {
                            NavigationBarItem(
                                selected = selectedTab == MainTab.CHAT,
                                onClick = { selectedTab = MainTab.CHAT },
                                icon = { Icon(Icons.Default.ChatBubble, contentDescription = "Chat") },
                                label = { Text("Chat") }
                            )
                            NavigationBarItem(
                                selected = selectedTab == MainTab.MEMORY,
                                onClick = { selectedTab = MainTab.MEMORY },
                                icon = { Icon(Icons.Default.Folder, contentDescription = "Memory") },
                                label = { Text("Memory") }
                            )
                            NavigationBarItem(
                                selected = selectedTab == MainTab.SETTINGS,
                                onClick = { selectedTab = MainTab.SETTINGS },
                                icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                                label = { Text("Settings") }
                            )
                        }
                    },
                    containerColor = DarkBackground
                ) { innerPadding ->
                    when (selectedTab) {
                        MainTab.CHAT -> LillyChatScreen(
                            viewModel = viewModel,
                            modifier = Modifier.padding(innerPadding)
                        )
                        MainTab.MEMORY -> MemoryExplorerScreen(
                            viewModel = viewModel,
                            modifier = Modifier.padding(innerPadding)
                        )
                        MainTab.SETTINGS -> SettingsScreen(
                            viewModel = viewModel,
                            modifier = Modifier.padding(innerPadding)
                        )
                    }
                }
            }
        }
    }
}
