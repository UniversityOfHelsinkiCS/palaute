import React from 'react'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'

const QuestionPublicityToggle = ({ checked, disabled, onChange }) => {
  const { t } = useTranslation()

  return (
    <ToggleButtonGroup
      value={checked}
      onChange={(event) => onChange(event.target.value)}
      exclusive
      size="small"
      disabled={disabled}
    >
      <ToggleButton value color="primary">
        {t('common:public')}
      </ToggleButton>
      <ToggleButton value={false} color="error">
        {t('common:notPublic')}
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default QuestionPublicityToggle
