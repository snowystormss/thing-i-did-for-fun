package com.lilly.bot.ui

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.lilly.bot.domain.model.MemoryItem
import com.lilly.bot.domain.model.MemoryTier
import com.lilly.bot.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MemoryExplorerScreen(
    viewModel: LillyViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val selectedTier by viewModel.selectedTier.collectAsState()
    val files by viewModel.currentTierFiles.collectAsState()

    var viewingItem by remember { mutableStateOf<MemoryItem?>(null) }
    var isCreatingNew by remember { mutableStateOf(false) }
    var newFilename by remember { mutableStateOf("") }
    var newContent by remember { mutableStateOf("") }

    val exportLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/zip")
    ) { uri ->
        uri?.let {
            context.contentResolver.openOutputStream(it)?.use { outStream ->
                viewModel.exportMemory(outStream)
            }
        }
    }

    val importLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        uri?.let {
            context.contentResolver.openInputStream(it)?.use { inStream ->
                viewModel.importMemory(inStream)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Memory Library", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { exportLauncher.launch("lilly_memory_backup.zip") }) {
                        Icon(Icons.Default.Download, contentDescription = "Export ZIP", tint = TextSecondary)
                    }
                    IconButton(onClick = { importLauncher.launch(arrayOf("application/zip")) }) {
                        Icon(Icons.Default.Upload, contentDescription = "Import ZIP", tint = TextSecondary)
                    }
                    IconButton(onClick = { isCreatingNew = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Memory", tint = AccentPurple)
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
            // Tier Selector Tabs
            ScrollableTabRow(
                selectedTabIndex = selectedTier.ordinal,
                containerColor = DarkSurface,
                contentColor = AccentPurple,
                edgePadding = 16.dp
            ) {
                MemoryTier.entries.forEach { tier ->
                    Tab(
                        selected = selectedTier == tier,
                        onClick = { viewModel.loadMemoryTier(tier) },
                        text = {
                            Text(
                                text = "${tier.dirName} (${tier.name})",
                                fontSize = 13.sp,
                                color = if (selectedTier == tier) AccentPurple else TextSecondary
                            )
                        }
                    )
                }
            }

            // File list
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (files.isEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                "No memory files in ${selectedTier.dirName}.",
                                color = TextSecondary,
                                fontSize = 14.sp
                            )
                        }
                    }
                }

                items(files, key = { it.filename }) { item ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = DarkCard),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { viewingItem = item }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item.filename,
                                    color = TextPrimary,
                                    fontSize = 15.sp,
                                    fontWeight = androidx.compose.ui.text.font.FontWeight.Medium
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${item.sizeBytes} bytes · modified ${java.util.Date(item.lastModified)}",
                                    color = TextSecondary,
                                    fontSize = 12.sp
                                )
                            }
                            IconButton(onClick = { viewModel.deleteMemoryFile(selectedTier, item.filename) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = TextSecondary)
                            }
                        }
                    }
                }
            }
        }

        // View/Edit Dialog
        viewingItem?.let { item ->
            var editedContent by remember { mutableStateOf(item.content) }
            AlertDialog(
                onDismissRequest = { viewingItem = null },
                title = { Text(item.filename, color = TextPrimary) },
                text = {
                    TextField(
                        value = editedContent,
                        onValueChange = { editedContent = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(300.dp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = DarkSurface,
                            unfocusedContainerColor = DarkSurface,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        )
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            viewModel.saveMemoryFile(item.tier, item.filename, editedContent)
                            viewingItem = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentPurple)
                    ) {
                        Text("Save")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewingItem = null }) {
                        Text("Close", color = TextSecondary)
                    }
                },
                containerColor = DarkCard
            )
        }

        // Create New Memory Dialog
        if (isCreatingNew) {
            AlertDialog(
                onDismissRequest = { isCreatingNew = false },
                title = { Text("New Memory in ${selectedTier.dirName}", color = TextPrimary) },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        TextField(
                            value = newFilename,
                            onValueChange = { newFilename = it },
                            placeholder = { Text("filename.txt", color = TextSecondary) },
                            singleLine = true,
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = DarkSurface,
                                unfocusedContainerColor = DarkSurface,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            )
                        )
                        TextField(
                            value = newContent,
                            onValueChange = { newContent = it },
                            placeholder = { Text("Enter memory content...", color = TextSecondary) },
                            modifier = Modifier.height(200.dp),
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = DarkSurface,
                                unfocusedContainerColor = DarkSurface,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary
                            )
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            if (newFilename.isNotBlank() && newContent.isNotBlank()) {
                                viewModel.saveMemoryFile(selectedTier, newFilename, newContent)
                                newFilename = ""
                                newContent = ""
                                isCreatingNew = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentPurple)
                    ) {
                        Text("Create")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { isCreatingNew = false }) {
                        Text("Cancel", color = TextSecondary)
                    }
                },
                containerColor = DarkCard
            )
        }
    }
}
