import type { Request } from 'express'
import type { ParsedQs } from 'qs'

import type { User } from './models'

export type AuthenticatedRequest<P = Request['params'], ReqB = any, ResB = any, Query = ParsedQs> = Request<
  P,
  ResB,
  ReqB,
  Query
> & {
  user: User
  noad: boolean
  loginAs: boolean
}

export type UnauthenticatedRequest = Request & {
  iamGroups: string[]
}
