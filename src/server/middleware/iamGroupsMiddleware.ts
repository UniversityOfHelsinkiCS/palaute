import { NextFunction, Response } from 'express'
import { UnauthenticatedRequest } from 'types'
import { IAM_GROUPS_HEADER } from '../util/config'

const parse = (groupString: string) => {
  if (!groupString) {
    return []
  }

  return groupString.split(';').filter(Boolean)
}

export const iamGroupsMiddleware = (req: UnauthenticatedRequest, res: Response, next: NextFunction) => {
  req.iamGroups = parse(req.headers[IAM_GROUPS_HEADER] as string)

  next()
}
