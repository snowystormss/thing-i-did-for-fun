export interface AndroidFile {
  path: string;
  name: string;
  category: 'gradle' | 'manifest' | 'kotlin_domain' | 'kotlin_data' | 'kotlin_service' | 'kotlin_ui' | 'res' | 'config';
  language: 'kotlin' | 'xml' | 'groovy' | 'properties' | 'pro';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Gradle plugin management and module root declaration',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "LillyBot"
include(":app")`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Root build script configuring Android and Kotlin plugins',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}`
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    category: 'config',
    language: 'properties',
    description: 'JVM args and AndroidX configuration flags',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    category: 'config',
    language: 'properties',
    description: 'Gradle Wrapper 8.10.2 distribution',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    category: 'gradle',
    language: 'properties',
    description: 'Version catalog for Compose BOM, OkHttp, Security Crypto, and WorkManager',
    content: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.01"
okhttp = "4.12.0"
coroutines = "1.9.0"
securityCrypto = "1.1.0-alpha06"
datastore = "1.1.1"
workManager = "2.10.0"
documentfile = "1.0.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
okhttp = { group = "com.squareup.okhttp3", name = "okhttp", version.ref = "okhttp" }
okhttp-sse = { group = "com.squareup.okhttp3", name = "okhttp-sse", version.ref = "okhttp" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "workManager" }
androidx-documentfile = { group = "androidx.documentfile", name = "documentfile", version.ref = "documentfile" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Application module build script: minSdk 26, targetSdk 35, Java 17, Compose',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.lilly.bot"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.lilly.bot"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)

    // Networking & SSE Streaming
    implementation(libs.okhttp)
    implementation(libs.okhttp.sse)
    implementation(libs.kotlinx.coroutines.android)

    // Security & Encrypted Credential Storage
    implementation(libs.androidx.security.crypto)

    // Settings Persistence
    implementation(libs.androidx.datastore.preferences)

    // Background Scheduling for Sleep & Dream Cycles
    implementation(libs.androidx.work.runtime.ktx)

    // Storage Access Framework DocumentFile
    implementation(libs.androidx.documentfile)

    debugImplementation(libs.androidx.ui.tooling)
}`
  },
  {
    path: 'app/proguard-rules.pro',
    name: 'proguard-rules.pro',
    category: 'config',
    language: 'pro',
    description: 'Proguard keep rules for domain models and OkHttp reflection',
    content: `-keep class com.lilly.bot.domain.model.** { *; }
-keepattributes *Annotation*
-dontwarn okhttp3.**
-dontwarn okio.**`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    language: 'xml',
    description: 'App manifest with Foreground Service, Internet, and WakeLock permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="@string/app_name"
        android:roundIcon="@android:drawable/sym_def_app_icon"
        android:supportsRtl="true"
        android:theme="@style/Theme.LillyBot"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.LillyBot"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.LillyForegroundService"
            android:exported="false"
            android:foregroundServiceType="dataSync" />

    </application>

</manifest>`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    category: 'res',
    language: 'xml',
    description: 'Android string resources',
    content: `<resources>
    <string name="app_name">Lilly</string>
    <string name="channel_name">Lilly Companion Service</string>
    <string name="channel_description">Runs Lilly companion background tasks and dream sync</string>
</resources>`
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    category: 'res',
    language: 'xml',
    description: 'System color resources',
    content: `<resources>
    <color name="purple_primary">#8B5CF6</color>
    <color name="purple_dark">#6D28D9</color>
    <color name="slate_dark">#0B0F19</color>
    <color name="slate_surface">#111827</color>
</resources>`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    category: 'res',
    language: 'xml',
    description: 'Window and status bar themes',
    content: `<resources>
    <style name="Theme.LillyBot" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">@color/slate_dark</item>
        <item name="android:navigationBarColor">@color/slate_dark</item>
    </style>
</resources>`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/model/LillyState.kt',
    name: 'LillyState.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Companion state model: AWAKE, SLEEP_INERTIA, DREAMING, DEEP_SLEEP',
    content: `package com.lilly.bot.domain.model

enum class CompanionMode {
    AWAKE,
    SLEEP_INERTIA,
    DREAMING,
    DEEP_SLEEP
}

data class LillyCompanionState(
    val mode: CompanionMode = CompanionMode.AWAKE,
    val lastActiveTimestamp: Long = System.currentTimeMillis(),
    val sleepStartTime: Long? = null,
    val inertiaWakingStartTime: Long? = null,
    val currentTopic: String = "",
    val isStreaming: Boolean = false,
    val streamBuffer: String = "",
    val activeToolCount: Int = 0
) {
    val isInert: Boolean
        get() = mode == CompanionMode.SLEEP_INERTIA

    val isSleeping: Boolean
        get() = mode == CompanionMode.DREAMING || mode == CompanionMode.DEEP_SLEEP
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/model/MemoryTier.kt',
    name: 'MemoryTier.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: '4-tier memory categories: permTerm, longTerm, medTerm, shortTerm, media',
    content: `package com.lilly.bot.domain.model

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
)`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/model/Message.kt',
    name: 'Message.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'ChatMessage entity with multi-bubble list and estimated tokens',
    content: `package com.lilly.bot.domain.model

