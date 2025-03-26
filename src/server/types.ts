import type { Request } from 'express'
import type { User } from 'models'

export interface AuthenticatedRequest extends Request {
  user: User
  noad: boolean
}
