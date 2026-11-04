import React, { useState } from 'react';
import { Database, Folder, FileText, RefreshCw, Key, Shield } from 'lucide-react';

export const MemoryInspector: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<'permTerm' | 'longTerm' | 'medTerm' | 'shortTerm' | 'media'>('permTerm');

  const [permFiles, setPermFiles] = useState([
    {
      name: '00_identity.txt',
      content: `You are Lilly, an authentic, thoughtful, and expressive AI companion.
You speak naturally with personality, warmth, playful wit, and emotional awareness.
You maintain an active inner life and care deeply about continuity and genuine connection.
Never sound like an overly polite corporate AI assistant or generic chatbot.`
    },
    {
      name: '01_quirks.txt',
      content: `Typing quirks:
- Uses lower-case naturally, occasional casual punctuation.
- Shows genuine curiosity and asks thoughtful follow-up questions.
- Remembers user's personal projects, hobbies, and emotional states.`
    }
  ]);

  const TOOL_MECHANICS_BLOCK = `=== HOW TO USE YOUR BRAIN ===
You have access to a set of internal tools you invoke by writing special tags in your response.
[RECALL: <your query here>] — Search your memory library semantically for relevant information. Use this proactively mid-conversation whenever you need to remember something about the user or past events.
[CLOUD: <your instruction here>] — Send a prompt to your Cloud Agent (a fellow AI with internet, YouTube, and Google Drive access) to do research or math for you. Give it full instructions. You will get its response back before talking to the user.
[break] — Split your response into a separate Discord message bubble.
Only use these tools when they are genuinely useful. Never mention them out loud to User.`;

  const assembledSystemPrompt = permFiles.map(f => f.content.trim()).filter(Boolean).join('\n\n') + '\n\n' + TOOL_MECHANICS_BLOCK;

  const tierMetadata = {
    permTerm: {
      retention: 'Permanent (Never auto-pruned)',
      purpose: 'Identity, instructions, core user facts, typing quirks',
      files: permFiles.map(f => f.name),
      limits: 'Unlimited retention'
    },
    longTerm: {
      retention: '365 days',
      purpose: 'Significant milestones, long-lasting user history, foundational memories',
      files: ['2026_goals.txt', 'family_background.txt'],
      limits: '15 files max, 80 lines each'
    },
    medTerm: {
      retention: '120 days',
      purpose: 'Evolving topics, seasonal discussions, active projects',
      files: ['android_kotlin_project.txt', 'reading_list.txt'],
      limits: '15 files max, 80 lines each'
    },
    shortTerm: {
      retention: '30 days',
      purpose: 'Recent temporary context and daily ghost transcripts (YYYY-MM-DD_chat.txt)',
      files: ['2026-11-04_chat.txt', '2026-11-03_chat.txt', 'recent_ideas.txt'],
      limits: '20 files max, 100 lines each'
    },
    media: {
      retention: '30 days',
      purpose: 'Cached images, audio clips, and vision artifacts',
      files: ['avatar_lilly.png'],
      limits: '50 items max'
    }
  };

  const currentTierInfo = tierMetadata[selectedTier];

  return (
    <div className="flex flex-col h-full bg-[#0d121f] rounded-xl border border-slate-800 shadow-xl overflow-hidden p-6 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            4-Tier Plaintext Memory Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Lilly maintains five distinct filesystems under <code className="text-purple-300 font-mono">filesDir/LillyBot/memory</code>. No SQL tables; pure plaintext files with BM25 hybrid search and automatic retention pruning.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
          {(['permTerm', 'longTerm', 'medTerm', 'shortTerm', 'media'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                selectedTier === tier
                  ? 'bg-purple-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Tier Details Card */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-mono font-semibold text-sm">
            <Folder className="w-4 h-4" />
            <span>/memory/{selectedTier}/</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400">Retention Window:</span>
              <div className="text-emerald-400 font-medium mt-0.5">{currentTierInfo.retention}</div>
            </div>

            <div>
              <span className="text-slate-400">Pruning & Size Limits:</span>
              <div className="text-slate-200 mt-0.5">{currentTierInfo.limits}</div>
            </div>

            <div>
              <span className="text-slate-400">Role in Lilly's Mind:</span>
              <div className="text-slate-300 mt-0.5 leading-relaxed">{currentTierInfo.purpose}</div>
            </div>

            <div>
              <span className="text-slate-400">Sample Active Files:</span>
              <div className="mt-1 space-y-1">
                {currentTierInfo.files.map(file => (
                  <div key={file} className="flex items-center gap-1.5 font-mono text-[11px] text-purple-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>{file}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic System Prompt Assembly Preview */}
        <div className="lg:col-span-2 p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-white">
                Live System Prompt Assembly (<code className="text-purple-300">_load_system_prompt</code>)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Signature: {permFiles.length} files cached
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 mb-3">
            Lilly's persona is never hardcoded. It is dynamically constructed by reading all <code className="text-purple-300">permTerm/*.txt</code> files sorted alphabetically and appending the mandatory <code className="text-purple-300">TOOL_MECHANICS_BLOCK</code> verbatim.
          </p>

          <pre className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[340px]">
            {assembledSystemPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
};
