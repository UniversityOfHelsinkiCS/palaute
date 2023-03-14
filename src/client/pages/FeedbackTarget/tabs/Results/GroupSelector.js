import React from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../../../util/languageUtils'
import InfoBox from '../../../../components/common/InfoBox'

const GroupSelector = ({ groupId, setGroupId, groups, groupsAvailable }) => {
  const { i18n, t } = useTranslation()
  const [userSelectedGroupId, setUserSelectedGroupId] = React.useState(groupId)

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
    setUserSelectedGroupId(e.target.value)
    React.startTransition(() => {
      setGroupId(e.target.value)
    })
  }

  const groupOptions = React.useMemo(
    () =>
      [
        {
          id: 'ALL',
          name: t('common:all'),
        },
      ].concat(
        groups.map(group => ({
          id: group.id,
          name: getLanguageValue(group.name, i18n.language),
        }))
      ),
    [groups]
  )

  return (
    <Box>
      <Typography variant="body2">{t('feedbackTargetResults:chooseGroup')}</Typography>

      <ToggleButtonGroup value={userSelectedGroupId} onChange={handleChange} disabled={userSelectedGroupId !== groupId}>
        {groupOptions.map(opt => (
          <ToggleButton value={opt.id} key={opt.id}>
            {opt.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}

export default GroupSelector
