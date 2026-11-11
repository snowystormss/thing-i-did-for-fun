# Bolt's Journal - Critical Performance Learnings

## 2025-05-15 - Dynamic Loading of Large Client-Side Export Utilities
**Learning:** Heavy client-side archive generators (e.g., `jszip` ~96 kB minified) and static base64 binary assets (e.g., `gradleWrapperJar.ts` ~58 kB) that are only required during explicit on-demand user actions (such as 1-click ZIP export) severely penalize initial load time when imported statically at top level. In Vite builds, this easily pushes the entry chunk past the 500 kB budget (576.06 kB).
**Action:** Always dynamically import export tools and large binary assets (`await Promise.all([import('jszip'), import('./data/gradleWrapperJar')])`) inside the user action handler. This reduced the initial chunk size to 423.82 kB (152.24 kB / 26.4% savings; 37.1% gzipped savings), completely removing the Vite chunk size warning.
