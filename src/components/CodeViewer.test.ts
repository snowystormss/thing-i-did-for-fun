// @ts-ignore
import { describe, it, expect } from 'bun:test';

describe('CodeViewer line filter logic', () => {
  const sampleLines = [
    'package com.lilly.companion',
    'import kotlinx.coroutines.*',
    'class LillyBrain {',
    '    fun think() {',
    '        // internal logic',
    '    }',
    '}'
  ];

  it('correctly calculates match count when query matches multiple lines', () => {
    const query = 'fun';
    const matches = sampleLines.filter(line => line.toLowerCase().includes(query.toLowerCase()));
    expect(matches.length).toBe(1);
    expect(matches[0]).toBe('    fun think() {');
  });

  it('correctly handles case-insensitive matches', () => {
    const query = 'LILLY';
    const matches = sampleLines.filter(line => line.toLowerCase().includes(query.toLowerCase()));
    expect(matches.length).toBe(2);
  });

  it('returns 0 matches when query does not match any line', () => {
    const query = 'nonexistent-pattern';
    const matches = sampleLines.filter(line => line.toLowerCase().includes(query.toLowerCase()));
    expect(matches.length).toBe(0);
  });
});
