// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { ProjectTree } from './ProjectTree';
import { AndroidFile } from '../data/androidProjectFiles';

const mockFiles: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/lilly/bot/LillyBrain.kt',
    name: 'LillyBrain.kt',
    category: 'kotlin_domain',
    language: 'kotlin',
    description: 'Brain orchestration engine',
    content: '// mock LillyBrain'
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    language: 'kotlin',
    description: 'Gradle settings',
    content: '// mock gradle'
  }
];

describe('ProjectTree Micro-UX', () => {
  it('renders files matching search query', () => {
    const html = renderToString(
      <ProjectTree
        files={mockFiles}
        selectedFile={mockFiles[0]}
        onSelectFile={() => {}}
        searchQuery="Brain"
      />
    );

    expect(html).toContain('LillyBrain.kt');
    expect(html).not.toContain('settings.gradle.kts');
    expect(html).not.toContain('No matching files found');
  });

  it('renders accessible empty state with clear action when no files match', () => {
    let cleared = false;
    const html = renderToString(
      <ProjectTree
        files={mockFiles}
        selectedFile={mockFiles[0]}
        onSelectFile={() => {}}
        searchQuery="nonexistent_xyz"
        onClearSearch={() => {
          cleared = true;
        }}
      />
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('No matching files found');
    expect(html).toContain('nonexistent_xyz');
    expect(html).toContain('Clear filter');
  });

  it('renders aria-selected and focus styles for file buttons', () => {
    const html = renderToString(
      <ProjectTree
        files={mockFiles}
        selectedFile={mockFiles[0]}
        onSelectFile={() => {}}
        searchQuery=""
      />
    );

    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('focus-visible:ring-1');
  });
});
