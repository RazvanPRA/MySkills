import {
  contentIdSchema,
  evaluationResultSchema,
  isoDateTimeSchema,
  levelSchema,
  localDateSchema,
  localizedTextSchema,
  resolveText,
  reviewRatingSchema,
} from '..';

describe('localizedTextSchema', () => {
  it('requires Romanian and allows optional English', () => {
    expect(localizedTextSchema.safeParse({ ro: 'Salut' }).success).toBe(true);
    expect(localizedTextSchema.safeParse({ ro: 'Salut', en: 'Hi' }).success).toBe(true);
  });

  it('rejects missing or blank Romanian text', () => {
    expect(localizedTextSchema.safeParse({ en: 'Hi' }).success).toBe(false);
    expect(localizedTextSchema.safeParse({ ro: '   ' }).success).toBe(false);
  });
});

describe('resolveText', () => {
  it('returns English when it exists', () => {
    expect(resolveText({ ro: 'Salut', en: 'Hi' }, 'en')).toEqual({ text: 'Hi', isFallback: false });
  });

  it('falls back to Romanian and flags it', () => {
    expect(resolveText({ ro: 'Salut' }, 'en')).toEqual({ text: 'Salut', isFallback: true });
  });

  it('never flags Romanian as a fallback', () => {
    expect(resolveText({ ro: 'Salut', en: 'Hi' }, 'ro')).toEqual({
      text: 'Salut',
      isFallback: false,
    });
  });
});

describe('contentIdSchema', () => {
  it.each(['react', 'react.hooks.use-effect', 'go.concurrency.q12', 'sql-2'])('accepts %s', id => {
    expect(contentIdSchema.safeParse(id).success).toBe(true);
  });

  it.each(['React', 'react..hooks', 'react.', '-react', 'react hooks', ''])('rejects "%s"', id => {
    expect(contentIdSchema.safeParse(id).success).toBe(false);
  });
});

describe('date schemas', () => {
  it('validates local dates and ISO date-times', () => {
    expect(localDateSchema.safeParse('2026-11-09').success).toBe(true);
    expect(localDateSchema.safeParse('9.11.2026').success).toBe(false);
    expect(isoDateTimeSchema.safeParse('2026-11-09T08:30:00.000Z').success).toBe(true);
    expect(isoDateTimeSchema.safeParse('2026-11-09T08:30:00+02:00').success).toBe(true);
    expect(isoDateTimeSchema.safeParse('2026-11-09').success).toBe(false);
  });
});

describe('levelSchema, reviewRatingSchema, evaluationResultSchema', () => {
  it('accept only known values', () => {
    expect(levelSchema.safeParse('senior').success).toBe(true);
    expect(levelSchema.safeParse('principal').success).toBe(false);
    expect(reviewRatingSchema.safeParse(4).success).toBe(true);
    expect(reviewRatingSchema.safeParse(5).success).toBe(false);
  });

  it('keeps partial-credit scores within 0..1', () => {
    expect(evaluationResultSchema.safeParse({ correct: false, score: 0.5 }).success).toBe(true);
    expect(evaluationResultSchema.safeParse({ correct: true, score: 1.2 }).success).toBe(false);
  });
});
