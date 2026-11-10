import { z } from 'zod';

/** Lines of a code block as CodeBlock shows them (one trailing newline is not a line). */
export const codeLineCount = (code: string): number => code.replace(/\n$/, '').split('\n').length;

const lineNumberSchema = z.number().int().positive();

export const findBugPayloadSchema = z
  .object({
    /** The code shown with selectable, numbered lines. */
    code: z.string().min(1),
    /** Fence language for highlighting ("ts", "go", "java"…). */
    language: z.string().min(1).optional(),
    /** 1-based lines that count as the bug (usually one). */
    bugLines: z.array(lineNumberSchema).min(1),
  })
  .refine(payload => new Set(payload.bugLines).size === payload.bugLines.length, {
    message: 'bugLines must not repeat',
    path: ['bugLines'],
  })
  .refine(payload => payload.bugLines.every(line => line <= codeLineCount(payload.code)), {
    message: 'bugLines must point to lines of the code',
    path: ['bugLines'],
  });
export type FindBugPayload = z.infer<typeof findBugPayloadSchema>;

/** The tapped line, 1-based. */
export const findBugAnswerSchema = z.object({ line: lineNumberSchema });
export type FindBugAnswer = z.infer<typeof findBugAnswerSchema>;
