import { Router } from 'express'
import { getTeacherCourseUnits } from '../../services/myTeaching/myTeachingService'
import { getMyTeachingTabCounts } from '../../services/myTeaching/tabCountService'
import { AuthenticatedRequest } from '../../types'
import { DateRangeInput } from '../../util/common'

export const router = Router()

router.get(
  '/courses',
  async (req: AuthenticatedRequest<any, any, any, DateRangeInput & { isOrganisationSurvey: string }>, res) => {
    const { query, user } = req

    const courseUnits = await getTeacherCourseUnits(user, query)

    res.send(courseUnits)
  }
)

router.get('/tab-counts', async (req: AuthenticatedRequest<any, any, any, DateRangeInput>, res) => {
  const { query, user } = req

  const tabCounts = await getMyTeachingTabCounts(user, query)

  res.send(tabCounts)
})
