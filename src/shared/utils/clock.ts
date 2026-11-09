/** Time source injected into services so they never call `Date.now()` / `new Date()` directly. */
export type Clock = {
  now: () => Date;
};

export const systemClock: Clock = {
  now: () => new Date(),
};

/** Test helper: a clock frozen at `iso`. */
export const fixedClock = (iso: string): Clock => {
  const date = new Date(iso);
  return { now: () => new Date(date.getTime()) };
};
