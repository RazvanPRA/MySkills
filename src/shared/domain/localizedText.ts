import { z } from 'zod';

/** Content text: Romanian is required, English is optional (content may start in one language). */
export const localizedTextSchema = z.object({
  ro: z.string().trim().min(1),
  en: z.string().trim().min(1).optional(),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export type ResolvedText = {
  text: string;
  /** True when the requested language was missing and Romanian was shown instead. */
  isFallback: boolean;
};

/** Picks the text in `language`, falling back to Romanian (design system §8). */
export function resolveText(value: LocalizedText, language: 'ro' | 'en'): ResolvedText {
  if (language === 'en' && value.en) {
    return { text: value.en, isFallback: false };
  }
  return { text: value.ro, isFallback: language === 'en' };
}
