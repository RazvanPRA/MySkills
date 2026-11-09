// ş ţ Ş Ţ (cedilla) instead of ș ț Ș Ț (comma below) is a common Romanian encoding mistake.
const CEDILLA_FORMS = /[ŞşŢţ]/;

/** True when the text uses cedilla forms that should be comma-below ș/ț. */
export const hasCedillaDiacritics = (text: string): boolean => CEDILLA_FORMS.test(text);
