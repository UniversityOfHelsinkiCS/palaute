import { USER_GUIDE_ENABLED } from '../../util/common'

// Admins only until the guide's content has been reviewed. Kept apart from the page, which is loaded lazily.
const canSeeUserGuide = (user: { isAdmin?: boolean } | undefined | null) => USER_GUIDE_ENABLED && user?.isAdmin === true

export default canSeeUserGuide
