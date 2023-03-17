import React from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../../../util/languageUtils'
import InfoBox from '../../../../components/common/InfoBox'
import TeacherChip from '../../../../components/common/TeacherChip'
import PaperTooltip from '../../../../components/common/PaperTooltip'

const GroupButton = ({ option, onClick, ...props }) => {
  const { t } = useTranslation()

  const buttonLabel = <Box p={1}>{option.name}</Box>

  const buttonChildren =
    option.id !== 'ALL' ? (
      <PaperTooltip
        title={
          <Box p="0.3rem">
            {option.teachers && (
              <>
                <Typography variant="body2" sx={{ mb: '0.2rem' }}>
                  {t('feedbackTargetResults:teachersOfGroup')}
                </Typography>
                {option.teachers.map(t => (
                  <div key={t.id}>
                    <TeacherChip user={t} tooltipPlacement="right" />
                  </div>
                ))}
              </>
            )}
          </Box>
        }
      >
        {buttonLabel}
      </PaperTooltip>
    ) : (
      <div>{buttonLabel}</div>
    )

  return (
    <ToggleButton onClick={onClick} sx={{ p: 0 }} {...props}>
      {buttonChildren}
    </ToggleButton>
  )
}

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

  const onSelect = groupId => {
    setUserSelectedGroupId(groupId)
    React.startTransition(() => {
      setGroupId(groupId)
    })
  }

  const groupOptions = React.useMemo(
    () =>
      [
        {
          id: 'ALL',
          name: t('common:all'),
          teachers: [],
        },
      ].concat(
        groups.map(group => ({
          id: group.id,
          name: getLanguageValue(group.name, i18n.language),
          teachers: group.teachers,
        }))
      ),
    [groups]
  )

  return (
    <Box>
      <Typography variant="body2">{t('feedbackTargetResults:chooseGroup')}</Typography>
      <ToggleButtonGroup value={userSelectedGroupId}>
        {groupOptions.map(opt => (
          <GroupButton key={opt.id} value={opt.id} option={opt} onClick={() => onSelect(opt.id)} />
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}

export default GroupSelector
