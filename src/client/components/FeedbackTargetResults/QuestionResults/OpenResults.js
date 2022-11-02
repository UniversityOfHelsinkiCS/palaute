import React from 'react'
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../util/languageUtils'
import ResultsContent from './ResultsContent'

const styles = {
  list: (theme) => ({
    padding: '1rem',
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
      overflow: 'visible',
      maxHeight: '100%',
      height: 'auto',
    },
  }),
}

const OpenResults = ({ question }) => {
  const { i18n } = useTranslation()

  const label = getLanguageValue(question.data?.label, i18n.language)

  const description = getLanguageValue(
    question.data?.description,
    i18n.language,
  )

  const feedbacks = question.feedbacks ?? []

  const filteredFeedbacks = feedbacks.filter(({ data }) => Boolean(data))

  return (
    <ResultsContent>
      <Box mb={1} mt={1} display="flex" gap="1rem">
        <Box>
          <Typography fontWeight="medium">{label}</Typography>
          <Typography variant="body2">{description}</Typography>
        </Box>
        <Chip
          label={filteredFeedbacks.length}
          variant="outlined"
          size="small"
        />
      </Box>
      <List sx={styles.list}>
        {filteredFeedbacks.map((feedback, index) => (
          <ListItem
            divider={index < filteredFeedbacks.length - 1}
            disableGutters
            key={index}
          >
            <ListItemText
              sx={{ py: 1 }}
              primary={feedback.data}
              primaryTypographyProps={{ fontSize: 18 }}
            />
          </ListItem>
        ))}
      </List>
    </ResultsContent>
  )
}

export default OpenResults
