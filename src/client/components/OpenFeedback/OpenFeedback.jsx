import { DeleteForever, Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { boxPrintStyle } from '../../util/printStyle'

const styles = {
  listItem: {
    display: 'flex',
    boxShadow: `0 1px 5px 0px rgb(0 0 50 / 13%)`,
    backgroundColor: grey[50],
    borderRadius: '0.8rem',
    marginBottom: '1rem',
    p: '0.7rem',
    width: '100%',
    alignItems: 'start',
    pageBreakAfter: 'auto',
    borderBottom: `1px solid ${grey[300]}`,
    ...boxPrintStyle,
  },
  hiddenListItem: theme => ({
    color: theme.palette.error.main,
    '@media print': { display: 'none' },
  }),
  noPrint: {
    '@media print': { display: 'none' },
  },
  button: {
    fontSize: '14px',
    ...focusIndicatorStyle(),
  },
}

export const OpenFeedbackContainer = ({ children, sx = {} }) => <Box sx={[styles.listItem, sx]}>{children}</Box>

export const OpenFeedback = ({ content, hidden, toggleVisibility, canHide, canDelete, deleteAnswer }) => {
  const { t } = useTranslation()
  const secondaryText = hidden ? t('feedbackTargetResults:hiddenInfo') : ''

  return (
    <OpenFeedbackContainer sx={hidden ? styles.hiddenListItem : {}}>
      <Box display="flex" flexDirection="column" mr="auto">
        {content}
        <Typography variant="caption" color="textSecondary">
          {secondaryText}
        </Typography>
      </Box>
      {canHide && (
        <Box display="flex" flexDirection="column" alignContent="start" sx={styles.noPrint}>
          <Tooltip title={t(hidden ? 'feedbackTargetResults:setVisible' : 'feedbackTargetResults:setHidden')}>
            <IconButton onClick={() => toggleVisibility()} size="small" sx={styles.button} disableRipple>
              {hidden ? <VisibilityOff fontSize="inherit" /> : <Visibility fontSize="inherit" />}
            </IconButton>
          </Tooltip>
          {canDelete && (
            <Tooltip title={t('feedbackTargetResults:deletePermanently')}>
              <IconButton onClick={deleteAnswer} size="small" sx={styles.button} disableRipple>
                <DeleteForever sx={{ fontSize: '12px' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </OpenFeedbackContainer>
  )
}
