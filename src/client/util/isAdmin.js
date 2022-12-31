import { ADMINS } from './common'

const isAdmin = user => ADMINS.includes(user?.username)

export default isAdmin
