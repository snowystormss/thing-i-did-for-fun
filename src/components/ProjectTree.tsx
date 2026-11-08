import React from 'react';
import { AndroidFile } from '../data/androidProjectFiles';
import { FileCode, FileText, Settings, Layers, Box, Cpu, HardDrive, Smartphone, Check, SearchX } from 'lucide-react';

interface ProjectTreeProps {
  files: AndroidFile[];
  selectedFile: AndroidFile;
  onSelectFile: (file: AndroidFile) => void;
  searchQuery: string;
  onClearSearch?: () => void;
}

export const ProjectTree: React.FC<ProjectTreeProps> = ({
  files,
  selectedFile,
  onSelectFile,
  searchQuery,
  onClearSearch
}) => {
  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: AndroidFile['category']) => {
    switch (category) {
      case 'gradle':
      case 'config':
        return <Settings className="w-4 h-4 text-amber-400" />;
      case 'manifest':
      case 'res':
        return <Box className="w-4 h-4 text-emerald-400" />;
      case 'kotlin_domain':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'kotlin_data':
        return <HardDrive className="w-4 h-4 text-blue-400" />;
      case 'kotlin_service':
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 'kotlin_ui':
        return <Smartphone className="w-4 h-4 text-rose-400" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (category: AndroidFile['category']) => {
    switch (category) {
      case 'gradle': return 'Build & Gradle Catalog';
      case 'config': return 'Project Configuration';
      case 'manifest': return 'Android Manifest';
      case 'res': return 'Resources (Strings & Themes)';
      case 'kotlin_domain': return 'Domain: Brain & State Machine';
      case 'kotlin_data': return 'Data: Memory & Inference';
      case 'kotlin_service': return 'Services & Background Work';
      case 'kotlin_ui': return 'Jetpack Compose UI & Theme';
    }
  };

  // Group files by category
  const categories: AndroidFile['category'][] = [
    'gradle',
    'manifest',
    'kotlin_domain',
    'kotlin_data',
    'kotlin_service',
    'kotlin_ui',
    'res',
    'config'
  ];

  if (filteredFiles.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-start pt-8 pb-4 px-4 text-center"
      >
        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
          <SearchX className="w-5 h-5 text-purple-400/80" aria-hidden="true" />
        </div>
        <p className="text-xs font-medium text-slate-300">No matching files found</p>
        <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] break-words">
          No files match &ldquo;{searchQuery}&rdquo;
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-3 px-3 py-1 text-xs font-medium text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1">
      <div className="space-y-4">
        {categories.map(category => {
          const categoryFiles = filteredFiles.filter(f => f.category === category);
          if (categoryFiles.length === 0) return null;

          return (
            <div key={category} className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                {getCategoryIcon(category)}
                <span>{getCategoryLabel(category)}</span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">({categoryFiles.length})</span>
              </div>
              <div className="space-y-0.5 pt-0.5">
                {categoryFiles.map(file => {
                  const isSelected = selectedFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      type="button"
                      aria-selected={isSelected}
                      onClick={() => onSelectFile(file)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-medium shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="shrink-0">
                        {file.language === 'kotlin' ? (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-semibold">KT</span>
                        ) : file.language === 'xml' ? (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">XML</span>
                        ) : file.language === 'toml' ? (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">TOML</span>
                        ) : file.language === 'sh' || file.language === 'bat' ? (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">SH</span>
                        ) : (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">CFG</span>
                        )}
                      </span>
                      <span className="truncate flex-1 font-mono text-[11px]">{file.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
