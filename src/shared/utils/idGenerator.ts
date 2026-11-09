export type IdGenerator = () => string;

type IdSources = {
  /** Milliseconds since epoch. */
  now: () => number;
  /** 0 <= value < 1. */
  random: () => number;
};

/**
 * Collision-resistant, roughly time-ordered ids ("lz3k9w-0001-8f3k2a") without crypto
 * (Hermes has no crypto.randomUUID). Sources are injected so the generator is testable.
 */
export function createIdGenerator({ now, random }: IdSources): IdGenerator {
  let counter = 0;
  return () => {
    counter = (counter + 1) % 0x10000;
    const time = now().toString(36);
    const sequence = counter.toString(16).padStart(4, '0');
    const entropy = Math.floor(random() * 0x7fffffff)
      .toString(36)
      .padStart(6, '0');
    return `${time}-${sequence}-${entropy}`;
  };
}
