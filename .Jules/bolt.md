# Bolt's Performance Journal

## 2025-05-18 - Dynamic Import for Large Binaries & Packaging Libraries
**Learning:** In dual-purpose web apps that mirror and export a full native codebase (like Lilly Android), static imports of export tools (such as `jszip` at ~138 kB) and binary base64 assets (such as `gradleWrapperJar.ts` at 57 kB) bloat the main entry chunk beyond Vite's 500 kB limit, slowing initial load even though the user may only browse the explorer tabs.
**Action:** Always load packaging libraries (`jszip`) and binary embeds dynamically via `await Promise.all([import(...), ...])` inside the event handler that triggers the export. This reduced the initial bundle from 576 kB to 424 kB (a 26.4% raw size reduction, and 37% gzipped size reduction) while keeping export functionality instantaneous on demand.