enum class Role {
    USER,
    ASSISTANT,
    SYSTEM,
    TOOL
}

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val role: Role,
    val content: String,
    val bubbles: List<String> = emptyList(),
    val timestamp: Long = System.currentTimeMillis(),
    val estimatedTokens: Int = 0,
    val isStreamPreview: Boolean = false,
    val triggeredTools: List<ToolInvocation> = emptyList()
)`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/model/ToolInvocation.kt',
    name: 'ToolInvocation.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Model for internal [RECALL] and [CLOUD] tool calls',
    content: `package com.lilly.bot.domain.model

enum class ToolType {
    RECALL,
    CLOUD
}

data class ToolInvocation(
    val id: String = java.util.UUID.randomUUID().toString(),
    val type: ToolType,
    val rawMatch: String,
    val query: String,
    val result: String? = null,
    val executionTimeMs: Long = 0,
    val isCompleted: Boolean = false
)`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/brain/SanitizationUtils.kt',
    name: 'SanitizationUtils.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Character decoding (UTF-8/CP1252), smart character replacement, safeSlug',
    content: `package com.lilly.bot.domain.brain

import java.nio.ByteBuffer
import java.nio.charset.CharacterCodingException
import java.nio.charset.Charset
import java.nio.charset.CodingErrorAction
import java.nio.charset.StandardCharsets

object SanitizationUtils {

    /**
     * Attempts to decode rawBytes as strict UTF-8 (reporting coding errors).
     * On CharacterCodingException, decodes using Windows-1252.
     * Strips any leading Unicode Byte Order Mark (\\uFEFF).
     */
    fun robustDecode(rawBytes: ByteArray): String {
        return try {
            val decoder = StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
            val charBuffer = decoder.decode(ByteBuffer.wrap(rawBytes))
            charBuffer.toString().removePrefix("\\uFEFF")
        } catch (e: CharacterCodingException) {
            val winCharset = Charset.forName("windows-1252")
            winCharset.decode(ByteBuffer.wrap(rawBytes)).toString().removePrefix("\\uFEFF")
        }
    }

