// Dynamic import bun:test to avoid TypeScript issues when bun types are not in tsconfig
// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { ANDROID_PROJECT_FILES } from './data/androidProjectFiles';

describe('Lazy export ZIP packaging verification', () => {
  it('loads JSZip and Gradle wrapper dynamically and builds archive', async () => {
    const [{ default: JSZip }, { GRADLE_WRAPPER_JAR_BASE64 }] = await Promise.all([
      import('jszip'),
      import('./data/gradleWrapperJar')
    ]);

    expect(JSZip).toBeDefined();
    expect(GRADLE_WRAPPER_JAR_BASE64).toBeDefined();

    const zip = new JSZip();

    for (const file of ANDROID_PROJECT_FILES.slice(0, 5)) {
      zip.file(file.path, file.content);
    }
    zip.file('gradle/wrapper/gradle-wrapper.jar', GRADLE_WRAPPER_JAR_BASE64, { base64: true });

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });
    expect(buffer.length).toBeGreaterThan(0);
  });
});
