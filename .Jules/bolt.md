# Bolt's Journal - Critical Performance Learnings

## 2025-05-15 - Code-Splitting Heavy Export Dependencies and Binary Payloads
**Learning:** In client-side code viewers and scaffolding hubs that provide 1-click project ZIP export, statically importing `jszip` and large static base64 binary assets (like `gradle-wrapper.jar` base64 strings) bloats the main JavaScript chunk past Vite's 500 kB chunk threshold (~576 kB minified / 184 kB gzipped), forcing users to parse and execute compression tools on initial page load even if they only view code.
**Action:** Dynamically import client-side packaging utilities (`jszip`) and large base64 binary files via `Promise.all([import('jszip'), import('./data/gradleWrapperJar')])` on-demand within the export action handler. This dropped initial JS bundle size from 576.06 kB to 423.82 kB (a 26.4% reduction, -152.24 kB) and gzipped size from 184.46 kB to 116.11 kB (a 37.0% reduction, -68.35 kB), eliminating the Vite bundle threshold warning.
