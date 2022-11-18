import React from 'react'
import {
  Box,
  Chip,
  FormControlLabel,
  Popover,
  Switch,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const QuestionPublicityToggle = ({ checked, disabled, onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { t } = useTranslation()

  return (
    <>
      <Chip
        label={t(checked ? 'common:public' : 'common:notPublic')}
        clickable={!disabled}
        onClick={(e) => !disabled && setAnchorEl(e.target)}
        variant="outlined"
        color={disabled ? 'default' : 'primary'}
      />
      <Popover
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{ mt: '0.7rem' }}
      >
        <Box m="0.7rem" width="12rem">
          <FormControlLabel
            control={
              <Switch checked={checked} onChange={() => onChange(!checked)} />
            }
            label={t('common:changePublicity')}
          />
          <Typography variant="body2" color="textSecondary">
            {t(checked ? 'common:publicInfo' : 'common:notPublicInfo')}
          </Typography>
        </Box>
      </Popover>
    </>
  )
}

export default QuestionPublicityToggle
