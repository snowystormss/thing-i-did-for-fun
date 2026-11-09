// @ts-ignore - dynamic bun:test import avoids TypeScript error during `bun run lint` (tsc --noEmit)
const { describe, it, expect } = await import('bun:test');

import { ANDROID_PROJECT_FILES } from './data/androidProjectFiles';

describe('App Performance & Dynamic Export Verification', () => {
  it('dynamically imports jszip and packages project files on demand', async () => {
    // Verify JSZip dynamically imports as expected
    const { default: JSZip } = await import('jszip');
    expect(JSZip).toBeDefined();

    const zip = new JSZip();

    // Package project files as in App.tsx
    for (const file of ANDROID_PROJECT_FILES) {
      if (file.path === 'gradlew') {
        zip.file(file.path, file.content, { unixPermissions: 0o755 });
      } else {
        zip.file(file.path, file.content);
      }
    }

    // Verify dynamic import of gradle wrapper base64
    const { GRADLE_WRAPPER_JAR_BASE64 } = await import('./data/gradleWrapperJar');
    expect(GRADLE_WRAPPER_JAR_BASE64).toBeDefined();
    expect(GRADLE_WRAPPER_JAR_BASE64.length).toBeGreaterThan(0);

    zip.file('gradle/wrapper/gradle-wrapper.jar', GRADLE_WRAPPER_JAR_BASE64, { base64: true });
    zip.file('README.md', '# Lilly Test');

    const zipObject = zip.file('gradle/wrapper/gradle-wrapper.jar');
    expect(zipObject).not.toBeNull();

    const generated = await zip.generateAsync({ type: 'uint8array' });
    expect(generated.byteLength).toBeGreaterThan(0);
  });

  it('contains expected project file structure for native export', () => {
    const filePaths = ANDROID_PROJECT_FILES.map(f => f.path);
    expect(filePaths).toContain('settings.gradle.kts');
    expect(filePaths).toContain('build.gradle.kts');
    expect(filePaths).toContain('gradlew');
    expect(filePaths).toContain('gradle/wrapper/gradle-wrapper.properties');
    expect(filePaths).toContain('app/build.gradle.kts');
    expect(filePaths).toContain('app/src/main/AndroidManifest.xml');
  });
});
