import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'

import { User } from '../models'
import { populateUserAccess } from '../services/organisationAccess/organisationAccess'
import { getUserByUsername } from '../services/users'
import { AuthenticatedRequest, UnauthenticatedRequest } from '../types'
import { ApplicationError } from '../util/ApplicationError'
import { JWT_KEY } from '../util/config'
import { getUserIams } from '../util/jami'
import { logger } from '../util/logger'

const getLoggedInAsUser = async (loggedInAsUserId: string) => {
  const loggedInAsUser = await User.findByPk(loggedInAsUserId)
  loggedInAsUser.iamGroups = await getUserIams(loggedInAsUserId)
  await populateUserAccess(loggedInAsUser)

  return loggedInAsUser
}

const setLoggedInAsUser = async (req: AuthenticatedRequest) => {
  const adminLoggedInAsHeader = req.headers['x-admin-logged-in-as']
  if (typeof adminLoggedInAsHeader !== 'string') return

  // User id must not contain slashes, so it's safe to use it directly.
  const sanitizedUserIdFromHeader = adminLoggedInAsHeader.replace(/\//g, '') ?? ''
  const loggedInAsUser = await getLoggedInAsUser(sanitizedUserIdFromHeader)
  if (loggedInAsUser) {
    const originalUser = req.user
    req.user = loggedInAsUser
    req.user.mockedBy = originalUser
    req.loginAs = true
  }
}

const getUsernameFromToken = (req: UnauthenticatedRequest) => {
  const { token, tokenuser } = req.headers

  if (typeof token !== 'string') {
    throw ApplicationError.Forbidden('Token must be a string')
  }

  const { username } = jwt.verify(token, JWT_KEY) as { username: string }

  if (!username) {
    logger.info('Token broken', { token })
    logger.info('Token user', { tokenuser })
    throw ApplicationError.Forbidden('Token is missing username')
  }

  return username
}

const getUsernameFromShibboHeaders = (req: UnauthenticatedRequest) => {
  const { uid: username } = req.headers

  if (!username) throw ApplicationError.Forbidden('Missing uid header')

  return username as string
}

const isAdminLoginAs = (req: AuthenticatedRequest) => req.user.isAdmin && req.headers['x-admin-logged-in-as']

export const currentUserMiddleware = async (req: UnauthenticatedRequest, _res: Response, next: NextFunction) => {
  const isNoAdPath = req.path.startsWith('/noad')

  const username = isNoAdPath ? getUsernameFromToken(req) : getUsernameFromShibboHeaders(req)

  const user = await getUserByUsername(username)

  user.iamGroups = req.iamGroups
  await populateUserAccess(user)

  const authenticatedReq: AuthenticatedRequest = Object.assign(req, {
    // req and authenticatedReq are now the same object but TS only trusts that authenticatedReq is acually AuthenticatedRequest
    user,
    noad: isNoAdPath,
    loginAs: false,
  })

  if (isAdminLoginAs(authenticatedReq)) {
    await setLoggedInAsUser(authenticatedReq)
  }

  next()
}
