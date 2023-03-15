import React from 'react'
import { Box, InputLabel, MenuItem, Select } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../../../util/languageUtils'
import InfoBox from '../../../../components/common/InfoBox'

const GroupSelector = ({ groupId, setGroupId, groups, groupsAvailable }) => {
  const [loading, setLoading] = React.useState(false)
  const [tempDisplayId, setTempDisplayId] = React.useState(groupId)
  const { i18n, t } = useTranslation()

  if (!groupsAvailable)
    return (
      <Box>
        <InfoBox
          label={t('feedbackTargetResults:groupsNotAvailableInfoTitle')}
          content={t('feedbackTargetResults:groupsNotAvailableInfoContent')}
        />
      </Box>
    )

  const handleChange = e => {
    setLoading(true)
    setTempDisplayId(e.target.value)
    React.startTransition(() => {
      setGroupId(e.target.value)
      setLoading(false)
    })
  }

  const groupOptions = groups
    .map(group => ({
      id: group.id,
      name: getLanguageValue(group.name, i18n.language),
    }))
    .concat({
      id: 'ALL',
      name: t('common:all'),
    })

  return (
    <Box>
      <InputLabel id="group-select-label">{t('feedbackTargetResults:chooseGroup')}</InputLabel>
      <Select
        labelId="group-select-label"
        value={loading ? tempDisplayId : groupId}
        onChange={handleChange}
        disabled={loading}
      >
        {groupOptions.map(opt => (
          <MenuItem key={opt.id} value={opt.id}>
            {opt.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )
}

export default GroupSelector
