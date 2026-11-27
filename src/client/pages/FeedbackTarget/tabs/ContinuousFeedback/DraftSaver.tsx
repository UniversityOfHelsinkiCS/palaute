import { useFormikContext } from 'formik'
import { useEffect } from 'react'

import { clearDraft, loadDraft, saveDraft } from '../FeedbackView/utils'

interface FeedbackDraft {
  feedback: string
}

interface DraftSaverProps {
  draftKey: string
  unchangedValue: string
}

// Keeps the unsaved feedback text in sessionStorage so that it survives a page reload, like the other feedback forms.
// The draft is removed when the text matches unchangedValue, the text the form starts from without a draft.
const DraftSaver = ({ draftKey, unchangedValue }: DraftSaverProps) => {
  const { values } = useFormikContext<FeedbackDraft>()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (values.feedback !== unchangedValue) saveDraft(draftKey, { feedback: values.feedback })
      else clearDraft(draftKey)
    }, 300)

    return () => clearTimeout(timer)
  }, [draftKey, unchangedValue, values.feedback])

  return null
}

export const loadFeedbackDraft = (draftKey: string | null): string | null => {
  const draftFeedback: unknown = draftKey ? loadDraft(draftKey)?.feedback : null
  return typeof draftFeedback === 'string' ? draftFeedback : null
}

export default DraftSaver
