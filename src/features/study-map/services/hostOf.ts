/** "https://react.dev/learn" → "react.dev". Pure; RN's URL polyfill does not implement `host`. */
export const hostOf = (url: string): string =>
  /^[a-z][a-z0-9+.-]*:\/\/([^/?#:]+)/i.exec(url)?.[1]?.replace(/^www\./, '') ?? url;
