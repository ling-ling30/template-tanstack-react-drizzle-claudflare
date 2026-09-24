import type { z } from "zod";

/**
 * Server-function input validator from a zod schema:
 *
 *   createServerFn({ method: "POST" }).validator(zodInput(schema))
 *
 * Why not pass the schema directly (`.validator(schema)`)? Start then runs
 * it as a Standard Schema and throws a plain `Error` with the issues as JSON,
 * which our error pipeline can only report as INTERNAL. Calling `schema.parse`
 * throws a real `ZodError`, which `toPublicError` turns into VALIDATION_FAILED
 * with per-field messages. The typed parameter still gives callers a typed
 * `data` argument, same as passing the schema.
 *
 * Every server function must validate its input at runtime — a TypeScript
 * annotation alone (`(slug: string) => slug`) checks nothing on the wire.
 */
export function zodInput<S extends z.ZodType>(schema: S) {
  return (input: z.input<S>): z.output<S> => schema.parse(input);
}
