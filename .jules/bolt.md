# Bolt's Journal - Critical Performance Learnings

## 2026-11-05 - Export Assets Bundle Splitting
**Learning:** In code showcase/explorer web applications featuring export or ZIP downloading, packaging heavy client-side archiving libraries (`jszip`) and raw embedded binaries (e.g. `gradleWrapperJar.ts` base64 string ~58 kB) statically in the entry point inflates the main application bundle over Vite's 500 kB threshold. Because export is an on-demand user intent, statically bundling them penalizes 100% of initial page visits.
**Action:** Always dynamically import compression libraries (`jszip`) and embedded binary payload modules asynchronously inside the click handler (`handleDownloadZip()`) using `Promise.all([import(...), import(...)])`. This offloads heavy payload to lazy chunks and cuts initial JS transfer size by >25%.
