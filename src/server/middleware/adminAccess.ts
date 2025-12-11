import type { NextFunction, Response } from 'express'
import { AuthenticatedRequest } from 'types'
import { ApplicationError } from '../util/ApplicationError'

const adminAccess = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (req.user.isAdmin || req.user.mockedBy?.isAdmin) {
    return next()
  }

  return ApplicationError.Forbidden()
}

export { adminAccess }
