import type { Request } from 'express'
import type { User } from 'models'
import type { ParsedQs } from 'qs'

export interface AuthenticatedRequest<P = Request['params'], ReqB = any, ResB = any, Query = ParsedQs>
  extends Request<P, ResB, ReqB, Query> {
  user: User
  noad: boolean
  loginAs: boolean
}

export interface UnauthenticatedRequest extends Request {
  iamGroups: string[]
}
