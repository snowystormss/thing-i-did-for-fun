// @ts-ignore
import { describe, it, expect } from 'bun:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProjectTree } from './ProjectTree';
import { AndroidFile } from '../data/androidProjectFiles';

const sampleFiles: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/lilly/LillyBrain.kt',
    name: 'LillyBrain.kt',
    language: 'kotlin',
    category: 'kotlin_domain',
    description: 'Autonomous companion brain',
    content: 'class LillyBrain'
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Root Gradle build script',
    content: '// build'
  }
];

describe('ProjectTree', () => {
  it('renders matching files when search matches', () => {
    const html = renderToString(
      React.createElement(ProjectTree, {
        files: sampleFiles,
        selectedFile: sampleFiles[0],
        onSelectFile: () => {},
        searchQuery: 'Brain'
      })
    );

    expect(html).toContain('LillyBrain.kt');
    expect(html).toContain('1 files found for &quot;Brain&quot;');
    expect(html).not.toContain('No matching files');
  });

  it('renders accessible empty state and clear button when search matches nothing', () => {
    let clearCalled = false;
    const html = renderToString(
      React.createElement(ProjectTree, {
        files: sampleFiles,
        selectedFile: sampleFiles[0],
        onSelectFile: () => {},
        searchQuery: 'nonexistent_file',
        onClearSearch: () => {
          clearCalled = true;
        }
      })
    );

    expect(html).toContain('No matching files');
    expect(html).toContain('No files matched “');
    expect(html).toContain('nonexistent_file');
    expect(html).toContain('Clear filter');
    expect(html).toContain('0 files found for &quot;nonexistent_file&quot;');
  });

  it('does not render clear button when onClearSearch is not provided in empty state', () => {
    const html = renderToString(
      React.createElement(ProjectTree, {
        files: sampleFiles,
        selectedFile: sampleFiles[0],
        onSelectFile: () => {},
        searchQuery: 'nonexistent_file'
      })
    );

    expect(html).toContain('No matching files');
    expect(html).not.toContain('Clear filter');
  });
});
