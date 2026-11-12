import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Android system file dialogs (Storage Access Framework), for backups. Codegen reads this
 * spec (package.json → codegenConfig) and generates NativeDataFilesSpec for Kotlin.
 */
export interface Spec extends TurboModule {
  /** "Save as" dialog; resolves false when the user cancels. */
  saveText(fileName: string, mimeType: string, text: string): Promise<boolean>;
  /** "Open" dialog; resolves the file's UTF-8 text, or null when the user cancels. */
  openText(mimeTypes: ReadonlyArray<string>): Promise<string | null>;
}

// `get`, not `getEnforcing`: a missing module (old build, other platform) disables this
// feature instead of crashing the app at startup.
export default TurboModuleRegistry.get<Spec>('DataFiles');
