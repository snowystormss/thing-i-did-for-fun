import React from 'react';
import { AndroidFile } from '../data/androidProjectFiles';
import { FileCode, FileText, Settings, Layers, Box, Cpu, HardDrive, Smartphone, Check } from 'lucide-react';

interface ProjectTreeProps {
  files: AndroidFile[];
  selectedFile: AndroidFile;
  onSelectFile: (file: AndroidFile) => void;
  searchQuery: string;
}

export const ProjectTree: React.FC<ProjectTreeProps> = ({
  files,
  selectedFile,
  onSelectFile,
  searchQuery
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
                      onClick={() => onSelectFile(file)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 font-medium'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="shrink-0">
                        {file.language === 'kotlin' ? (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-semibold">KT</span>
                        ) : file.language === 'xml' ? (
                          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">XML</span>
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
