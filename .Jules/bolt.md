# Bolt's Performance Journal ⚡

## 2026-11-06 - Dynamic Import for Client-Side ZIP Packaging & Binary Blobs
**Learning:** In hybrid showcases that feature on-demand archive export (like packaging whole native mobile projects with binary Gradle wrapper JARs), statically bundling `jszip` and base64 binaries adds ~290 kB raw (~73 kB gzipped) of blocking JavaScript to the initial application bundle even when users only browse code or test the sandbox.
**Action:** Always lazy-load compression libraries and large base64 binary assets inside the export event handler using `Promise.all([import('jszip'), import('./data/largeAsset')])`. This prevents initial bundle bloat and keeps the main thread unblocked during initial hydration and view rendering.
