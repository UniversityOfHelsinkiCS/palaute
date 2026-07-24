type NotGivingFeedbackParams = {
  userFeedbackTargets: Array<{ notGivingFeedback?: boolean }>
}

const notGivingFeedback = ({ userFeedbackTargets }: NotGivingFeedbackParams) => userFeedbackTargets[0].notGivingFeedback

export default notGivingFeedback
