/**
 * A typed, append-only registry keyed by a string (exercise type, test kind, ...).
 * Registries are filled in one place (src/app/registries.ts); features only read from them.
 */
export type Registry<T> = {
  /** Adds an item. Throws if its key is already registered: duplicates are a programming error. */
  register: (item: T) => void;
  get: (key: string) => T | undefined;
  /** Like `get`, but throws when the key is unknown. */
  require: (key: string) => T;
  has: (key: string) => boolean;
  keys: () => string[];
  list: () => T[];
};

export class RegistryError extends Error {
  override name = 'RegistryError';
}

export function createRegistry<T>(name: string, keyOf: (item: T) => string): Registry<T> {
  const items = new Map<string, T>();

  const register = (item: T) => {
    const key = keyOf(item);
    if (items.has(key)) {
      throw new RegistryError(`${name}: "${key}" is already registered`);
    }
    items.set(key, item);
  };

  const require = (key: string) => {
    const item = items.get(key);
    if (item === undefined) {
      throw new RegistryError(`${name}: "${key}" is not registered`);
    }
    return item;
  };

  return {
    register,
    get: key => items.get(key),
    require,
    has: key => items.has(key),
    keys: () => [...items.keys()],
    list: () => [...items.values()],
  };
}
