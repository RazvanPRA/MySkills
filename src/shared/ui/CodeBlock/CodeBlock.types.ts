export type CodeBlockProps = {
  code: string;
  /** Fence language ("ts", "java", "sql"…). Unknown or missing → plain text. */
  language?: string;
  showLineNumbers?: boolean;
};
