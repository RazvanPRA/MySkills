// SQL migration files are inlined as strings (babel-plugin-inline-import in the app,
// jest/rawTextTransform.js in tests).
declare module '*.sql' {
  const sql: string;
  export default sql;
}
