import React from 'react'
// import { useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useInView } from 'react-intersection-observer'

import ResultsContent from './ResultsContent'
import useUpdateOpenFeedbackVisibility from './useUpdateOpenFeedbackVisibility'
import { OpenFeedback } from '../../../../../components/OpenFeedback/OpenFeedback'
import Markdown from '../../../../../components/common/Markdown'
import useDeleteOpenFeedback from './useDeleteOpenFeedback'
import { useFeedbackTargetContext } from '../../../FeedbackTargetContext'

const styles = {
  list: theme => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 100,
    padding: '1rem',
    marginBottom: '1rem',
    maxHeight: '800px',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-track': {
      background: grey[200],
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.light,
      borderRadius: 10,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.info.main,
    },
    '@media print': {
      overflowY: 'visible',
      display: 'block',
      maxHeight: 'none',
    },
  }),
}

const useRenderVisible = ({ threshold = 0.0, delay = 0, initial = false }) => {
  const [render, setRender] = React.useState(initial)
  const { ref, inView } = useInView({ triggerOnce: true, threshold, delay })
  React.useEffect(() => {
    if (inView) {
      React.startTransition(() => {
        setRender(true)
      })
    }
  }, [inView])

  return { render, ref }
}

const OpenResults = ({ question }) => {
  // const { pathname } = useLocation()
  // const isNoad = pathname.startsWith('/noad')
  const { canHide, toggleVisibility } = useUpdateOpenFeedbackVisibility()
  const { canDelete, deleteAnswer } = useDeleteOpenFeedback()
  const { feedbackTarget } = useFeedbackTargetContext()

  const feedbacks = React.useMemo(
    () => (question.feedbacks ?? []).filter(({ data }) => Boolean(data)).sort((a, b) => a.data.localeCompare(b.data)),
    [question]
  )
  const renderInitially = true // feedbacks.length < 10
  const { render, ref } = useRenderVisible({ initial: renderInitially })

  return (
    <ResultsContent>
      <Box display="flex" justifyContent="center">
        <Box sx={[styles.list]} ref={ref}>
          {!render && (
            <Box display="flex" alignSelf="stretch" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
          {render &&
            feedbacks.map((f, index) => (
              <OpenFeedback
                key={index}
                content={<Markdown disallowImages>{f.data}</Markdown>}
                hidden={f.hidden}
                canHide={canHide}
                canDelete={canDelete}
                deleteAnswer={() => deleteAnswer(f)}
                toggleVisibility={() => toggleVisibility(f, feedbackTarget.id)}
              />
            ))}
        </Box>
      </Box>
    </ResultsContent>
  )
}

export default OpenResults
