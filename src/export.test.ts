// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { ANDROID_PROJECT_FILES } from './data/androidProjectFiles';

describe('Project Export & Dynamic Chunk Loading', () => {
  it('dynamically imports jszip and gradleWrapperJar on-demand without top-level bundle bloat', async () => {
    const [{ default: JSZip }, { GRADLE_WRAPPER_JAR_BASE64 }] = await Promise.all([
      import('jszip'),
      import('./data/gradleWrapperJar')
    ]);

    expect(typeof JSZip).toBe('function');
    expect(typeof GRADLE_WRAPPER_JAR_BASE64).toBe('string');
    expect(GRADLE_WRAPPER_JAR_BASE64.length).toBeGreaterThan(1000);

    const zip = new JSZip();

    // Verify zip packaging works with files
    for (const file of ANDROID_PROJECT_FILES.slice(0, 3)) {
      zip.file(file.path, file.content);
    }
    zip.file('gradle/wrapper/gradle-wrapper.jar', GRADLE_WRAPPER_JAR_BASE64, { base64: true });

    const generated = await zip.generateAsync({ type: 'uint8array' });
    expect(generated.length).toBeGreaterThan(0);
    // Standard ZIP signature: 0x50 0x4B 0x03 0x04 ('PK\x03\x04')
    expect(generated[0]).toBe(0x50);
    expect(generated[1]).toBe(0x4b);
  });
});
