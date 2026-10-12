import { Box } from '@mui/material'
import { Navigate, Route, Routes } from 'react-router'

import { RouterTab, RouterTabs } from '../../../../components/common/RouterTabs'
import { useNorppaiMeta } from './api'
import ConversationsView from './ConversationsView'
import FeedbackView from './FeedbackView'
import UsageView from './UsageView'

// The NorppAI viewer: saved help chatbot conversations, their feedback and their cost.
// See "Viewer" in documentation/help_chatbot.md.
const NorppaiView = () => {
  const { data: meta } = useNorppaiMeta()
  const newFeedback = meta?.newFeedbackCount ?? 0

  return (
    <Box>
      <RouterTabs aria-label="NorppAI views" sx={{ mt: 0, mb: 2 }}>
        <RouterTab label="Conversations" to="/admin/norppai/conversations" />
        <RouterTab
          label={newFeedback > 0 ? `Feedback (${newFeedback} new)` : 'Feedback'}
          to="/admin/norppai/feedback"
        />
        <RouterTab label="Usage" to="/admin/norppai/usage" />
      </RouterTabs>
      <Routes>
        <Route path="/conversations" element={<ConversationsView />} />
        <Route path="/feedback" element={<FeedbackView />} />
        <Route path="/usage" element={<UsageView />} />
        <Route path="*" element={<Navigate to="/admin/norppai/conversations" replace />} />
      </Routes>
    </Box>
  )
}

export default NorppaiView
