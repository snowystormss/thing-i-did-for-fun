// @ts-ignore
import { describe, it, expect } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProjectTree } from './components/ProjectTree';
import { ANDROID_PROJECT_FILES } from './data/androidProjectFiles';

describe('ProjectTree Micro-UX and Accessibility', () => {
  it('renders files matching search query and includes role="option" and aria-selected', () => {
    const selected = ANDROID_PROJECT_FILES.find(f => f.name === 'LillyBrain.kt')!;
    const html = renderToStaticMarkup(
      React.createElement(ProjectTree, {
        files: ANDROID_PROJECT_FILES,
        selectedFile: selected,
        onSelectFile: () => {},
        searchQuery: 'LillyBrain'
      })
    );

    expect(html).toContain('LillyBrain.kt');
    expect(html).toContain('role="option"');
    expect(html).toContain('aria-selected="true"');
  });

  it('renders an accessible empty state with clear action when no files match query', () => {
    const selected = ANDROID_PROJECT_FILES[0];
    const html = renderToStaticMarkup(
      React.createElement(ProjectTree, {
        files: ANDROID_PROJECT_FILES,
        selectedFile: selected,
        onSelectFile: () => {},
        searchQuery: 'NonExistentFile12345',
        onClearSearch: () => {}
      })
    );

    expect(html).toContain('No matching files found');
    expect(html).toContain('Clear filter');
    expect(html).toContain('NonExistentFile12345');
  });
});
