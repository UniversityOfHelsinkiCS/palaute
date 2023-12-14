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
            <Typography variant="body2">
              {t('common:studentCount')}:{' '}
              <Typography component="span" color="textSecondary">
                {option.studentCount}
              </Typography>
            </Typography>
            {option.teachers && (
              <>
                <Typography variant="body2" sx={{ mt: '0.3rem', mb: '0.2rem' }}>
                  {t('groups:teachersOfGroup')}
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

const GroupSelector = ({ groupId, setGroupId, groups, groupsAvailable, studentCount }) => {
  const { i18n, t } = useTranslation()
  const [userSelectedGroupId, setUserSelectedGroupId] = React.useState(groupId)

  if (!groupsAvailable)
    return (
      <Box>
        <InfoBox label={t('groups:groupsNotAvailableInfoTitle')} content={t('groups:groupsNotAvailableInfoContent')} />
      </Box>
    )

  const onSelect = groupId => {
    setUserSelectedGroupId(groupId)
    React.startTransition(() => {
      setGroupId(groupId)
    })
  }

  const localisatedGroups = groups.map(group => ({
    id: group.id,
    name: getLanguageValue(group.name, i18n.language),
    teachers: group.teachers,
    studentCount: group.studentCount,
  }))

  const groupOptions = React.useMemo(
    () =>
      [
        {
          id: 'ALL',
          name: t('common:all'),
          teachers: [],
          studentCount,
        },
      ].concat(localisatedGroups),
    [localisatedGroups]
  )

  return (
    <Box>
      <Typography variant="body1">{t('groups:chooseGroup')}</Typography>
      <ToggleButtonGroup sx={{ mt: 2 }} value={userSelectedGroupId}>
        {groupOptions.map(opt => (
          <GroupButton key={opt.id} value={opt.id} option={opt} onClick={() => onSelect(opt.id)} />
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}

export default GroupSelector
