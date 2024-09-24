import React from 'react'
import { Box, Chip, FormControl, FormControlLabel, FormLabel, Popover, Radio, RadioGroup, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Edit } from '@mui/icons-material'
import styles from '../../util/chipStyles'

const QuestionPublicityToggle = ({ checked, disabled, onChange }) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const notEditableInfo = checked ? t('common:notEditable') : ''

  const tooltipText = `${checked ? t('common:publicShortInfo') : t('common:notPublicShortInfo')}. ${
    !disabled ? t('common:editable') : notEditableInfo
  }`

  return (
    <>
      <Tooltip title={tooltipText}>
        <Chip
          icon={!disabled ? <Edit /> : null}
          label={t(checked ? 'common:public' : 'common:notPublic')}
          clickable={!disabled}
          onClick={e => !disabled && setAnchorEl(e.target)}
          variant="outlined"
          size="small"
          color={disabled ? 'default' : 'primary'}
          sx={!disabled ? styles.interactive : {}}
        />
      </Tooltip>
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
        <Box m="0.7rem" width="30rem">
          <FormControl>
            <FormLabel id="demo-controlled-radio-buttons-group">{t('common:changePublicity')}</FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={checked}
              onChange={event => onChange(event.target.value)}
            >
              <FormControlLabel value control={<Radio />} label={t('common:publicInfo')} />
              <FormControlLabel value={false} control={<Radio />} label={t('common:notPublicInfo')} />
            </RadioGroup>
          </FormControl>
        </Box>
      </Popover>
    </>
  )
}

export default QuestionPublicityToggle
