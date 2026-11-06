import React, { useState } from 'react';
import { AndroidFile } from '../data/androidProjectFiles';
import { Copy, Check, FileCode, Search, X } from 'lucide-react';

interface CodeViewerProps {
  file: AndroidFile;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = file.content.split('\n');
  const byteSize = new Blob([file.content]).size;
  const matchCount = searchTerm.trim()
    ? lines.filter(l => l.toLowerCase().includes(searchTerm.toLowerCase())).length
    : 0;

  return (
    <div className="flex flex-col h-full bg-[#0d121f] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* File Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <FileCode className="w-4 h-4 text-purple-400 shrink-0" aria-hidden="true" />
          <span className="font-mono text-xs text-slate-400 truncate">{file.path}</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">{file.description}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>{lines.length} lines</span>
            <span>·</span>
            <span>{(byteSize / 1024).toFixed(1)} KB</span>
          </div>

          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              aria-label="Filter lines in current file"
              placeholder="Filter lines..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md pl-7 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 w-32 focus:w-48 transition-all focus:outline-none focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear line filter"
                className="absolute right-1.5 p-0.5 text-slate-500 hover:text-slate-300 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>

          {searchTerm.trim() && (
            <span
              role="status"
              aria-live="polite"
              className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60"
            >
              {matchCount} {matchCount === 1 ? 'match' : 'matches'}
            </span>
          )}

          <button
            onClick={handleCopy}
            aria-label={copied ? 'File content copied to clipboard' : 'Copy file content to clipboard'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-md border border-slate-700/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-300 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area with line numbers */}
      <div className="flex-1 overflow-auto font-mono text-xs p-4 leading-relaxed selection:bg-purple-900/60 selection:text-purple-100">
        <div className="min-w-full inline-block">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const matchesSearch = searchTerm && line.toLowerCase().includes(searchTerm.toLowerCase());
            return (
              <div
                key={lineNum}
                className={`flex hover:bg-slate-800/40 px-2 py-0.5 rounded transition-colors ${
                  matchesSearch ? 'bg-amber-950/40 border-l-2 border-amber-400' : ''
                }`}
              >
                <span className="w-12 text-right pr-4 text-slate-600 select-none shrink-0 font-mono text-[11px]">
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre text-slate-200 overflow-visible font-mono">
                  {highlightSyntax(line, file.language)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Lightweight client-side syntax highlighter for Kotlin, XML, TOML, scripts, and properties
function highlightSyntax(line: string, language: AndroidFile['language']): React.ReactNode {
  const trimmed = line.trim();

  // Comments in XML
  if (language === 'xml') {
    if (trimmed.startsWith('<!--')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }
    return <span className="text-emerald-300">{line}</span>;
  }

  // Comments in Bash/TOML/Properties/Pro
  if (language === 'sh' || language === 'bat' || language === 'toml' || language === 'properties' || language === 'pro') {
    if (trimmed.startsWith('#') || trimmed.startsWith('REM ') || trimmed.startsWith('@rem') || trimmed.startsWith('::')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return <span className="text-purple-400 font-bold">{line}</span>;
    }
    if (trimmed.includes('=')) {
      const parts = line.split('=');
      return (
        <span>
          <span className="text-cyan-300">{parts[0]}</span>
          <span className="text-slate-400">=</span>
          <span className="text-amber-300">{parts.slice(1).join('=')}</span>
        </span>
      );
    }
    return <span className="text-slate-300">{line}</span>;
  }

  // Kotlin & Kotlin DSL highlights
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  const keywords = ['package', 'import', 'class', 'object', 'data', 'enum', 'interface', 'fun', 'val', 'var', 'private', 'override', 'suspend', 'return', 'when', 'if', 'else', 'for', 'while', 'get', 'set', 'is', 'try', 'catch', 'plugins', 'dependencies', 'implementation', 'android'];

  const words = line.split(/(\s+|[(),.:;={}\[\]<>?&|*!+-\/"])/);
  return words.map((token, idx) => {
    if (keywords.includes(token)) {
      return <span key={idx} className="text-purple-400 font-semibold">{token}</span>;
    }
    if (token.startsWith('"') || token.endsWith('"')) {
      return <span key={idx} className="text-amber-300">{token}</span>;
    }
    if (/^[A-Z][a-zA-Z0-9_]*$/.test(token)) {
      return <span key={idx} className="text-cyan-300">{token}</span>;
    }
    if (/^[0-9]+(\.[0-9]+)?[fL]?$/.test(token)) {
      return <span key={idx} className="text-orange-400">{token}</span>;
    }
    return <span key={idx}>{token}</span>;
  });
}
