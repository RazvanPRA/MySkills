import { pluralEn, pluralRo, romanianPlural } from '../plural';

const forms = { one: '{n} întrebare', few: '{n} întrebări', other: '{n} de întrebări' };

describe('romanianPlural', () => {
  it.each([
    [1, 'one'],
    [0, 'few'],
    [2, 'few'],
    [19, 'few'],
    [20, 'other'],
    [100, 'other'],
    [101, 'few'],
    [119, 'few'],
    [120, 'other'],
    [-1, 'one'],
  ])('%p is "%s"', (n, form) => {
    expect(romanianPlural(n)).toBe(form);
  });

  it('uses "few" for fractions', () => {
    expect(romanianPlural(1.5)).toBe('few');
  });
});

describe('pluralRo', () => {
  it('fills the count into the chosen form', () => {
    expect(pluralRo(1, forms)).toBe('1 întrebare');
    expect(pluralRo(5, forms)).toBe('5 întrebări');
    expect(pluralRo(25, forms)).toBe('25 de întrebări');
  });
});

describe('pluralEn', () => {
  it('uses the singular only for 1', () => {
    expect(pluralEn(1, '{n} day', '{n} days')).toBe('1 day');
    expect(pluralEn(0, '{n} day', '{n} days')).toBe('0 days');
  });
});
