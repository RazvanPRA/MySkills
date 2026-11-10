/** Settings → your data: export, import, reset. */
export const backupRo = {
  title: 'Datele tale',
  help: 'Progresul, notițele și testele sunt doar pe acest telefon. Exportă-le ca să nu le pierzi.',
  export: 'Exportă datele',
  import: 'Importă date',
  reset: 'Șterge toate datele',
  exported: 'Datele au fost salvate.',
  exportFailed: 'Exportul a eșuat. Încearcă din nou.',
  importFailed: 'Importul a eșuat; datele tale au rămas neschimbate.',
  resetFailed: 'Ștergerea a eșuat; datele tale au rămas neschimbate.',
  importConfirm: (date: string, contents: string) =>
    `Înlocuiești datele de pe acest telefon cu copia din ${date} (${contents})?`,
  replace: 'Înlocuiește',
  resetConfirm:
    'Ștergi progresul, notițele, testele și setările de pe acest telefon? Nu se poate anula.',
  deleteAll: 'Șterge tot',
  cancel: 'Anulează',
  problems: {
    not_json: 'Fișierul ales nu este o copie a datelor.',
    not_backup: 'Fișierul ales nu este o copie Senior Prep.',
    newer_version: 'Copia vine dintr-o versiune mai nouă a aplicației. Actualizează aplicația.',
    invalid: 'Copia este deteriorată; datele tale au rămas neschimbate.',
  },
};

export const backupEn: typeof backupRo = {
  title: 'Your data',
  help: 'Progress, notes and tests live only on this phone. Export them so you do not lose them.',
  export: 'Export data',
  import: 'Import data',
  reset: 'Delete all data',
  exported: 'Your data was saved.',
  exportFailed: 'Export failed. Try again.',
  importFailed: 'Import failed; your data is unchanged.',
  resetFailed: 'Deleting failed; your data is unchanged.',
  importConfirm: (date: string, contents: string) =>
    `Replace the data on this phone with the copy from ${date} (${contents})?`,
  replace: 'Replace',
  resetConfirm: 'Delete progress, notes, tests and settings on this phone? This cannot be undone.',
  deleteAll: 'Delete all',
  cancel: 'Cancel',
  problems: {
    not_json: 'The chosen file is not a data copy.',
    not_backup: 'The chosen file is not a Senior Prep copy.',
    newer_version: 'The copy comes from a newer app version. Update the app.',
    invalid: 'The copy is damaged; your data is unchanged.',
  },
};
