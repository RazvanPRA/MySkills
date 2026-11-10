import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildContentCatalog } from '@/features/content';
import { parseMatrix } from '../matrix/parseMatrix';
import { bumpMinor, type ExistingPack, matrixToPacks } from '../matrix/toPacks';

const sample = [
  '# Matrix',
  '',
  'Free text is ignored.',
  '',
  '## Frontend (`fe`)',
  '',
  '### React (`react`)',
  '',
  '| Subiect | Junior | Mid | Senior |',
  '| --- | --- | --- | --- |',
  '| Hooks (`hooks`) | Junior hooks. | Mid hooks. | Senior hooks. |',
  '| RSC (`rsc`) | — |  | Senior RSC. |',
  '',
  '- `hooks`: [React docs](https://react.dev/reference/react/hooks), [Effects](https://react.dev/learn)',
  '',
  '## Backend (`be`)',
  '',
  '### NestJS (`nestjs`)',
  '',
  '| Subiect | Junior | Mid | Senior |',
  '| :-- | :-: | --: | --- |',
  '| Modules (`modules`) | J. | M. | — |',
].join('\n');

const noExisting = new Map<string, ExistingPack>();

describe('parseMatrix', () => {
  it('reads packs, categories, rows, cells and resources', () => {
    const { packs, errors } = parseMatrix(sample);
    expect(errors).toEqual([]);
    expect(packs.map(pack => pack.id)).toEqual(['fe', 'be']);
    const react = packs[0]?.categories[0];
    expect(react).toMatchObject({ id: 'react', title: 'React' });
    expect(react?.rows[0]).toEqual({
      id: 'hooks',
      title: 'Hooks',
      cells: { junior: 'Junior hooks.', mid: 'Mid hooks.', senior: 'Senior hooks.' },
      resources: [
        { title: 'React docs', url: 'https://react.dev/reference/react/hooks' },
        { title: 'Effects', url: 'https://react.dev/learn' },
      ],
    });
  });

  it('treats an empty cell or "—" as "no topic at this level"', () => {
    const rsc = parseMatrix(sample).packs[0]?.categories[0]?.rows[1];
    expect(rsc?.cells).toEqual({ senior: 'Senior RSC.' });
  });

  it('accepts CRLF line endings and Prettier-aligned tables', () => {
    const aligned = sample
      .replace(
        '| Modules (`modules`) | J. | M. | — |',
        '| Modules (`modules`)   | J.   | M.  | —  |',
      )
      .replace(/\n/g, '\r\n');
    const { packs, errors } = parseMatrix(aligned);
    expect(errors).toEqual([]);
    expect(packs[1]?.categories[0]?.rows[0]?.cells).toEqual({ junior: 'J.', mid: 'M.' });
  });

  it.each([
    ['## Frontend', 'line 1: pack heading: expected "Title (`id`)"'],
    ['## Frontend (`Front End`)', 'line 1: pack heading: invalid id "Front End"'],
    ['### React (`react`)', 'line 1: category "react" is outside a pack'],
    ['## A (`a`)\n| Hooks (`hooks`) | a | b | c |', 'line 2: table row outside a category'],
    ['## A (`a`)\n### R (`r`)\n| Hooks (`hooks`) | a | b |', 'line 3: expected 4 columns, found 3'],
    [
      '## A (`a`)\n### R (`r`)\n| Hooks | a | b | c |',
      'line 3: row title: expected "Title (`id`)"',
    ],
    ['## A (`a`)\n## B (`a`)', 'line 2: duplicate pack id "a"'],
    ['## A (`a`)\n### R (`r`)\n## B (`b`)\n### S (`r`)', 'line 4: duplicate category id "r"'],
    [
      '## A (`a`)\n### R (`r`)\n| X (`x`) | a | b | c |\n| Y (`x`) | a | b | c |',
      'line 4: duplicate row id "x" in "r"',
    ],
    [
      '## A (`a`)\n### R (`r`)\n- `nope`: [Doc](https://example.com)',
      'line 3: resources for unknown row "nope"',
    ],
    [
      '## A (`a`)\n### R (`r`)\n| X (`x`) | a | b | c |\n- `x`: see the docs',
      'line 4: no [title](https://...) links for "x"',
    ],
  ])('reports %j', (markdown, expected) => {
    expect(parseMatrix(markdown).errors).toEqual([expect.stringContaining(expected)]);
  });
});

describe('matrixToPacks', () => {
  const generate = (existing = noExisting) => matrixToPacks(parseMatrix(sample).packs, existing);
  const frontendPack = () => {
    const [fe] = generate();
    if (!fe) {
      throw new Error('the sample matrix should produce the "fe" pack');
    }
    return fe;
  };

  it('creates one topic per filled level, chained by prerequisites', () => {
    const [fe] = generate();
    expect(fe?.topics.map(topic => [topic.id, topic.prerequisites])).toEqual([
      ['react.hooks.junior', []],
      ['react.hooks.mid', ['react.hooks.junior']],
      ['react.hooks.senior', ['react.hooks.mid']],
      ['react.rsc.senior', []],
    ]);
    expect(fe?.topics[1]).toMatchObject({
      categoryId: 'react',
      title: { ro: 'Hooks' },
      level: 'mid',
      summary: { ro: 'Mid hooks.' },
      tags: ['hooks'],
    });
    expect(fe?.topics[1]?.resources).toHaveLength(2);
  });

  it('orders categories by their position in the document, across packs', () => {
    const categories = generate().flatMap(pack => pack.categories);
    expect(categories.map(c => [c.id, c.order, c.testKinds])).toEqual([
      ['react', 10, ['knowledge']],
      ['nestjs', 20, ['knowledge']],
    ]);
  });

  it('starts new packs at 1.0.0 with no exercises', () => {
    expect(generate()[0]).toMatchObject({ version: '1.0.0', schemaVersion: 1, exercises: [] });
  });

  it('keeps exercises and the version when the topics did not change', () => {
    const exercises = [{ id: 'react.hooks.mid.q1' }];
    const existing = new Map([['fe', { ...frontendPack(), version: '1.3.0', exercises }]]);
    expect(generate(existing)[0]).toMatchObject({ version: '1.3.0', exercises });
  });

  it('bumps the minor version when categories or topics changed', () => {
    const fe = frontendPack();
    const stale = { ...fe, version: '1.3.2', topics: fe.topics.slice(1) };
    expect(generate(new Map([['fe', stale]]))[0]?.version).toBe('1.4.0');
  });

  it('bumpMinor resets the patch number', () => {
    expect(bumpMinor('2.9.7')).toBe('2.10.0');
  });
});

describe('docs/competency-matrix.md', () => {
  const markdown = readFileSync(
    path.join(__dirname, '..', '..', '..', 'docs', 'competency-matrix.md'),
    'utf8',
  );
  const parsed = parseMatrix(markdown);

  it('parses without errors', () => {
    expect(parsed.errors).toEqual([]);
  });

  it('produces content with no catalog issues (references, ids, diacritics)', () => {
    const packs = matrixToPacks(parsed.packs, noExisting);
    const { catalog, issues } = buildContentCatalog(packs, { get: () => undefined });
    expect(issues).toEqual([]);
    expect(catalog.categories.length).toBeGreaterThan(0);
    for (const category of catalog.categories) {
      expect(catalog.topicsByCategory.get(category.id)?.length).toBeGreaterThan(0);
    }
  });
});
