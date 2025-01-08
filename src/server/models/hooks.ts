/**
 * Db hooks. This must be imported in the main file to be executed.
 * Some are defined in the model file.
 * Some are defined here, because they are related to multiple models
 * and services, so there can be circular dependencies.
 */

import { feedbackTargetCache } from '../services/feedbackTargets'
import { addFeedbackDataToSummary, removeFeedbackDataFromSummary } from '../services/summary/utils'
import Feedback from './feedback'
import FeedbackTarget from './feedbackTarget'
import Summary from './summary'
import UserFeedbackTarget from './userFeedbackTarget'

/**
 * Increment the corresponding Summary.data.feedbackCount.
 */
Feedback.afterCreate(async feedback => {
  const fbt = await FeedbackTarget.findOne({
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: { userId: feedback.userId },
      },
      {
        model: Summary,
        as: 'summary',
        required: true,
      },
    ],
  })

  //@ts-expect-error fbt is not yet typescripted
  const summary = fbt.summary as Summary

  if (!summary) {
    throw new Error(`Summary not found for feedback ${feedback.id}`)
  }

  summary.data = addFeedbackDataToSummary(summary.data, feedback.data)

  //@ts-expect-error fbt is not yet typescripted
  const cachedFbt = await feedbackTargetCache.get(fbt.id)
  cachedFbt.summary = summary
  //@ts-expect-error fbt is not yet typescripted
  await feedbackTargetCache.set(fbt.id, cachedFbt)

  await summary.save()
})

/**
 * Decrement the corresponding Summary.data.feedbackCount.
 */
Feedback.afterDestroy(async feedback => {
  const fbt = await FeedbackTarget.findOne({
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
        required: true,
        where: { userId: feedback.userId },
      },
      {
        model: Summary,
        as: 'summary',
        required: true,
      },
    ],
  })

  //@ts-expect-error fbt is not yet typescripted
  const summary = fbt.summary as Summary

  if (!summary) {
    throw new Error(`Summary not found for feedback ${feedback.id}`)
  }

  summary.data = removeFeedbackDataFromSummary(summary.data, feedback.data)

  //@ts-expect-error fbt is not yet typescripted
  const cachedFbt = await feedbackTargetCache.get(fbt.id)
  cachedFbt.summary = summary
  //@ts-expect-error fbt is not yet typescripted
  await feedbackTargetCache.set(fbt.id, cachedFbt)

  await summary.save()
})

/**
 * Remove the feedbackId the UserFeedbackTarget that references this feedback.
 */
Feedback.beforeDestroy(async feedback => {
  await UserFeedbackTarget.update(
    {
      feedbackId: null,
    },
    { where: { feedbackId: feedback.id } }
  )
})
