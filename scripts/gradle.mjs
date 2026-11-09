// Runs the Android Gradle wrapper with the given tasks, on Windows (gradlew.bat) and Unix (gradlew).
// Usage: node scripts/gradle.mjs assembleRelease
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const androidDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'android');
const isWindows = process.platform === 'win32';
// Absolute path: cmd.exe may be configured not to search the current directory
// (NoDefaultCurrentDirectoryInExePath), so a bare "gradlew.bat" is not found.
const wrapper = path.join(androidDir, isWindows ? 'gradlew.bat' : 'gradlew');

const result = spawnSync(isWindows ? `"${wrapper}"` : wrapper, process.argv.slice(2), {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWindows,
});
process.exit(result.status ?? 1);
