import type { NextFunction, Response } from 'express'
import { AuthenticatedRequest } from 'types'
import { ApplicationError } from '../util/customErrors'

const adminAccess = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.user.isAdmin) ApplicationError.Forbidden()

  return next()
}

export { adminAccess }
