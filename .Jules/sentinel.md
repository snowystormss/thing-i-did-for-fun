# Sentinel's Journal - Critical Security Learnings

## 2025-05-15 - Zip Slip Path Traversal in Memory Zip Imports
**Vulnerability:** In `FileMemoryRepository.importMemoryFromZip`, unvalidated zip entry names allowed directory traversal (e.g., `../../shared_prefs/secret.xml` or arbitrary relative paths) escaping the target `memBase` directory and overwriting critical application sandbox files.
**Learning:** Archive unpacking utilities that blindly combine base directory paths with entry names (`File(memBase, entry.name)`) without verifying canonical boundaries leave filesystems open to arbitrary file creation and overwrite vulnerabilities. Furthermore, in projects maintaining web-mirrored Android code (`src/data/androidProjectFiles.ts`), security fixes to native code must also be mirrored to the exported bundle.
**Prevention:** Always resolve the destination path to its canonical representation (`targetFile.canonicalPath`) and assert that it begins with `baseDir.canonicalPath + File.separator` before performing filesystem modifications or opening write streams.
