/**
 * Prism core plus the grammars content uses. Grammars register themselves on the global
 * `Prism` (prism-core sets `global.Prism`), so the load order matters: clike → javascript →
 * typescript; markup → jsx → tsx.
 */
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-yaml';

/** Fence names used in content → Prism grammar names. */
const ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  py: 'python',
  yml: 'yaml',
  html: 'markup',
  xml: 'markup',
  golang: 'go',
  postgres: 'sql',
  postgresql: 'sql',
};

export function grammarFor(language: string | undefined): Prism.Grammar | undefined {
  if (!language) {
    return undefined;
  }
  const name = language.toLowerCase();
  return Prism.languages[ALIASES[name] ?? name];
}

export { Prism };
