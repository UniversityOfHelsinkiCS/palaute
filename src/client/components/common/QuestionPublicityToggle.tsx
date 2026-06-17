import React from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Popover,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Close, Edit } from '@mui/icons-material'
import { focusIndicatorStyle, optionFocusIndicatorStyle } from '../../util/accessibility'
import styles from '../../util/chipStyles'

const radioButtonStyle = {
  ml: 1,
  my: 1,
  pr: 1,
  ...optionFocusIndicatorStyle(),
}

const QuestionPublicityToggle = ({
  questionId,
  checked,
  disabled,
  onChange,
}: {
  questionId: string | number
  checked: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const notEditableInfo = checked ? t('common:notEditable') : ''

  const tooltipText = `${checked ? t('common:publicInfo') : t('common:notPublicInfo')}. ${
    !disabled ? t('common:editable') : notEditableInfo
  }`

  const isOpen = Boolean(anchorEl)
  const popoverId = `question-${questionId}-publicity-settings`
  const labelId = `question-${questionId}-publicity-settings-label`

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const value = event.target.value === 'true'
    onChange(value)
  }

  return (
    <>
      <Tooltip title={tooltipText}>
        <Chip
          component="button"
          type="button"
          icon={!disabled ? <Edit /> : undefined}
          label={t(checked ? 'common:public' : 'common:notPublic')}
          clickable
          onClick={handleOpen}
          variant="outlined"
          color={disabled ? 'default' : 'primary'}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={popoverId}
          sx={{
            ...styles.interactive,
            '&:hover': {
              borderRadius: disabled ? undefined : '3px',
            },
          }}
        />
      </Tooltip>
      <Popover
        id={popoverId}
        open={isOpen}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{ mt: '0.7rem' }}
        slotProps={{
          paper: {
            'aria-labelledby': labelId,
          },
        }}
      >
        <Box sx={{ p: '0.7rem', width: '100%', maxWidth: '30rem', minWidth: '280px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <FormLabel id={labelId} sx={{ m: 0 }}>
              {t('common:changePublicity')}
            </FormLabel>
            <IconButton
              size="small"
              onClick={handleClose}
              aria-label={t('common:close')}
              aria-describedby={disabled ? 'question-publicity-disabled-info' : undefined}
              sx={{ ml: 1, ...focusIndicatorStyle() }}
              disableFocusRipple
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <FormControl>
            <RadioGroup
              aria-labelledby={labelId}
              name="question-publicity-group"
              value={String(checked)}
              onChange={handleChange}
            >
              <FormControlLabel
                value="true"
                control={<Radio autoFocus={checked && isOpen && !disabled} disableFocusRipple disabled={disabled} />}
                label={t('common:publicInfo')}
                sx={radioButtonStyle}
              />
              <FormControlLabel
                value="false"
                control={<Radio autoFocus={!checked && isOpen && !disabled} disableFocusRipple disabled={disabled} />}
                label={t('common:notPublicInfo')}
                sx={radioButtonStyle}
              />
            </RadioGroup>

            {disabled && (
              <Box id="question-publicity-disabled-info" sx={{ mt: 3 }}>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  {`${t('common:notEditable')} ${t('common:notEditableExtraInfo')}`}
                </Typography>
              </Box>
            )}
          </FormControl>
        </Box>
      </Popover>
    </>
  )
}

export default QuestionPublicityToggle
