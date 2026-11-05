import z from 'zod/v4'

import { ApplicationError } from './ApplicationError'

export const parseInput = <T extends z.ZodType>(schema: T, input: unknown): z.output<T> => {
  const result = schema.safeParse(input)
  if (!result.success) throw ApplicationError.BadRequest(z.prettifyError(result.error))
  return result.data
}
