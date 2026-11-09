import { defaultUserSettings, type UserSettings, userSettingsSchema } from '../model/userSettings';

function parseJson(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Reads stored settings without ever losing the user's valid choices:
 * each field is validated on its own; invalid or missing fields fall back to their default.
 */
export function parseStoredSettings(json: string | null): UserSettings {
  const raw = json === null ? null : parseJson(json);
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return defaultUserSettings;
  }
  const whole = userSettingsSchema.safeParse(raw);
  if (whole.success) {
    return whole.data;
  }
  const record = raw as Record<string, unknown>;
  const salvaged: Record<string, unknown> = { ...defaultUserSettings };
  for (const [key, schema] of Object.entries(userSettingsSchema.shape)) {
    const field = schema.safeParse(record[key]);
    if (field.success && record[key] !== undefined) {
      salvaged[key] = field.data;
    }
  }
  return userSettingsSchema.parse(salvaged);
}
