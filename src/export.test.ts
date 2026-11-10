// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { ANDROID_PROJECT_FILES } from './data/androidProjectFiles';

describe('Project export assets', () => {
  it('dynamically loads JSZip and gradleWrapperJar successfully', async () => {
    const [{ default: JSZip }, { GRADLE_WRAPPER_JAR_BASE64 }] = await Promise.all([
      import('jszip'),
      import('./data/gradleWrapperJar')
    ]);

    expect(JSZip).toBeDefined();
    expect(typeof GRADLE_WRAPPER_JAR_BASE64).toBe('string');
    expect(GRADLE_WRAPPER_JAR_BASE64.length).toBeGreaterThan(1000);

    const zip = new JSZip();
    zip.file('test.txt', 'hello');
    const zipData = await zip.generateAsync({ type: 'uint8array' });
    expect(zipData.byteLength).toBeGreaterThan(0);
  });

  it('validates ANDROID_PROJECT_FILES count and integrity', () => {
    expect(ANDROID_PROJECT_FILES.length).toBeGreaterThan(0);
    const gradlew = ANDROID_PROJECT_FILES.find(f => f.path === 'gradlew');
    expect(gradlew).toBeDefined();
  });
});