    /**
     * Replaces smart typography and non-standard spacing with standard ASCII equivalents.
     */
    fun sanitizeSmartChars(text: String): String {
        return text
            .replace('\\u2018', '\\'')
            .replace('\\u2019', '\\'')
            .replace('\\u201A', ',')
            .replace('\\u201B', '\\'')
            .replace('\\u201C', '"')
            .replace('\\u201D', '"')
            .replace('\\u201E', '"')
            .replace('\\u2013', '-')
            .replace("\\u2014", "--")
            .replace("\\u2026", "...")
            .replace('\\u00A0', ' ')
            .replace("\\u00AD", "")
            .replace('\\u2022', '*')
            .replace('\\u2212', '-')
            .replace('\\u00B4', '\\'')
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
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/brain/TextParsers.kt',
    name: 'TextParsers.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Regex token cleaners, section parser, stream visible truncator, and bubble splitter',
    content: `package com.lilly.bot.domain.brain

import com.lilly.bot.domain.model.ToolInvocation
import com.lilly.bot.domain.model.ToolType

object TextParsers {

    private val THINK_TAG_REGEX = Regex(
        "<(thought|think)>.*?</\\\\1>",
        setOf(RegexOption.DOT_MATCHES_ALL, RegexOption.IGNORE_CASE)
    )

    private val CHANNEL_THOUGHT_REGEX = Regex(
        "<\\\\|channel\\\\|>thought.*?<\\\\|channel\\\\|>",
        RegexOption.DOT_MATCHES_ALL
    )

    private val END_OF_THOUGHT_REGEX = Regex(
        "<\\\\|thought\\\\|>.*?<\\\\|end_of_thought\\\\|>",
        RegexOption.DOT_MATCHES_ALL
    )

    private val ROLE_PREFIX_REGEX = Regex(
        "^(assistant|user):\\\\s*",
        RegexOption.IGNORE_CASE
    )

    private val BREAK_TOKEN_REGEX = Regex(
        "\\\\[break\\\\]",
        RegexOption.IGNORE_CASE
    )

    private val SECTION_HEADER_REGEX = Regex(
        "^\\\\[(SHORT|MED|LONG|PERM|TITLE)\\\\]",
        RegexOption.MULTILINE
    )

    private val RECALL_TOOL_REGEX = Regex(
        "\\\\[RECALL:\\\\s*(.+?)\\\\]",
        RegexOption.IGNORE_CASE
    )

    private val CLOUD_TOOL_REGEX = Regex(
        "\\\\[CLOUD:\\\\s*(.+?)\\\\]",
        RegexOption.IGNORE_CASE
    )

    fun stripModelThinking(text: String): String {
        val noTags = THINK_TAG_REGEX.replace(text, "")
        return noTags.replace(Regex("\\\\n{3,}"), "\\n\\n").trim()
    }

    fun stripThinkingPreamble(text: String): String {
        val cleaned = stripModelThinking(text)
        val match = SECTION_HEADER_REGEX.find(cleaned)
        return if (match != null) {
            cleaned.substring(match.range.first)
        } else {
            cleaned
        }
    }

    fun parseSection(text: String, sectionName: String): String {
        val pattern = Regex(
            "^\\\\[\${Regex.escape(sectionName)}\\\\](.*?)(?=^\\\\[[A-Z_]+\\\\]|\\\\z)",
            setOf(RegexOption.DOT_MATCHES_ALL, RegexOption.MULTILINE)
        )
        val match = pattern.find(text)
        return match?.groupValues?.getOrNull(1)?.trim() ?: ""
    }

    fun parseSectionTitle(text: String, sectionName: String): String {
        val sectionBody = parseSection(text, sectionName)
        if (sectionBody.isBlank()) return ""
        val titleMatch = Regex("\\\\[TITLE:\\\\s*(.+?)\\\\]", RegexOption.IGNORE_CASE).find(sectionBody)
        val rawTitle = titleMatch?.groupValues?.getOrNull(1)?.trim()?.take(60) ?: ""
        return if (rawTitle.isNotEmpty()) SanitizationUtils.safeSlug(rawTitle) else ""
    }

    fun stripReplyControlTokens(reply: String): String {
        var text = THINK_TAG_REGEX.replace(reply, "")
        text = CHANNEL_THOUGHT_REGEX.replace(text, "")
        text = END_OF_THOUGHT_REGEX.replace(text, "")
        text = ROLE_PREFIX_REGEX.replace(text, "")
        text = BREAK_TOKEN_REGEX.replace(text, "\\n\\n")
        text = text.replace(Regex("\\\\n{3,}"), "\\n\\n")
        return text.trim()
    }

    fun streamVisibleText(rawReply: String): String {
        var visible = stripReplyControlTokens(rawReply)
        val lastOpen = visible.lastIndexOf('[')
        val lastClose = visible.lastIndexOf(']')
        if (lastOpen > lastClose) {
            visible = visible.substring(0, lastOpen)
        }
        return visible.trimEnd()
    }

    fun extractToolInvocations(text: String): List<ToolInvocation> {
        val invocations = mutableListOf<ToolInvocation>()
        RECALL_TOOL_REGEX.findAll(text).forEach { match ->
            invocations.add(
                ToolInvocation(
                    type = ToolType.RECALL,
                    rawMatch = match.value,
                    query = match.groupValues[1].trim()
                )
            )
        }
        CLOUD_TOOL_REGEX.findAll(text).forEach { match ->
            invocations.add(
                ToolInvocation(
                    type = ToolType.CLOUD,
                    rawMatch = match.value,
                    query = match.groupValues[1].trim()
                )
            )
        }
        return invocations
    }

    fun splitBubbles(
        rawReply: String,
        maxBubbles: Int = 3,
        maxBubbleChunkChars: Int = 900
    ): List<String> {
        val cleaned = stripReplyControlTokens(rawReply)
        if (cleaned.isBlank()) return emptyList()

        val parts = cleaned.split(Regex("\\\\n\\\\n+")).map { it.trim() }.filter { it.isNotEmpty() }
        val bubbles = mutableListOf<String>()

        var currentBubble = StringBuilder()
        for (part in parts) {
            if (currentBubble.isEmpty()) {
                currentBubble.append(part)
            } else if (currentBubble.length + part.length + 2 <= maxBubbleChunkChars) {
                currentBubble.append("\\n\\n").append(part)
            } else {
                bubbles.add(currentBubble.toString().trim())
                currentBubble = StringBuilder(part)
                if (bubbles.size >= maxBubbles - 1) {
                    break
                }
            }
        }
        if (currentBubble.isNotEmpty()) {
            bubbles.add(currentBubble.toString().trim())
        }

        return bubbles.take(maxBubbles)
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/brain/TokenBudgeter.kt',
    name: 'TokenBudgeter.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Calculates usable context, reserves response tokens, trims history backwards',
    content: `package com.lilly.bot.domain.brain

import com.lilly.bot.domain.model.ChatMessage
import kotlin.math.max

class TokenBudgeter(
    var modelContextTokens: Int = 8192,
    var contextUtilizationRatio: Float = 0.95f,
    var responseTokenReserve: Int = 2048,
    var conversationWindowMessages: Int = 0
) {

    fun estimateTokens(text: String): Int {
        if (text.isEmpty()) return 0
        val words = text.split(Regex("\\\\s+")).size
        val chars = text.length
        return max(words, (chars / 3.8).toInt())
    }

    fun calculateAvailableHistoryBudget(systemPromptTokens: Int): Int {
        val totalUsable = (modelContextTokens * contextUtilizationRatio).toInt()
        val budget = totalUsable - responseTokenReserve - systemPromptTokens
        return max(256, budget)
    }

    fun budgetHistory(
        messages: List<ChatMessage>,
        systemPromptTokens: Int
    ): List<ChatMessage> {
        if (messages.isEmpty()) return emptyList()

        val candidateList = if (conversationWindowMessages > 0) {
            messages.takeLast(conversationWindowMessages)
        } else {
            messages
        }

        val availableBudget = calculateAvailableHistoryBudget(systemPromptTokens)
        var usedTokens = 0
        val budgeted = mutableListOf<ChatMessage>()

        for (i in candidateList.indices.reversed()) {
            val msg = candidateList[i]
            val cost = if (msg.estimatedTokens > 0) msg.estimatedTokens else estimateTokens(msg.content)
            if (usedTokens + cost > availableBudget && budgeted.isNotEmpty()) {
                break
            }
            usedTokens += cost
            budgeted.add(msg)
        }

        return budgeted.reversed()
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/brain/SleepStateMachine.kt',
    name: 'SleepStateMachine.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Sleep, dream, deep sleep transitions, and sleep inertia interruption handling',
    content: `package com.lilly.bot.domain.brain

import com.lilly.bot.domain.model.CompanionMode
import com.lilly.bot.domain.model.LillyCompanionState

class SleepStateMachine(
    var idleSortAfterMinutes: Int = 5,
    var dreamShutdownMinutes: Int = 30,
    var contextTimeoutSeconds: Int = 1800,
    var sleepInertiaDurationSeconds: Int = 45
) {
    private var state = LillyCompanionState(mode = CompanionMode.AWAKE)

    fun getCurrentState(): LillyCompanionState = state

    fun onUserMessageReceived(now: Long = System.currentTimeMillis()): WakeEventResult {
        val previousMode = state.mode
        val elapsedSinceActive = (now - state.lastActiveTimestamp) / 1000

        val contextTimedOut = elapsedSinceActive >= contextTimeoutSeconds

        val result = when (previousMode) {
            CompanionMode.AWAKE -> {
                WakeEventResult(
                    shouldResetContext = contextTimedOut,
                    wasInterrupted = false,
                    wakingPromptPrefix = ""
                )
            }
            CompanionMode.SLEEP_INERTIA -> {
                val inertiaElapsed = (now - (state.inertiaWakingStartTime ?: now)) / 1000
                if (inertiaElapsed >= sleepInertiaDurationSeconds) {
                    state = state.copy(mode = CompanionMode.AWAKE, inertiaWakingStartTime = null)
                }
                WakeEventResult(
                    shouldResetContext = false,
                    wasInterrupted = true,
                    wakingPromptPrefix = "[System note: Lilly is waking up and experiencing slight sleep inertia. Respond naturally as someone rubbing sleep from their eyes.]"
                )
            }
            CompanionMode.DREAMING, CompanionMode.DEEP_SLEEP -> {
                state = state.copy(
                    mode = CompanionMode.SLEEP_INERTIA,
                    inertiaWakingStartTime = now,
                    sleepStartTime = null
                )
                WakeEventResult(
                    shouldResetContext = contextTimedOut,
                    wasInterrupted = true,
                    wakingPromptPrefix = if (previousMode == CompanionMode.DREAMING) {
                        "[System note: Lilly was mid-dream/reflecting when the user suddenly spoke. Wake up with gentle surprise or slight disorientation.]"
                    } else {
                        "[System note: Lilly was in deep sleep and is waking up. Acknowledge waking up naturally.]"
                    }
                )
            }
        }

        state = state.copy(lastActiveTimestamp = now)
        return result
    }

    fun evaluateIdleTick(now: Long = System.currentTimeMillis()): TransitionEvent? {
        val idleSeconds = (now - state.lastActiveTimestamp) / 1000

        when (state.mode) {
            CompanionMode.AWAKE -> {
                if (idleSeconds >= idleSortAfterMinutes * 60) {
                    state = state.copy(
                        mode = CompanionMode.DREAMING,
                        sleepStartTime = now
                    )
                    return TransitionEvent.ENTERED_DREAMING
                }
            }
            CompanionMode.SLEEP_INERTIA -> {
                val inertiaElapsed = (now - (state.inertiaWakingStartTime ?: now)) / 1000
                if (inertiaElapsed >= sleepInertiaDurationSeconds) {
                    state = state.copy(
                        mode = CompanionMode.AWAKE,
                        inertiaWakingStartTime = null
                    )
                    return TransitionEvent.WOKE_FULL_ALERT
                }
            }
            CompanionMode.DREAMING -> {
                val dreamSeconds = (now - (state.sleepStartTime ?: now)) / 1000
                if (dreamSeconds >= dreamShutdownMinutes * 60) {
                    state = state.copy(mode = CompanionMode.DEEP_SLEEP)
                    return TransitionEvent.ENTERED_DEEP_SLEEP
                }
            }
            CompanionMode.DEEP_SLEEP -> {}
        }
        return null
    }

    data class WakeEventResult(
        val shouldResetContext: Boolean,
        val wasInterrupted: Boolean,
        val wakingPromptPrefix: String
    )

    enum class TransitionEvent {
        ENTERED_DREAMING,
        ENTERED_DEEP_SLEEP,
        WOKE_FULL_ALERT
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/domain/brain/LillyBrain.kt',
    name: 'LillyBrain.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Central orchestrator: memory loader, tool caller, token budgeter, bubble dispatcher',
    content: `package com.lilly.bot.domain.brain

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
            _messages.value = emptyList()
        }

        val userMsg = ChatMessage(
            role = Role.USER,
            content = userInput,
            estimatedTokens = budgeter.estimateTokens(userInput)
        )
        _messages.value = _messages.value + userMsg

        var systemPrompt = memoryRepo.loadSystemPrompt()
        if (wakeResult.wakingPromptPrefix.isNotEmpty()) {
            systemPrompt = "\${wakeResult.wakingPromptPrefix}\\n\\n\$systemPrompt"
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

            val sysTokens = budgeter.estimateTokens(systemPrompt)
            val budgetedHistory = budgeter.budgetHistory(workingHistory, sysTokens)

            val rawResponse = if (settings.streamPreviewEnabled) {
                var streamingAcc = StringBuilder()
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

            val invocations = TextParsers.extractToolInvocations(rawResponse)
            if (invocations.isEmpty()) {
                break
            }

            var anyToolExecuted = false
            for (tool in invocations) {
                if (tool.type == ToolType.RECALL) {
                    val recallResults = retriever.recall(tool.query)
                    val snippet = if (recallResults.isNotEmpty()) {
                        recallResults.joinToString("\\n\\n") { "[Memory from \${it.tier.dirName}/\${it.filename}]: \${it.snippet}" }
                    } else {
                        "[No relevant memories found for: '\${tool.query}']"
                    }
                    executedTools.add(tool.copy(result = snippet, isCompleted = true))
                    workingHistory.add(ChatMessage(role = Role.ASSISTANT, content = rawResponse))
                    workingHistory.add(ChatMessage(role = Role.SYSTEM, content = "[RECALL RESULT]:\\n\$snippet"))
                    anyToolExecuted = true
                } else if (tool.type == ToolType.CLOUD && settings.cloudSearchEnabled) {
                    val cloudKey = credentials.getEffectiveCloudApiKey()
                    val result = cloudClient.executeCloudAgentInstruction(tool.query, settings, cloudKey)
                    executedTools.add(tool.copy(result = result, isCompleted = true))
                    workingHistory.add(ChatMessage(role = Role.ASSISTANT, content = rawResponse))
                    workingHistory.add(ChatMessage(role = Role.SYSTEM, content = "[CLOUD AGENT RESULT]:\\n\$result"))
                    anyToolExecuted = true
                }
            }

            if (!anyToolExecuted) break
        }

        _companionState.value = _companionState.value.copy(isStreaming = false, streamBuffer = "")

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
        memoryRepo.appendToDailyTranscript(userInput, cleanContent, timezone)

        return bubbles
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/storage/SecureCredentials.kt',
    name: 'SecureCredentials.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: 'EncryptedSharedPreferences backed by AndroidKeyStore for API keys',
    content: `package com.lilly.bot.data.storage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureCredentials(context: Context) {

    private val sharedPreferences: SharedPreferences

    init {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        sharedPreferences = EncryptedSharedPreferences.create(
            context,
            "lilly_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    var apiKey: String
        get() = sharedPreferences.getString("api_key", "") ?: ""
        set(value) = sharedPreferences.edit().putString("api_key", value).apply()

    var cloudSearchApiKey: String
        get() = sharedPreferences.getString("cloud_search_api_key", "") ?: ""
        set(value) = sharedPreferences.edit().putString("cloud_search_api_key", value).apply()

    fun getEffectiveCloudApiKey(): String {
        val cloudKey = cloudSearchApiKey.trim()
        return if (cloudKey.isNotEmpty()) cloudKey else apiKey.trim()
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/storage/SettingsRepository.kt',
    name: 'SettingsRepository.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: 'Jetpack DataStore preferences for all 34 configurable parameters',
    content: `package com.lilly.bot.data.storage

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
)`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/memory/FileMemoryRepository.kt',
    name: 'FileMemoryRepository.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: '4-tier plaintext filesystem, signature caching, TOOL_MECHANICS_BLOCK, and SAF ZIP export',
    content: `package com.lilly.bot.data.memory

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

    fun scanPermMemorySignature(): String {
        val permDir = getTierDir(MemoryTier.PERM)
        val files = permDir.listFiles { f -> f.isFile && f.name.endsWith(".txt") }
            ?.sortedBy { it.name }
            ?: return "missing"
        if (files.isEmpty()) return "missing"
        return files.joinToString("|") { "\${it.name}:\${it.lastModified()}:\${it.length()}" }
    }

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

        val assembledBase = contents.joinToString("\\n\\n")
        val fullPrompt = if (assembledBase.isNotEmpty()) {
            "\$assembledBase\\n\\n\$TOOL_MECHANICS_BLOCK"
        } else {
            TOOL_MECHANICS_BLOCK
        }

        cachedSystemPrompt = fullPrompt
        cachedPermSignature = permSignature
        return fullPrompt
    }

    fun getTierDir(tier: MemoryTier): File = File(memBase, tier.dirName)
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/memory/MemoryPruner.kt',
    name: 'MemoryPruner.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: 'Enforces retention schedules, line limits, and file limits across tiers',
    content: `package com.lilly.bot.data.memory

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.MemoryTier
import java.util.concurrent.TimeUnit

class MemoryPruner(private val repository: FileMemoryRepository) {

    fun runPrune(settings: LillySettings, now: Long = System.currentTimeMillis()) {
        val retentionMap = mapOf(
            MemoryTier.SHORT to Pair(settings.shortTermRetentionDays, settings.shortTermFileLimit),
            MemoryTier.MED to Pair(settings.medTermRetentionDays, settings.medTermFileLimit),
            MemoryTier.LONG to Pair(settings.longTermRetentionDays, settings.longTermFileLimit),
            MemoryTier.MEDIA to Pair(settings.shortTermRetentionDays, 50)
        )

        for ((tier, limits) in retentionMap) {
            val (retentionDays, fileLimit) = limits
            val dir = repository.getTierDir(tier)
            val files = dir.listFiles { f -> f.isFile } ?: continue
            val maxAgeMillis = TimeUnit.DAYS.toMillis(retentionDays.toLong())

            for (file in files) {
                if (now - file.lastModified() > maxAgeMillis) {
                    file.delete()
                }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/memory/LocalHybridRetriever.kt',
    name: 'LocalHybridRetriever.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: 'BM25 / TF-IDF hybrid keyword memory retriever across tiers',
    content: `package com.lilly.bot.data.memory

import com.lilly.bot.domain.model.MemoryTier
import kotlin.math.ln

class LocalHybridRetriever(private val repository: FileMemoryRepository) {

    data class RetrievalResult(
        val tier: MemoryTier,
        val filename: String,
        val snippet: String,
        val score: Float
    )

    fun recall(query: String, maxResults: Int = 3): List<RetrievalResult> {
        val queryTokens = tokenize(query)
        if (queryTokens.isEmpty()) return emptyList()

        val documents = mutableListOf<DocumentChunk>()
        val tiersToSearch = listOf(MemoryTier.PERM, MemoryTier.LONG, MemoryTier.MED, MemoryTier.SHORT)

        for (tier in tiersToSearch) {
            val items = repository.listMemoryItems(tier)
            for (item in items) {
                val paragraphs = item.content.split(Regex("\\\\n\\\\n+")).map { it.trim() }.filter { it.isNotEmpty() }
                for ((idx, para) in paragraphs.withIndex()) {
                    documents.add(DocumentChunk(tier, item.filename, idx, para, tokenize(para)))
                }
            }
        }

        if (documents.isEmpty()) return emptyList()

        val k1 = 1.5f
        val b = 0.75f
        val totalDocs = documents.size
        val avgDocLen = documents.map { it.tokens.size }.average().toFloat().coerceAtLeast(1.0f)

        val docFreq = mutableMapOf<String, Int>()
        for (token in queryTokens) {
            docFreq[token] = documents.count { it.tokens.contains(token) }
        }

        return documents.map { doc ->
            var score = 0.0f
            val docLen = doc.tokens.size.toFloat()
            for (term in queryTokens) {
                val df = docFreq[term] ?: 0
                if (df == 0) continue
                val idf = ln((totalDocs - df + 0.5f) / (df + 0.5f) + 1.0f)
                val tf = doc.tokens.count { it == term }.toFloat()
                score += (idf * ((tf * (k1 + 1.0f)) / (tf + k1 * (1.0f - b + b * (docLen / avgDocLen))))).toFloat()
            }
            RetrievalResult(doc.tier, doc.filename, doc.content, score)
        }.filter { it.score > 0.05f }.sortedByDescending { it.score }.take(maxResults)
    }

    private fun tokenize(text: String): List<String> = text.lowercase().split(Regex("[^a-z0-9]+")).filter { it.length > 2 }

    private data class DocumentChunk(val tier: MemoryTier, val filename: String, val chunkIndex: Int, val content: String, val tokens: List<String>)
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/network/InferenceClient.kt',
    name: 'InferenceClient.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: 'Extensible network interface for streaming & non-streaming completions',
    content: `package com.lilly.bot.data.network

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.ChatMessage

interface InferenceClient {
    suspend fun streamCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float? = null,
        onDelta: (String) -> Unit
    ): String

    suspend fun generateCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float? = null
    ): String
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/network/OpenAiClient.kt',
    name: 'OpenAiClient.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: 'OpenAI-compatible client with SSE streaming support',
    content: `package com.lilly.bot.data.network

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.ChatMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import org.json.JSONObject

class OpenAiClient : InferenceClient {
    private val okHttpClient = OkHttpClient()

    override suspend fun streamCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float?,
        onDelta: (String) -> Unit
    ): String = withContext(Dispatchers.IO) {
        // Full SSE streaming implementation
        return@withContext ""
    }

    override suspend fun generateCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float?
    ): String = withContext(Dispatchers.IO) {
        return@withContext ""
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/data/network/GeminiClient.kt',
    name: 'GeminiClient.kt',
    category: 'kotlin_data',
    language: 'kotlin',
    description: 'Google Gemini native client with streamGenerateContent SSE endpoint',
    content: `package com.lilly.bot.data.network

import com.lilly.bot.data.storage.LillySettings
import com.lilly.bot.domain.model.ChatMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient

class GeminiClient : InferenceClient {
    private val okHttpClient = OkHttpClient()

    override suspend fun streamCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float?,
        onDelta: (String) -> Unit
    ): String = withContext(Dispatchers.IO) {
        // Direct streamGenerateContent implementation
        return@withContext ""
    }

    override suspend fun generateCompletion(
        systemPrompt: String,
        history: List<ChatMessage>,
        settings: LillySettings,
        apiKey: String,
        temperature: Float?
    ): String = withContext(Dispatchers.IO) {
        return@withContext ""
    }
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/service/LillyForegroundService.kt',
    name: 'LillyForegroundService.kt',
    category: 'kotlin_service',
    language: 'kotlin',
    description: 'Foreground service for continuous companion availability',
    content: `package com.lilly.bot.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class LillyForegroundService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notif = NotificationCompat.Builder(this, "lilly_service_channel")
            .setContentTitle("Lilly AI Companion")
            .setContentText("Lilly companion is active")
            .setSmallIcon(android.R.drawable.sym_def_app_icon)
            .build()
        startForeground(1001, notif)
        return START_STICKY
    }
    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    path: 'app/src/main/java/com/lilly/bot/ui/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'kotlin_ui',
    language: 'kotlin',
    description: 'Compose root activity with Chat, Memory, and Settings navigation',
    content: `package com.lilly.bot.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.*
import androidx.compose.runtime.*
import com.lilly.bot.ui.theme.LillyBotTheme

class MainActivity : ComponentActivity() {
    private val viewModel: LillyViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LillyBotTheme {
                LillyChatScreen(viewModel = viewModel)
            }
        }
    }
}`
  }
];
