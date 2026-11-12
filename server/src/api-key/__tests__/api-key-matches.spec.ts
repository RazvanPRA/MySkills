import { apiKeyMatches } from '../services/api-key-matches.js';

describe('apiKeyMatches', () => {
  const key = 'k'.repeat(40);

  it('accepts the exact key', () => {
    expect(apiKeyMatches(key, key)).toBe(true);
  });

  it('rejects a wrong key, including a prefix or a longer value', () => {
    expect(apiKeyMatches(key, 'x'.repeat(40))).toBe(false);
    expect(apiKeyMatches(key, key.slice(0, 39))).toBe(false);
    expect(apiKeyMatches(key, `${key}k`)).toBe(false);
  });

  it('rejects a missing or empty key', () => {
    expect(apiKeyMatches(key, undefined)).toBe(false);
    expect(apiKeyMatches(key, '')).toBe(false);
  });
});
