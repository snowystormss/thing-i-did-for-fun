# Lilly: Native Android Companion & Architecture Project Hub

Production-grade, native Android application (Kotlin + Jetpack Compose, minSdk 26, targetSdk 35) providing a faithful 1:1 behavioral migration of the Python AI companion **Lilly** (`aigfbutREAL.py`), paired with an interactive Android Project Explorer, Code Inspector, and 1-Click ZIP Downloader for opening in Android Studio or compiling via `./gradlew assembleDebug`.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified in Phase 1 and will govern the build:
>
> - **Experience Mode**: Full Android Studio project codebase generation with an interactive Android Project Tree, Syntax-Highlighted Code Inspector, Architecture Visualizer, and one-click ZIP download (`lilly-android-project.zip`).
> - **Provider & Authentication**: Primary default is **NONE** (no calls execute until the user inputs their key). The Key Management system supports both **Google Gemini API keys** and **OpenAI-compatible endpoints/keys** with on-device KeyStore encryption (`EncryptedSharedPreferences`).
> - **Permanent Memory Tier (`permTerm`)**: Seeded with the foundational persona rules and prompt template from `aigfbutREAL.py` (identity, tone, quirks, and verbatim `TOOL_MECHANICS_BLOCK`), while allowing dynamic editing and SAF file export/import.

---

### 1. Overview & Core Concept

**Lilly** is an autonomous, emotionally-grounded AI companion built on a hierarchical 4-tier plaintext memory system (`permTerm`, `longTerm`, `medTerm`, `shortTerm`), sleep/dream state machine, sleep inertia interruption handling, token budgeting math, multi-bubble split parsing, and mid-turn tool reflexes (`[RECALL]`, `[CLOUD]`, `[break]`).

Rather than flattening Lilly into a toy chat interface, this project delivers:
1. **The Complete Native Android Project**: All Gradle scripts (`settings.gradle.kts`, root `build.gradle.kts`, `app/build.gradle.kts`), `AndroidManifest.xml`, resources, and complete Kotlin source files across `domain/`, `data/`, `service/`, and `ui/` with zero missing files or `// TODO` stubs.
2. **Interactive Android Project Hub & Code Inspector**: An IDE-grade browser interface to inspect package hierarchies, view exact Kotlin implementations, test regex tokenizers and memory math, and download the entire ready-to-build Android Studio project as a ZIP.

---

### 2. User Experience & Visual Design

#### Key User Flows
- **Project Structure & Code Explorer**: Users can traverse the Android Studio tree (`app/src/main/java/com/lilly/bot/...`, `res/`, `gradle/`), inspect syntax-highlighted Kotlin classes, copy snippets, or download the full ZIP bundle.
- **Lilly Architecture & State Engine Visualizer**: Real-time visual walkthrough of Lilly's sleep/dream cycles (`AWAKE` -> `IDLE` -> `DREAMING` -> `DEEP_SLEEP`), sleep inertia recovery curves, 4-tier memory pruning timers, and token budget calculations.
- **Regex & Token Budget Sandbox**: Interactive testing workbench demonstrating `stripModelThinking`, `stripReplyControlTokens`, `streamVisibleText`, smart character sanitization, and bubble splitting.
- **Memory & Settings Configuration**: UI mirroring the Android Jetpack Compose Settings screen, including provider selection (Gemini vs OpenAI-compatible), API key validation, context utilization ratios, and retention schedules.

#### Visual Identity & Theme
- **Aesthetic**: Clean, focused developer console with technical precision and warm companion accents.
- **Typography**: Display/UI in *Plus Jakarta Sans* and *Manrope*; code, memory dumps, and token math in *JetBrains Mono* with tabular figures (`tabular-nums`).
- **Color Palette**: Deep slate background (`#0B0F19`), structural card surfaces (`#111827`, `#1E293B`), subtle borders (`#334155`), with Lilly's violet accent (`#8B5CF6`) and clear semantic indicators for states (Active, Dreaming, Hibernating).

---

### 3. Key Product Decisions & Trade-Offs

- **Complete Android Source Tree Generation**:
  - *Chosen Approach*: Write every required Gradle and Kotlin source file directly into the project repository under `android/` so that users can immediately extract or clone it, open it in Android Studio, and build the APK via Gradle.
  - *Why*: Satisfies the strict user directive for a complete, production-grade native Android application without placeholders.
