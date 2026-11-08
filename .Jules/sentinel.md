# Sentinel's Journal - Critical Security Learnings

## 2025-05-15 - Zip Slip in Native Memory Importer
**Vulnerability:** In `FileMemoryRepository.importMemoryFromZip`, uncompressed files were extracted via `File(memBase, entry.name)` without verifying entry canonical paths. Malicious ZIP archives with `../` relative traversal sequences could overwrite arbitrary app storage files outside the memory repository (such as `shared_prefs/`, databases, or native libraries).
**Learning:** Standard library `ZipInputStream` does not automatically validate or sanitize archive entry names against directory traversal attacks. Any file export/import workflow accepting external archives is vulnerable to Zip Slip unless explicitly guarded.
**Prevention:** Always resolve the destination target's `canonicalPath` before opening an output stream, and verify that it starts with `baseDir.canonicalPath + File.separator`. Additionally, sanitize dynamic filenames using `File(name).name` and boundary checks before writing or deleting.
