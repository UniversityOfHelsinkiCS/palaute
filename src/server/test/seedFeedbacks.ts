import Feedback, { FeedbackData } from 'models/feedback'
import { FeedbackTarget, UserFeedbackTarget } from '../models'
import { TEST_COURSE_REALISATION_ID } from './testIds'

export const seedFeedbacks = async (feedbackDatas: FeedbackData[]) => {
  const fbt = await FeedbackTarget.findOne({
    where: {
      courseRealisationId: TEST_COURSE_REALISATION_ID,
    },
    include: [
      {
        model: UserFeedbackTarget,
        as: 'userFeedbackTargets',
      },
    ],
  })

  await Promise.all(
    // @ts-expect-error fbt is any
    (fbt!.userFeedbackTargets as any[]).map(async (uft, idx) => {
      if (idx >= feedbackDatas.length) return
      const ftData = feedbackDatas[idx]
      const ft = await Feedback.create({
        data: ftData,
        userId: uft.userId,
        degreeStudyRight: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      await uft.update({ feedbackId: ft.id })
    })
  )
}
