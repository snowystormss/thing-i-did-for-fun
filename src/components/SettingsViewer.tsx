import React, { useState } from 'react';
import { Sliders, Key, ShieldCheck, CheckCircle2, AlertCircle, Search, X, RotateCcw } from 'lucide-react';

interface SettingDef {
  key: string;
  name: string;
  category: 'A. Inference & Provider' | 'B. Cloud Search & Retriever' | 'C. Timers, Retention, & Formatting';
  defaultValue: string;
  type: 'string' | 'secret' | 'number' | 'float' | 'boolean' | 'enum';
  description: string;
}

export const SETTINGS_DEFAULTS: SettingDef[] = [
  // A. Inference & Provider Settings
  {
    key: 'inferenceProviderMode',
    name: 'Inference Provider Mode',
    category: 'A. Inference & Provider',
    defaultValue: 'OPENAI_COMPATIBLE',
    type: 'enum',
    description: 'Switches between OpenAI-compatible endpoints (llama.cpp, vLLM, OpenRouter) and Google Gemini Native REST/SSE.'
  },
  {
    key: 'apiUrl',
    name: 'API URL',
    category: 'A. Inference & Provider',
    defaultValue: 'http://127.0.0.1:8080/v1/chat/completions',
    type: 'string',
    description: 'Target completions endpoint when in OPENAI_COMPATIBLE mode.'
  },
  {
    key: 'apiKey',
    name: 'Primary API Key',
    category: 'A. Inference & Provider',
    defaultValue: '"" (NONE by default)',
    type: 'secret',
    description: 'Stored securely in EncryptedSharedPreferences (AndroidKeyStore AES-256). Required to send messages; supports both Gemini API keys and OpenAI keys.'
  },
  {
    key: 'modelName',
    name: 'Model Name',
    category: 'A. Inference & Provider',
    defaultValue: 'gemma-4-26b-a4b-it',
    type: 'string',
    description: 'Target LLM model name sent in request payload.'
  },
  {
    key: 'temperature',
    name: 'Temperature',
    category: 'A. Inference & Provider',
    defaultValue: '0.8',
    type: 'float',
    description: 'Sampling temperature for conversational responses (internal reflection tasks override to 0.2 or 0.0).'
  },
  {
    key: 'modelContextTokens',
    name: 'Model Context Tokens',
    category: 'A. Inference & Provider',
    defaultValue: '8192',
    type: 'number',
    description: 'Total hardware or model context window token limit.'
  },
  {
    key: 'contextUtilizationRatio',
    name: 'Context Utilization Ratio',
    category: 'A. Inference & Provider',
    defaultValue: '0.95',
    type: 'float',
    description: 'Safety utilization factor applied before reserving response tokens.'
  },
  {
    key: 'responseTokenReserve',
    name: 'Response Token Reserve',
    category: 'A. Inference & Provider',
    defaultValue: '2048',
    type: 'number',
    description: 'Reserved tokens dedicated exclusively to model generation.'
  },
  {
    key: 'conversationWindowMessages',
    name: 'Conversation Window Cap',
    category: 'A. Inference & Provider',
    defaultValue: '0 (unlimited before token budget)',
    type: 'number',
    description: 'When > 0, caps trailing history to last N messages before token budgeting.'
  },
  {
    key: 'resetContextOnStart',
    name: 'Reset Context On Start',
    category: 'A. Inference & Provider',
    defaultValue: 'true',
    type: 'boolean',
    description: 'Clears working RAM context on cold start or after contextTimeoutSeconds.'
  },
  {
    key: 'requestTimeoutSeconds',
    name: 'Request Timeout Seconds',
    category: 'A. Inference & Provider',
    defaultValue: '120',
    type: 'number',
    description: 'OkHttp read timeout for inference generation.'
  },
  {
    key: 'streamPreviewEnabled',
    name: 'Stream Preview Enabled',
    category: 'A. Inference & Provider',
    defaultValue: 'true',
    type: 'boolean',
    description: 'Live token streaming preview in UI via Server-Sent Events.'
  },
  {
    key: 'streamPreviewEditIntervalSeconds',
    name: 'Stream Edit Interval (s)',
    category: 'A. Inference & Provider',
    defaultValue: '1.2',
    type: 'float',
    description: 'Throttle interval between stream bubble UI updates.'
  },
  {
    key: 'streamPreviewMinDeltaChars',
    name: 'Stream Min Delta Chars',
    category: 'A. Inference & Provider',
    defaultValue: '60',
    type: 'number',
    description: 'Minimum characters accumulated before pushing stream update.'
  },

  // B. Cloud Search & Retriever Settings
  {
    key: 'cloudSearchEnabled',
    name: 'Cloud Search Enabled',
    category: 'B. Cloud Search & Retriever',
    defaultValue: 'true',
    type: 'boolean',
    description: 'Permits Lilly to invoke [CLOUD: <prompt>] tool calls.'
  },
  {
    key: 'cloudSearchApiKey',
    name: 'Cloud Search API Key',
    category: 'B. Cloud Search & Retriever',
    defaultValue: '"" (Falls back to apiKey)',
    type: 'secret',
    description: 'Optional dedicated API key for Cloud Agent research queries.'
  },
  {
    key: 'cloudSearchModel',
    name: 'Cloud Search Model',
    category: 'B. Cloud Search & Retriever',
    defaultValue: 'gemini-2.5-flash-lite',
    type: 'string',
    description: 'Gemini model utilized by the Cloud Agent for research & math.'
  },
  {
    key: 'retrieverMode',
    name: 'Retriever Mode',
    category: 'B. Cloud Search & Retriever',
    defaultValue: 'LOCAL_HYBRID',
    type: 'enum',
    description: 'LOCAL_HYBRID (on-device BM25/TF-IDF) or REMOTE_HTTP (external endpoint).'
  },
  {
    key: 'retrieverApiUrl',
    name: 'Retriever API URL',
    category: 'B. Cloud Search & Retriever',
    defaultValue: 'http://127.0.0.1:5001',
    type: 'string',
    description: 'Endpoint used when retrieverMode is set to REMOTE_HTTP.'
  },

  // C. Timers, Retention, & Formatting
  {
    key: 'timezoneName',
    name: 'Timezone Name',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: 'America/Chicago',
    type: 'string',
    description: 'ZoneId used for all timestamps, chat headers, and daily rollovers.'
  },
  {
    key: 'activeChatWindowMinutes',
    name: 'Active Chat Window (min)',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '5',
    type: 'number',
    description: 'Recent interaction window before Lilly considers entering idle state.'
  },
  {
    key: 'idleSortAfterMinutes',
    name: 'Idle Sort Threshold (min)',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '5',
    type: 'number',
    description: 'Inactivity threshold to enter DREAMING mode for memory reflection.'
  },
  {
    key: 'dreamShutdownMinutes',
    name: 'Dream Shutdown Threshold (min)',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '30',
    type: 'number',
    description: 'Duration in DREAMING before transitioning to DEEP_SLEEP hibernation.'
  },
  {
    key: 'contextTimeoutSeconds',
    name: 'Context Timeout (seconds)',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '1800 (30 minutes)',
    type: 'number',
    description: 'Inactivity triggers full conversation context reset and permTerm reload.'
  },
  {
    key: 'shortTermRetentionDays',
    name: 'Short-Term Retention',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '30 days',
    type: 'number',
    description: 'Expiration lifespan for shortTerm files and daily chat transcripts.'
  },
  {
    key: 'medTermRetentionDays',
    name: 'Medium-Term Retention',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '120 days',
    type: 'number',
    description: 'Lifespan for ongoing project notes and seasonal memories.'
  },
  {
    key: 'longTermRetentionDays',
    name: 'Long-Term Retention',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '365 days',
    type: 'number',
    description: 'Lifespan for major milestones and foundational history.'
  },
  {
    key: 'shortTermFileLimit / LineLimit',
    name: 'Short-Term Capacity Limits',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '20 files max / 100 lines each',
    type: 'number',
    description: 'File count ceiling and line truncation cap for shortTerm tier.'
  },
  {
    key: 'medTermFileLimit / LineLimit',
    name: 'Med-Term Capacity Limits',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '15 files max / 80 lines each',
    type: 'number',
    description: 'File count ceiling and line truncation cap for medTerm tier.'
  },
  {
    key: 'longTermFileLimit / LineLimit',
    name: 'Long-Term Capacity Limits',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '15 files max / 80 lines each',
    type: 'number',
    description: 'File count ceiling and line truncation cap for longTerm tier.'
  },
  {
    key: 'reflectionWebTopicLimit',
    name: 'Reflection Web Topic Limit',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '2',
    type: 'number',
    description: 'Maximum external research topics explored during dreaming cycle.'
  },
  {
    key: 'maxReplyBubbles',
    name: 'Max Reply Bubbles',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '3',
    type: 'number',
    description: 'Maximum discrete message bubbles Lilly can output in a single turn.'
  },
  {
    key: 'maxBubbleChunkChars',
    name: 'Max Bubble Chunk Characters',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '900',
    type: 'number',
    description: 'Character limit per bubble before splitting into the next bubble.'
  },
  {
    key: 'maxMessageChars',
    name: 'Max Message Characters',
    category: 'C. Timers, Retention, & Formatting',
    defaultValue: '1900',
    type: 'number',
    description: 'Hard safety cap for any single outbound message.'
  }
];

