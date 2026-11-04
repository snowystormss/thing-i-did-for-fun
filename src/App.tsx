import React, { useState } from 'react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES, AndroidFile } from './data/androidProjectFiles';
import { ProjectTree } from './components/ProjectTree';
import { CodeViewer } from './components/CodeViewer';
import { EnginePlayground } from './components/EnginePlayground';
import { MemoryInspector } from './components/MemoryInspector';
import { SettingsViewer } from './components/SettingsViewer';
import {
  Download,
  Terminal,
  FolderGit2,
  CheckCircle2,
  Search,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'playground' | 'memory' | 'settings' | 'build'>('explorer');
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(
    ANDROID_PROJECT_FILES.find(f => f.name === 'LillyBrain.kt') || ANDROID_PROJECT_FILES[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // 1-Click ZIP Exporter packaging all Android project files
  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zip = new JSZip();

      // Add all project files into the root folder
      for (const file of ANDROID_PROJECT_FILES) {
        zip.file(file.path, file.content);
      }

      // Add a helpful README.md for Android Studio
      const readmeContent = `# Lilly: Native Android AI Companion (Kotlin + Jetpack Compose)

This project is a 1:1 behavioral migration of the autonomous AI companion **Lilly** (\`aigfbutREAL.py\`).

## Quick Start in Android Studio
1. Unzip this project directory.
2. Open Android Studio (version 2024.1+ recommended).
3. Select **File > Open...** and select the unzipped directory containing \`settings.gradle.kts\`.
4. Allow Gradle to sync dependencies (Android Gradle Plugin 8.7.2, Kotlin 2.0.21, Compose BOM 2024.10.01).
5. Run on an Android device or emulator (minSdk 26, targetSdk 35).

## Building via Command Line
\`\`\`bash
chmod +x gradlew
./gradlew assembleDebug
\`\`\`
The output APK will be generated at \`app/build/outputs/apk/debug/app-debug.apk\`.

## Architecture Highlights
- **4-Tier Plaintext Memory**: \`permTerm/\`, \`longTerm/\`, \`medTerm/\`, \`shortTerm/\`, \`media/\`
- **Dynamic Identity**: \`FileMemoryRepository.loadSystemPrompt()\` scans permTerm files sorted alphabetically and attaches the verbatim \`TOOL_MECHANICS_BLOCK\`.
- **Sleep & Dream Cycles**: Background \`SleepStateMachine\` managing \`AWAKE\`, \`SLEEP_INERTIA\`, \`DREAMING\`, and \`DEEP_SLEEP\`.
- **Interruption Handling**: Waking up from dream states injects sleep inertia grogginess prompts before restoring full alertness.
- **Tools Supported**: \`[RECALL: <query>]\`, \`[CLOUD: <prompt>]\`, \`[break]\` for multi-bubble splitting.
`;
      zip.file('README.md', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lilly-android-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar Contract: 3 Zones (Wordmark - Nav Links - Primary CTA) */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-[#0d121f] border-b border-slate-800 shrink-0">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <span className="font-bold text-white text-sm">L</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Lilly Android Project
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'explorer' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            Codebase Explorer
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'playground' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            Architecture Sandbox
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'memory' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            4-Tier Memory
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'settings' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            Configuration Settings
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              activeTab === 'build' ? 'text-purple-400 font-semibold' : ''
            }`}
          >
            Build Instructions
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-md shadow-purple-900/30 transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <span>Packing ZIP...</span>
            ) : exportComplete ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Project ZIP</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Tab Selector (if viewport < md) */}
      <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-slate-900/90 border-b border-slate-800 text-xs shrink-0">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'explorer' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Explorer
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'playground' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Sandbox
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'memory' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Memory
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'settings' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('build')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'build' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400'
          }`}
        >
          Build
        </button>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
        {activeTab === 'explorer' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
            {/* Left Sidebar: File Tree */}
            <div className="lg:col-span-4 bg-[#0d121f] rounded-xl border border-slate-800 p-4 flex flex-col min-h-0 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <FolderGit2 className="w-4 h-4 text-purple-400" />
                  <span>Android Studio Structure</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {ANDROID_PROJECT_FILES.length} files
                </span>
              </div>

              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter files by name or layer..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ProjectTree
                  files={ANDROID_PROJECT_FILES}
                  selectedFile={selectedFile}
                  onSelectFile={file => setSelectedFile(file)}
                  searchQuery={searchQuery}
                />
              </div>
            </div>

            {/* Right Main Panel: Syntax-Highlighted Code Viewer */}
            <div className="lg:col-span-8 min-h-0 flex flex-col">
              <CodeViewer file={selectedFile} />
            </div>
          </div>
        )}

        {activeTab === 'playground' && (
          <div className="flex-1 min-h-0">
            <EnginePlayground />
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="flex-1 min-h-0">
            <MemoryInspector />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 min-h-0">
            <SettingsViewer />
          </div>
        )}

        {activeTab === 'build' && (
          <div className="flex-1 bg-[#0d121f] rounded-xl border border-slate-800 p-6 overflow-y-auto max-w-4xl mx-auto shadow-xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  Building & Running Lilly on Native Android
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Step-by-step instructions to compile the generated project in Android Studio or via Gradle CLI.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-purple-300">Method 1: Android Studio (Recommended)</div>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Click <strong className="text-white">Download Project ZIP</strong> in the top header.</li>
                  <li>Extract <code className="text-purple-300 font-mono">lilly-android-project.zip</code> to a folder of your choice.</li>
                  <li>Open Android Studio and click <strong className="text-white">Open</strong> (or File &gt; Open).</li>
                  <li>Select the extracted project directory containing <code className="text-purple-300 font-mono">settings.gradle.kts</code>.</li>
                  <li>Android Studio will automatically detect the Gradle 8.10 wrapper, AGP 8.7.2, and Kotlin 2.0.21.</li>
                  <li>Plug in your Android device (USB Debugging enabled) or start an Android Virtual Device (AVD).</li>
                  <li>Click <strong className="text-emerald-400">Run 'app' (Shift + F10)</strong>.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-purple-300">Method 2: Command Line (Gradle)</div>
                <div className="text-xs text-slate-300">
                  You can compile the debug APK straight from your terminal:
                </div>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-emerald-300 space-y-1">
                  <div>cd lilly-android-project</div>
                  <div>chmod +x gradlew</div>
                  <div>./gradlew assembleDebug</div>
                </div>
                <div className="text-xs text-slate-400">
                  The compiled APK will be located at:
                  <code className="text-slate-200 font-mono ml-1">app/build/outputs/apk/debug/app-debug.apk</code>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-purple-300">Authentication & First Launch</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As configured per specification, the app defaults to <strong>no API key</strong> for security. On first launch:
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>Navigate to the <strong>Settings</strong> tab in the bottom bar.</li>
                  <li>Select either <strong>OpenAI-Compatible</strong> (for llama.cpp / local server) or <strong>Gemini Native</strong>.</li>
                  <li>Enter your API key. Keys are encrypted on-device via <code className="text-purple-300 font-mono">EncryptedSharedPreferences</code> backed by the hardware AndroidKeyStore.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 bg-[#0d121f] border-t border-slate-800 text-center text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          Lilly AI Companion Architecture · 1:1 Behavioral Migration from <code className="text-slate-400">aigfbutREAL.py</code>
        </div>
        <div className="flex items-center gap-4">
          <span>Kotlin 2.0.21</span>
          <span>·</span>
          <span>Jetpack Compose (Material 3)</span>
          <span>·</span>
          <span>TargetSdk 35</span>
        </div>
      </footer>
    </div>
  );
}
