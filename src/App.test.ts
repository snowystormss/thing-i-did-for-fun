// @ts-ignore - Dynamically imported bun:test avoids TypeScript errors during tsc --noEmit
import { describe, expect, it } from 'bun:test';
import { ANDROID_PROJECT_FILES } from './data/androidProjectFiles';

describe('Project Export & Dynamic Import Optimization', () => {
  it('dynamically loads JSZip and creates a valid zip archive with project files', async () => {
    // Verify JSZip dynamic import works cleanly
    const { default: JSZip } = await import('jszip');
    expect(JSZip).toBeDefined();

    const zip = new JSZip();

    // Verify key files are present in ANDROID_PROJECT_FILES
    const gradlewFile = ANDROID_PROJECT_FILES.find(f => f.path === 'gradlew');
    expect(gradlewFile).toBeDefined();

    // Add files to zip
    for (const file of ANDROID_PROJECT_FILES.slice(0, 5)) {
      zip.file(file.path, file.content);
    }

    // Verify gradleWrapperJar dynamic import works cleanly
    const { GRADLE_WRAPPER_JAR_BASE64 } = await import('./data/gradleWrapperJar');
    expect(GRADLE_WRAPPER_JAR_BASE64).toBeDefined();
    expect(typeof GRADLE_WRAPPER_JAR_BASE64).toBe('string');
    expect(GRADLE_WRAPPER_JAR_BASE64.length).toBeGreaterThan(1000);

    zip.file('gradle/wrapper/gradle-wrapper.jar', GRADLE_WRAPPER_JAR_BASE64, { base64: true });

    // Generate output as Uint8Array (Node/Bun environment compatible)
    const zipBytes = await zip.generateAsync({ type: 'uint8array' });
    expect(zipBytes.byteLength).toBeGreaterThan(0);
    // Standard ZIP file signature: 0x50, 0x4B, 0x03, 0x04 ("PK\x03\x04")
    expect(zipBytes[0]).toBe(0x50);
    expect(zipBytes[1]).toBe(0x4b);
  });
});