export const SettingsViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'A. Inference & Provider', 'B. Cloud Search & Retriever', 'C. Timers, Retention, & Formatting'];

  const filtered = SETTINGS_DEFAULTS.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.key.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#0d121f] rounded-xl border border-slate-800 shadow-xl overflow-hidden p-6 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            Configurable Settings & Defaults (All 34 Parameters)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted via Android Jetpack <code className="text-purple-300 font-mono">DataStore&lt;Preferences&gt;</code> and <code className="text-purple-300 font-mono">EncryptedSharedPreferences</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono" aria-live="polite">
            {filtered.length} of {SETTINGS_DEFAULTS.length} settings
          </span>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search settings by name, key, or description"
              placeholder="Search settings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus-visible:ring-1 focus-visible:ring-purple-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear settings search filter"
                className="absolute right-2 p-0.5 text-slate-500 hover:text-slate-300 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 my-4" role="tablist" aria-label="Settings categories">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Settings Grid / Table */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-slate-600" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-300">No matching settings found</p>
              <p className="text-xs text-slate-500">
                {search ? `No parameters matched "${search}". Try adjusting your keywords or category filter.` : 'No parameters in this category.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
          </div>
        ) : (
          filtered.map(setting => (
            <div
              key={setting.key}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-200">{setting.name}</span>
                  <span className="font-mono text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                    {setting.key}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    [{setting.type}]
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{setting.description}</p>
              </div>

              <div className="shrink-0 text-right sm:w-64">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Exact Default Value</span>
                <span className="font-mono text-xs text-emerald-400 font-medium break-all">
                  {setting.defaultValue}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
