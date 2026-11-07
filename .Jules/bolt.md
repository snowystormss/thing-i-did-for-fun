# Bolt's Journal - Critical Performance Learnings

## 2026-03-30 - Lazy Loading Heavy Export Libraries and Large Embedded Data
**Learning:** In interactive showcase applications that offer 1-click project export (such as full repository ZIP downloads with embedded binary assets like `gradle-wrapper.jar`), statically importing `jszip` and large base64 data modules bloats the critical initial JavaScript entry chunk (pushing it above 500 kB). Because export actions are user-invoked and non-critical during initial page render, statically bundling them penalizes first contentful paint (FCP) and time to interactive (TTI) for all visitors.
**Action:** Always dynamically import client-side export utilities (`jszip`) and large static binary data (`gradleWrapperJar.ts`) via `Promise.all([import(...), import(...)])` within the export handler. This splits out the export machinery into separate on-demand chunks, keeping the main application bundle well under 500 kB.
