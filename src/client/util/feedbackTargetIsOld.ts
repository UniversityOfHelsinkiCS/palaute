import { differenceInMonths } from 'date-fns'

const feedbackTargetIsOld = (feedbackTarget: { closesAt: string }) =>
  differenceInMonths(Date.now(), Date.parse(feedbackTarget.closesAt)) > 12

export default feedbackTargetIsOld
