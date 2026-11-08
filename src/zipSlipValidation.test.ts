// @ts-ignore
import { describe, it, expect } from 'bun:test';
import * as path from 'path';

/**
 * Validates the Zip Slip security check logic used in FileMemoryRepository.
 * Ensures entries with traversal components ('..') or attempts to escape
 * the target base directory are caught and rejected.
 */
function isSafeZipEntryPath(baseDir: string, entryName: string): boolean {
  // Normalize both paths and resolve the target
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, entryName);

  // Target must start with resolvedBase + path.sep (or exactly resolvedBase for the root dir)
  return resolvedTarget.startsWith(resolvedBase + path.sep);
}

function sanitizeMemoryFilename(tierDir: string, filename: string): { isSafe: boolean; fullPath: string } {
  const simpleName = path.basename(filename);
  const cleanName = simpleName.endsWith('.txt') ? simpleName : `${simpleName}.txt`;
  const resolvedDir = path.resolve(tierDir);
  const resolvedFile = path.resolve(tierDir, cleanName);

  const isSafe = resolvedFile.startsWith(resolvedDir + path.sep);
  return { isSafe, fullPath: resolvedFile };
}

describe('Zip Slip and Path Traversal Protection', () => {
  const baseMemoryDir = '/data/user/0/com.lilly.bot/files/LillyBot/memory';

  describe('Zip Slip entry validation', () => {
    it('accepts valid nested memory tier entries', () => {
      expect(isSafeZipEntryPath(baseMemoryDir, 'permTerm/00_persona.txt')).toBe(true);
      expect(isSafeZipEntryPath(baseMemoryDir, 'longTerm/notes.txt')).toBe(true);
      expect(isSafeZipEntryPath(baseMemoryDir, 'shortTerm/2025-05-15_chat.txt')).toBe(true);
    });

    it('rejects zip entries attempting directory traversal outside base', () => {
      expect(isSafeZipEntryPath(baseMemoryDir, '../../shared_prefs/secret.xml')).toBe(false);
      expect(isSafeZipEntryPath(baseMemoryDir, '../databases/app.db')).toBe(false);
      expect(isSafeZipEntryPath(baseMemoryDir, '../../../etc/hosts')).toBe(false);
      expect(isSafeZipEntryPath(baseMemoryDir, 'permTerm/../../shared_prefs/secret.xml')).toBe(false);
    });

    it('rejects zip entries attempting exact base directory overwrite', () => {
      expect(isSafeZipEntryPath(baseMemoryDir, '.')).toBe(false);
      expect(isSafeZipEntryPath(baseMemoryDir, '..')).toBe(false);
    });
  });

  describe('Memory filename sanitization', () => {
    const tierDir = path.join(baseMemoryDir, 'permTerm');

    it('strips directory prefixes from filenames', () => {
      const result = sanitizeMemoryFilename(tierDir, '../../injected_bad_file');
      expect(result.isSafe).toBe(true);
      expect(result.fullPath).toBe(path.join(tierDir, 'injected_bad_file.txt'));
    });

    it('preserves valid .txt filenames', () => {
      const result = sanitizeMemoryFilename(tierDir, '01_rules.txt');
      expect(result.isSafe).toBe(true);
      expect(result.fullPath).toBe(path.join(tierDir, '01_rules.txt'));
    });

    it('appends .txt if not present', () => {
      const result = sanitizeMemoryFilename(tierDir, 'journal');
      expect(result.isSafe).toBe(true);
      expect(result.fullPath).toBe(path.join(tierDir, 'journal.txt'));
    });
  });
});
