import { Box, Typography } from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { useTranslation } from 'react-i18next'

import Markdown from '../../../../../components/common/Markdown'

const styles = {
  label: {
    marginBottom: theme => theme.spacing(1),
    display: 'block',
  },
  description: {
    marginBottom: theme => theme.spacing(1),
  },
  questionContainer: theme => ({
    margin: '0.5rem',
    marginLeft: '1rem',
    [theme.breakpoints.down('md')]: {
      margin: 0,
      marginLeft: 0,
    },
  }),
}

const QuestionBase = ({ children, label, description, required, labelProps = {}, id }) => {
  const descriptionId = description ? `${id}-description` : undefined
  const { t } = useTranslation()

  return (
    <Box sx={styles.questionContainer} id={id}>
      <Typography variant="h6" sx={styles.label} {...labelProps}>
        {label}
        {required && (
          <>
            <span aria-hidden="true">{' *'}</span>
            <span style={{ ...visuallyHidden, width: '0px', height: '0px' }}>
              {`${label?.endsWith('?') || label?.endsWith('.') ? ' ' : '. '}${t('feedbackView:required')}`}
            </span>
          </>
        )}
      </Typography>
      {description && (
        <Box id={descriptionId} sx={styles.description}>
          <Markdown>{description}</Markdown>
        </Box>
      )}
      {children}
    </Box>
  )
}

export default QuestionBase
