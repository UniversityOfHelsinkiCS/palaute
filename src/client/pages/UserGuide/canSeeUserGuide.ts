import { USER_GUIDE_ENABLED } from '../../util/common'

// Kept apart from the page, which is loaded lazily
const canSeeUserGuide = (user: { isAdmin?: boolean; isEmployee?: boolean } | undefined | null) =>
  USER_GUIDE_ENABLED && (user?.isAdmin === true || user?.isEmployee === true)

export default canSeeUserGuide
