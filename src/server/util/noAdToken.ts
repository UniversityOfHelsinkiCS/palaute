import jwt from 'jsonwebtoken'

import { JWT_KEY, NOAD_LINK_EXPIRATION_DAYS } from './config'

/**
 * No-AD tokens are login credentials: whoever holds one is that user on the /noad pages.
 * They are therefore given an expiration time, so that a link that leaks out of a teacher's
 * email or spreadsheet stops working at some point.
 *
 * The link is meant to stay usable for as long as feedback can be given, plus a grace period,
 * so the expiration is derived from the feedback target's closing date.
 */
export const getNoAdTokenExpirationDate = (closesAt?: Date | null) => {
  const from = closesAt ? new Date(closesAt) : new Date()
  from.setDate(from.getDate() + NOAD_LINK_EXPIRATION_DAYS)

  return from
}

/**
 * Sign a no-AD login token that expires at the given date.
 * `exp` is a NumericDate: seconds since the epoch.
 */
export const signNoAdToken = (username: string, expiresAt: Date) => {
  if (!JWT_KEY) throw new Error('JWT_KEY is required to sign no-AD tokens')

  return jwt.sign({ username, exp: Math.floor(expiresAt.getTime() / 1000) }, JWT_KEY)
}
