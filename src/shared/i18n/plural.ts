export type RomanianPluralForms = {
  /** n = 1: "1 întrebare" */
  one: string;
  /** n = 0, or n % 100 in 2..19: "3 întrebări", "112 întrebări" */
  few: string;
  /** everything else: "20 de întrebări", "100 de întrebări" */
  other: string;
};

/** Romanian cardinal plural category (CLDR rule), without relying on Intl.PluralRules in Hermes. */
export function romanianPlural(n: number): keyof RomanianPluralForms {
  const abs = Math.abs(n);
  if (!Number.isInteger(abs)) {
    return 'few';
  }
  if (abs === 1) {
    return 'one';
  }
  const lastTwo = abs % 100;
  return abs === 0 || (lastTwo >= 1 && lastTwo <= 19) ? 'few' : 'other';
}

/** Picks the Romanian form and replaces `{n}` with the count. */
export function pluralRo(n: number, forms: RomanianPluralForms): string {
  return forms[romanianPlural(n)].replace('{n}', String(n));
}

/** English: "1 question" / "2 questions". */
export function pluralEn(n: number, one: string, other: string): string {
  return (n === 1 ? one : other).replace('{n}', String(n));
}
