import React, { useState } from 'react';
import { Cpu, Play, Sparkles, Moon, Sun, ArrowRight, ShieldCheck } from 'lucide-react';

export const EnginePlayground: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'regex' | 'bubbles' | 'sleep' | 'tokens'>('regex');

  // Regex State
  const defaultSampleText = `<think>
I need to remember what user told me yesterday about their cat and also reply warmly.
Let's see: [RECALL: user cat name]
</think>
Hey there! I was just thinking about you. [break] How is Milo doing today? [CLOUD: Milo cat health facts]`;

  const [inputRegexText, setInputRegexText] = useState(defaultSampleText);

  // Bubble State
  const [bubbleInput, setBubbleInput] = useState(
    "Hi! It's so good to see you again.\n\n[break]I was just reviewing my notes from our conversation yesterday.\n\n[break]Did you end up finishing that project you were working on?"
  );
  const [maxBubbles, setMaxBubbles] = useState(3);
  const [maxChars, setMaxChars] = useState(300);

  // Sleep State Machine State
  const [currentMode, setCurrentMode] = useState<'AWAKE' | 'SLEEP_INERTIA' | 'DREAMING' | 'DEEP_SLEEP'>('AWAKE');
  const [lastEventLog, setLastEventLog] = useState<string>('System initialized in AWAKE mode.');

  // Token Budgeting State
  const [modelContextTokens, setModelContextTokens] = useState(8192);
  const [utilizationRatio, setUtilizationRatio] = useState(0.95);
  const [reserveTokens, setReserveTokens] = useState(2048);
  const [systemPromptTokens, setSystemPromptTokens] = useState(650);

  // Token calculations
  const totalUsable = Math.floor(modelContextTokens * utilizationRatio);
  const historyBudget = Math.max(256, totalUsable - reserveTokens - systemPromptTokens);

  // Regex implementation mirroring Kotlin TextParsers
  const stripModelThinking = (text: string) => {
    return text.replace(/<(thought|think)>[\s\S]*?<\/\1>/gi, '').replace(/\n{3,}/g, '\n\n').trim();
  };

  const stripReplyControlTokens = (text: string) => {
    let t = text.replace(/<(thought|think)>[\s\S]*?<\/\1>/gi, '');
    t = t.replace(/<\|channel\|>thought[\s\S]*?<\|channel\|>/g, '');
    t = t.replace(/<\|thought\|>[\s\S]*?<\|end_of_thought\|>/g, '');
    t = t.replace(/^(assistant|user):\s*/gi, '');
    t = t.replace(/\[break\]/gi, '\n\n');
    t = t.replace(/\n{3,}/g, '\n\n');
    return t.trim();
  };

  const streamVisibleText = (raw: string) => {
    let visible = stripReplyControlTokens(raw);
    const lastOpen = visible.lastIndexOf('[');
    const lastClose = visible.lastIndexOf(']');
    if (lastOpen > lastClose) {
      visible = visible.substring(0, lastOpen);
    }
    return visible.trimEnd();
  };

  // Split bubbles algorithm
  const computeBubbles = () => {
    const cleaned = stripReplyControlTokens(bubbleInput);
    if (!cleaned) return [];
    const parts = cleaned.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    const bubbles: string[] = [];
    let current = '';

    for (const part of parts) {
      if (!current) {
        current = part;
      } else if (current.length + part.length + 2 <= maxChars) {
        current += '\n\n' + part;
      } else {
        bubbles.push(current.trim());
        current = part;
        if (bubbles.length >= maxBubbles - 1) break;
      }
    }
    if (current) bubbles.push(current.trim());
    return bubbles.slice(0, maxBubbles);
  };

  const handleSimulateUserInterruption = () => {
    if (currentMode === 'AWAKE') {
      setLastEventLog('User message received while AWAKE. Context continues normally.');
    } else if (currentMode === 'DREAMING') {
      setCurrentMode('SLEEP_INERTIA');
      setLastEventLog(
        'INTERRUPTED FROM DREAM! Lilly entered SLEEP_INERTIA. Injected waking note: "[System note: Lilly was mid-dream/reflecting when the user suddenly spoke. Wake up with gentle surprise or slight disorientation.]"'
      );
    } else if (currentMode === 'DEEP_SLEEP') {
      setCurrentMode('SLEEP_INERTIA');
      setLastEventLog(
        'INTERRUPTED FROM DEEP SLEEP! Lilly entered SLEEP_INERTIA. Injected waking note: "[System note: Lilly was in deep sleep and is waking up. Acknowledge waking up naturally.]"'
      );
    } else {
      setCurrentMode('AWAKE');
      setLastEventLog('Sleep inertia expired. Lilly is fully alert (AWAKE).');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d121f] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Playground Nav */}
      <div className="flex items-center gap-2 p-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('regex')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'regex' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Regex & Token Sanitizer
        </button>
        <button
          onClick={() => setActiveTab('bubbles')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'bubbles' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Multi-Bubble Splitter
        </button>
        <button
          onClick={() => setActiveTab('sleep')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'sleep' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sleep State Machine
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'tokens' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Token Budgeter
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'regex' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Regex Tokenizer & Control Stripper</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tests Lilly's exact regex parsing: removes reasoning blocks (<code className="text-purple-300">&lt;thought&gt;</code>), control tokens, strips role prefixes, and masks incomplete tool tags during SSE streaming.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Raw Model Stream Input</label>
                <textarea
                  value={inputRegexText}
                  onChange={e => setInputRegexText(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300">stripModelThinking() Output</label>
                  <pre className="mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-300 whitespace-pre-wrap min-h-[60px]">
                    {stripModelThinking(inputRegexText) || '<empty>'}
                  </pre>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">streamVisibleText() [Hides incomplete tags]</label>
                  <pre className="mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 whitespace-pre-wrap min-h-[60px]">
                    {streamVisibleText(inputRegexText) || '<empty>'}
                  </pre>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">stripReplyControlTokens() [Final user text]</label>
                  <pre className="mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-purple-300 whitespace-pre-wrap min-h-[60px]">
                    {stripReplyControlTokens(inputRegexText) || '<empty>'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bubbles' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Multi-Bubble Splitter & Formatting</h3>
              <p className="text-xs text-slate-400 mt-1">
                Lilly breaks long replies into discrete message bubbles using <code className="text-purple-300">[break]</code> tags and paragraph boundaries up to <code className="text-purple-300">maxReplyBubbles</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300">Assistant Response Input</label>
                  <textarea
                    value={bubbleInput}
                    onChange={e => setBubbleInput(e.target.value)}
                    rows={8}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400">maxReplyBubbles: {maxBubbles}</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={maxBubbles}
                      onChange={e => setMaxBubbles(Number(e.target.value))}
                      className="w-full accent-purple-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">maxBubbleChunkChars: {maxChars}</label>
                    <input
                      type="range"
                      min={100}
                      max={600}
                      step={20}
                      value={maxChars}
                      onChange={e => setMaxChars(Number(e.target.value))}
                      className="w-full accent-purple-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Generated Discord Message Bubbles ({computeBubbles().length})</label>
                <div className="mt-2 space-y-3 p-4 bg-slate-950 rounded-lg border border-slate-800 min-h-[220px]">
                  {computeBubbles().map((bubble, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-900 border border-purple-900/50 rounded-2xl rounded-bl-sm text-xs text-slate-200 shadow-sm leading-relaxed"
                    >
                      <div className="text-[10px] text-purple-400 font-mono mb-1">Bubble #{i + 1} ({bubble.length} chars)</div>
                      <div className="whitespace-pre-wrap">{bubble}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sleep' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Sleep & Dream State Machine</h3>
              <p className="text-xs text-slate-400 mt-1">
                Lilly cycles through states: <strong className="text-emerald-400">AWAKE</strong> &rarr; <strong className="text-purple-400">DREAMING</strong> (inactivity &ge; 5m) &rarr; <strong className="text-blue-400">DEEP_SLEEP</strong> (dreaming &ge; 30m). Sudden interruptions trigger <strong className="text-amber-400">SLEEP_INERTIA</strong>.
              </p>
            </div>

            {/* Current State Indicator */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">CURRENT COMPANION MODE</div>
                <div className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                  {currentMode === 'AWAKE' && <Sun className="w-5 h-5 text-emerald-400" />}
                  {currentMode === 'SLEEP_INERTIA' && <Sparkles className="w-5 h-5 text-amber-400" />}
                  {currentMode === 'DREAMING' && <Moon className="w-5 h-5 text-purple-400" />}
                  {currentMode === 'DEEP_SLEEP' && <Moon className="w-5 h-5 text-blue-400" />}
                  <span className={
                    currentMode === 'AWAKE' ? 'text-emerald-400' :
                    currentMode === 'SLEEP_INERTIA' ? 'text-amber-400' :
                    currentMode === 'DREAMING' ? 'text-purple-400' : 'text-blue-400'
                  }>{currentMode}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMode('AWAKE')}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                >
                  Set Awake
                </button>
                <button
                  onClick={() => setCurrentMode('DREAMING')}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                >
                  Set Dreaming
                </button>
                <button
                  onClick={() => setCurrentMode('DEEP_SLEEP')}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                >
                  Set Deep Sleep
                </button>
              </div>
            </div>

            {/* Interruption Action */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-slate-200">Test Inactivity & Interruptions</div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSimulateUserInterruption}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Simulate User Message In Current State
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                <div className="text-slate-500 text-[10px] uppercase font-semibold">Event Execution Log:</div>
                <div className="mt-1 text-purple-300">{lastEventLog}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Token Budgeting & Context Utilization Math</h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculates maximum history capacity: <code className="text-purple-300">usableTokens = (modelContextTokens * contextUtilizationRatio) - responseTokenReserve - systemPromptTokens</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>modelContextTokens</span>
                    <span className="font-mono text-purple-400">{modelContextTokens}</span>
                  </div>
                  <input
                    type="range"
                    min={4096}
                    max={32768}
                    step={1024}
                    value={modelContextTokens}
                    onChange={e => setModelContextTokens(Number(e.target.value))}
                    className="w-full accent-purple-500 mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>contextUtilizationRatio</span>
                    <span className="font-mono text-purple-400">{(utilizationRatio * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.7}
                    max={1.0}
                    step={0.01}
                    value={utilizationRatio}
                    onChange={e => setUtilizationRatio(Number(e.target.value))}
                    className="w-full accent-purple-500 mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>responseTokenReserve</span>
                    <span className="font-mono text-purple-400">{reserveTokens}</span>
                  </div>
                  <input
                    type="range"
                    min={512}
                    max={4096}
                    step={128}
                    value={reserveTokens}
                    onChange={e => setReserveTokens(Number(e.target.value))}
                    className="w-full accent-purple-500 mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>systemPromptTokens (permTerm + tools)</span>
                    <span className="font-mono text-purple-400">{systemPromptTokens}</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={50}
                    value={systemPromptTokens}
                    onChange={e => setSystemPromptTokens(Number(e.target.value))}
                    className="w-full accent-purple-500 mt-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-200">Calculated Budget Breakdown</div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Total Raw Model Context:</span>
                      <span className="font-mono text-slate-200">{modelContextTokens} tokens</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Usable (at {(utilizationRatio * 100).toFixed(0)}%):</span>
                      <span className="font-mono text-slate-200">{totalUsable} tokens</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Reserved for Response:</span>
                      <span className="font-mono text-amber-400">-{reserveTokens} tokens</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">System Prompt & Tools:</span>
                      <span className="font-mono text-purple-400">-{systemPromptTokens} tokens</span>
                    </div>
                    <div className="flex justify-between py-2 font-semibold">
                      <span className="text-emerald-400">Max Conversation History Budget:</span>
                      <span className="font-mono text-emerald-400 text-sm">{historyBudget} tokens</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-[11px] text-slate-400 font-mono">
                  &bull; History walks backwards from newest message to oldest.<br />
                  &bull; Messages exceeding {historyBudget} tokens are pruned safely.<br />
                  &bull; System prompt and permanent memory are never truncated.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
