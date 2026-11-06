import { describe, it, expect } from 'bun:test';
import path from 'path';

/**
 * Validates whether a file target is securely located within base directory,
 * matching the canonical path verification pattern implemented in FileMemoryRepository.
 */
function isPathContained(baseDir: string, relativeOrChildPath: string): boolean {
  // Normalize both POSIX and Windows style delimiters
  const sanitized = relativeOrChildPath.replace(/\\/g, '/');
  const canonicalBase = path.resolve(baseDir);
  const canonicalTarget = path.resolve(baseDir, sanitized);
  return canonicalTarget.startsWith(canonicalBase + path.sep);
}

describe('Zip Slip & Path Traversal Prevention in FileMemoryRepository', () => {
  const memBase = '/data/user/0/com.lilly.bot/files/LillyBot/memory';

  it('rejects zip entries attempting directory traversal outside memBase', () => {
    const maliciousPaths = [
      '../../shared_prefs/compromised.xml',
      '../databases/tokens.db',
      '../../../etc/hosts',
      'permTerm/../../../app_data/leak.txt',
      '..\\..\\windows_style_traversal'
    ];

    for (const malPath of maliciousPaths) {
      expect(isPathContained(memBase, malPath)).toBe(false);
    }
  });

  it('permits legitimate memory file paths within tier directories', () => {
    const legitimatePaths = [
      'permTerm/00_persona.txt',
      'shortTerm/2026-11-04_chat.txt',
      'medTerm/project_notes.txt',
      'longTerm/milestones.txt',
      'media/avatar.png'
    ];

    for (const validPath of legitimatePaths) {
      expect(isPathContained(memBase, validPath)).toBe(true);
    }
  });
});
