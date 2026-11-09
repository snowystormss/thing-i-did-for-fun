// @ts-ignore - dynamic import keeps ts-checker happy without @types/bun
import { describe, it, expect } from 'bun:test';
import { ANDROID_PROJECT_FILES } from './androidProjectFiles';

describe('Zip Slip and Directory Traversal Defense Verification', () => {
  it('FileMemoryRepository content contains canonical path checks against Zip Slip', () => {
    const file = ANDROID_PROJECT_FILES.find(f => f.path.endsWith('FileMemoryRepository.kt'));
    expect(file).toBeDefined();

    const code = file?.content ?? '';
    // Must contain canonicalMemBase
    expect(code).toContain('val canonicalMemBase = memBase.canonicalPath');
    // Must validate entry canonicalFile path starts with canonicalMemBase + separator
    expect(code).toContain('targetFile.path.startsWith(canonicalMemBase + File.separator)');
    expect(code).toContain('Zip entry is outside target memory directory (Zip Slip)');
  });

  it('FileMemoryRepository content guards filename against directory traversal in writeMemoryFile and deleteMemoryFile', () => {
    const file = ANDROID_PROJECT_FILES.find(f => f.path.endsWith('FileMemoryRepository.kt'));
    expect(file).toBeDefined();

    const code = file?.content ?? '';
    expect(code).toContain('File(filename).name');
    expect(code).toContain('Invalid filename traversal attempt');
  });

  it('verifies path traversal canonical resolution logic', () => {
    // Simulating path resolution defense
    const baseDir = '/data/user/0/com.lilly.bot/files/LillyBot/memory';
    const separator = '/';

    const isSafePath = (entryName: string) => {
      // Basic normalization / traversal simulation
      const path = require('path');
      const resolved = path.resolve(baseDir, entryName);
      return resolved.startsWith(baseDir + separator);
    };

    expect(isSafePath('shortTerm/note.txt')).toBe(true);
    expect(isSafePath('permTerm/00_persona.txt')).toBe(true);
    expect(isSafePath('../shared_prefs/lilly_secure_prefs.xml')).toBe(false);
    expect(isSafePath('../../databases/main.db')).toBe(false);
    expect(isSafePath('../../../etc/passwd')).toBe(false);
  });
});
