import { useParams } from 'react-router-dom'

const useFeedbackTargetId = () => {
  const { id: feedbackId, interimFeedbackId } = useParams()
  return interimFeedbackId || feedbackId
}

export default useFeedbackTargetId
