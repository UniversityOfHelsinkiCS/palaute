import { startOfDay, endOfDay } from 'date-fns'
import { parseFromTimeZone } from 'date-fns-timezone'
import _ from 'lodash'

import { User } from '../../models/user'
import { ApplicationError } from '../../util/ApplicationError'
import { assertNoQuestionFields } from '../../util/surveyQuestions'
import { createFeedbackTargetLog } from '../auditLog'
import { updateOrganisationSurvey } from '../organisations/organisationSurveys'
import { getFeedbackTargetContext } from './getFeedbackTargetContext'

const filterUpdates = (update: any) => update !== undefined && update !== null

const parseUpdates = (body: any) => {
  const {
    name,
    hidden,
    opensAt,
    closesAt,
    feedbackVisibility,
    continuousFeedbackEnabled,
    sendContinuousFeedbackDigestEmail,
    continuousFeedbackPreamble,
    settingsReadByTeacher,
  } = body
  const parseDate = (d: any) => parseFromTimeZone(d, { timeZone: 'Europe/Helsinki' })

  const updates = _.pickBy(
    {
      name,
      hidden,
      opensAt: opensAt ? startOfDay(parseDate(opensAt)) : undefined,
      closesAt: closesAt ? endOfDay(parseDate(closesAt)) : undefined,
      feedbackVisibility,
      continuousFeedbackEnabled,
      sendContinuousFeedbackDigestEmail,
      continuousFeedbackPreamble,
      settingsReadByTeacher,
    },
    filterUpdates
  )

  return updates
}

type UpdateParams = {
  feedbackTargetId: number
  user: User
  body: any
}

const update = async ({ feedbackTargetId, user, body }: UpdateParams) => {
  const { feedbackTarget, access } = await getFeedbackTargetContext({ feedbackTargetId, user })

  if (!access?.canUpdate()) {
    throw ApplicationError.Forbidden('No rights to update feedback target')
  }

  assertNoQuestionFields(body)
  const updates = parseUpdates(body)

  if (updates.opensAt || updates.closesAt) {
    if ((updates.opensAt ?? feedbackTarget.opensAt) > (updates.closesAt ?? feedbackTarget.closesAt)) {
      throw ApplicationError.BadRequest('ClosesAt cannot be before opensAt')
    }
    updates.feedbackDatesEditedByTeacher = true

    // If organisation survey update course realisation activity period as well
    if (feedbackTarget.courseRealisation?.userCreated) {
      const activityPeriod = {
        startDate: updates.opensAt,
        endDate: updates.closesAt,
      }
      await updateOrganisationSurvey(feedbackTarget.id, activityPeriod)
    }
  }

  await createFeedbackTargetLog(feedbackTarget, updates, user)

  Object.assign(feedbackTarget, updates)

  // force hooks
  feedbackTarget.changed('updatedAt', true)

  await feedbackTarget.save()

  return feedbackTarget
}

export { update }
