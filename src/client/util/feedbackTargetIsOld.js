import { differenceInMonths } from 'date-fns'

const feedbackTargetIsOld = feedbackTarget => differenceInMonths(Date.now(), Date.parse(feedbackTarget.closesAt)) > 6

export default feedbackTargetIsOld
