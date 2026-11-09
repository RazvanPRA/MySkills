import { z } from 'zod';
import type { PackFile } from '../packFiles';
import { allIssues, formatIssue, summarize, validatePacks } from '../validation';

const exerciseTypes = {
  get: (type: string) =>
    type === 'single_choice' ? { payloadSchema: z.object({ correct: z.number() }) } : undefined,
};

const goodPack = {
  id: 'good',
  version: '1.0.0',
  schemaVersion: 1,
  title: { ro: 'Bun' },
  categories: [{ id: 'react', title: { ro: 'React' }, testKinds: ['knowledge'], order: 1 }],
  topics: [
    {
      id: 'react.hooks',
      categoryId: 'react',
      title: { ro: 'Hooks' },
      level: 'mid',
      summary: { ro: 'x' },
    },
  ],
  exercises: [
    {
      id: 'react.hooks.q1',
      type: 'single_choice',
      topicId: 'react.hooks',
      level: 'mid',
      difficulty: 2,
      estimatedSeconds: 45,
      prompt: { ro: 'Întrebare?' },
      payload: { correct: 1 },
      explanation: { ro: 'Explicație.' },
    },
  ],
};

/** A pack with one of each mistake content authors typically make. */
const brokenPack = {
  ...goodPack,
  id: 'broken',
  categories: [],
  topics: [{ ...goodPack.topics[0], id: 'go.channels', categoryId: 'go' }],
  exercises: [{ ...goodPack.exercises[0], id: 'react.hooks.q2', type: 'sql_query' }],
};

const file = (fileName: string, json: unknown): PackFile => ({ fileName, ok: true, json });

describe('validatePacks', () => {
  it('passes valid content', () => {
    const report = validatePacks({
      files: [file('good.json', goodPack)],
      exerciseTypes,
      manifestUpToDate: true,
    });
    expect(allIssues(report)).toEqual([]);
    expect(summarize(report)).toBe(
      '✔ Content is valid: 1 packs, 1 categories, 1 topics, 1 exercises',
    );
  });

  it('fails on a pack with deliberate errors, keeping the valid content', () => {
    const report = validatePacks({
      files: [file('good.json', goodPack), file('broken.json', brokenPack)],
      exerciseTypes,
      manifestUpToDate: true,
    });
    const codes = allIssues(report).map(issue => issue.code);
    expect(codes).toEqual(expect.arrayContaining(['unknown_category', 'unknown_exercise_type']));
    expect(report.result.catalog.exercisesById.size).toBe(1);
    expect(summarize(report)).toMatch(/^✖ \d+ error\(s\)/);
  });

  it('reports unreadable JSON, id/file mismatches and a stale manifest', () => {
    const report = validatePacks({
      files: [
        { fileName: 'bad.json', ok: false, error: 'Unexpected token' },
        file('renamed.json', goodPack),
      ],
      exerciseTypes,
      manifestUpToDate: false,
    });
    const messages = report.fileIssues.map(issue => issue.message);
    expect(messages).toEqual([
      'Invalid JSON: Unexpected token',
      'Pack id "good" must match its file name "renamed.json"',
      'index.generated.ts is out of date: run pnpm content:index',
    ]);
  });
});

describe('formatIssue', () => {
  it('shows severity, location, code and effect on one line', () => {
    expect(
      formatIssue({
        code: 'invalid_payload',
        severity: 'error',
        packId: 'good',
        entityId: 'react.hooks.q1',
        message: 'correct: Invalid input',
        excluded: true,
      }),
    ).toBe('✖ good › react.hooks.q1: [invalid_payload] correct: Invalid input (excluded)');
  });
});