- **Provider-Agnostic Engine with Dual Gemini / OpenAI Support**:
  - *Chosen Approach*: Implement an extensible `InferenceClient` interface in Kotlin with `GeminiNativeClient` and `OpenAiCompatibleClient` implementations, both supporting SSE streaming, custom headers, and token usage accounting.
  - *Why*: Accommodates local llama.cpp servers as well as Google Gemini API, requiring explicit key input before executing.
- **Full In-Browser Project Inspector & ZIP Exporter**:
  - *Chosen Approach*: In addition to storing the raw project files, provide a client-side JSZip bundler to allow downloading the entire Android Studio project in 1 click.
  - *Why*: Bridges the AI Studio web preview environment with native Android development.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LILLY ANDROID ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  UI LAYER (Jetpack Compose + Material 3)                                    │
│  ├── LillyChatScreen (Multi-bubble rendering, streaming preview, reflexes)   │
│  ├── MemoryExplorerScreen (4-tier file viewer, SAF export/import)           │
│  ├── SettingsScreen (API Keys, Token math, Timezone, Provider toggle)       │
│  └── LillyViewModel (StateFlow, CoroutineScope, Lifecycle awareness)        │
├─────────────────────────────────────────────────────────────────────────────┤
│  DOMAIN LAYER (Lilly Core Brain - Framework Independent)                   │
│  ├── LillyBrain (Orchestrator, context manager, state transitions)          │
│  ├── SleepStateMachine (AWAKE, SLEEP_INERTIA, DREAMING, DEEP_SLEEP)         │
│  ├── TokenBudgeter (Context utilization math, token reservation)            │
│  ├── ToolParser & BubbleSplitter ([RECALL], [CLOUD], [break], regexes)     │
│  └── SanitizationUtils (smart chars, UTF-8/CP1252, slugification)          │
├─────────────────────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                                 │
│  ├── FileMemoryRepository (permTerm, longTerm, medTerm, shortTerm files)    │
│  ├── LocalHybridRetriever (On-device BM25/TF-IDF semantic & keyword search)│
│  ├── SecurePreferences (EncryptedSharedPreferences for API keys)           │
│  └── Network (OkHttp3 SSE Client for Gemini Native & OpenAI Compatible)     │
├─────────────────────────────────────────────────────────────────────────────┤
│  BACKGROUND SERVICES & SCHEDULER                                            │
│  ├── LillyCompanionService (Foreground Service for uninterrupted chat)      │
│  └── DreamWorker (WorkManager daily reflection & memory pruner)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Android Studio Project File Layout (under `android/`):
- `settings.gradle.kts`: Plugin management and module inclusion
- `build.gradle.kts` (root): Kotlin, Android Gradle Plugin, and Compose compiler plugins
- `gradle/wrapper/gradle-wrapper.properties`: Gradle 8.10+ configuration
- `app/build.gradle.kts`: Dependencies (OkHttp3, Security Crypto, DataStore, Compose BOM, Coroutines, WorkManager)
- `app/src/main/AndroidManifest.xml`: Permissions (`INTERNET`, `FOREGROUND_SERVICE`, `POST_NOTIFICATIONS`) and services
- `app/src/main/java/com/lilly/bot/`:
  - `domain/model/`: `LillyState.kt`, `MemoryTier.kt`, `Message.kt`, `ToolInvocation.kt`
  - `domain/brain/`: `LillyBrain.kt`, `SleepStateMachine.kt`, `TokenBudgeter.kt`, `TextParsers.kt`
  - `data/memory/`: `FileMemoryRepository.kt`, `MemoryPruner.kt`, `LocalRetriever.kt`
  - `data/network/`: `InferenceClient.kt`, `OpenAiClient.kt`, `GeminiClient.kt`, `CloudSearchClient.kt`
  - `data/storage/`: `SettingsRepository.kt`, `SecureCredentials.kt`
  - `service/`: `LillyForegroundService.kt`, `DreamSyncWorker.kt`
  - `ui/`: `MainActivity.kt`, `LillyChatScreen.kt`, `MemoryScreen.kt`, `SettingsScreen.kt`, `Theme.kt`
