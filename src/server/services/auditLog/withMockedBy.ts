import type { User } from '../../models'

export const withMockedBy = (user: User, data: object): Record<string, unknown> =>
  user.mockedBy ? { ...data, mockedBy: user.mockedBy.username } : { ...data }
