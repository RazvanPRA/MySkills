/** Time source injected into services, so expiry rules are tested without real time. */
export type Clock = { now: () => Date };

export const CLOCK = Symbol('CLOCK');

export const systemClock: Clock = { now: () => new Date() };
