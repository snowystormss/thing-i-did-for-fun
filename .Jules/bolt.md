# Bolt's Performance Journal

## 2026-11-10 - Dynamic Import of ZIP Exporter & Binary Base64 Assets
**Learning:** Static top-level imports of heavy client-side export dependencies (`jszip`, ~96 kB) and large binary asset strings (`GRADLE_WRAPPER_JAR_BASE64`, ~58 kB base64 string) balloon the initial entry chunk to 576.06 kB, exceeding Vite's 500 kB chunk threshold and unnecessarily penalizing Time-to-Interactive (TTI) for users who are merely browsing the codebase or using the interactive sandboxes.
**Action:** Always dynamically import `jszip` and large binary payload modules (`await Promise.all([import('jszip'), import('./data/gradleWrapperJar')])`) inside the export action handler (`handleDownloadZip`). This isolates export utilities into separate lazy chunks, dropping the primary entry bundle down to ~424 kB (-26.4%).
