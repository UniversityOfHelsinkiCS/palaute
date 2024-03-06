import React from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../../../util/languageUtils'
import InfoBox from '../../../../components/common/InfoBox'
import TeacherChip from '../../../../components/common/TeacherChip'
import PaperTooltip from '../../../../components/common/PaperTooltip'
import { User } from '../../../../types/User'
import { sortGroups } from './utils'

interface GroupOption {
  id: string
  name: string
  studentCount?: number
  teachers?: Array<User>
}

interface GroupButtonProps {
  option: GroupOption
  onClick: () => void
  value: string
  [key: string]: any
}

interface GroupSelectorProps {
  groupId: string
  setGroupId: (groupId: string) => void
  groups: GroupOption[]
  groupsAvailable: boolean
  studentCount: number
}

const GroupButton: React.FC<GroupButtonProps> = ({ option, onClick, value, ...props }) => {
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
    <ToggleButton onClick={onClick} sx={{ p: 0 }} value={value} {...props}>
      {buttonChildren}
    </ToggleButton>
  )
}

const GroupSelector: React.FC<GroupSelectorProps> = ({
  groupId,
  setGroupId,
  groups,
  groupsAvailable,
  studentCount,
}) => {
  const { i18n, t } = useTranslation()
  const [userSelectedGroupId, setUserSelectedGroupId] = React.useState(groupId)

  if (!groupsAvailable)
    return (
      <Box>
        <InfoBox label={t('groups:groupsNotAvailableInfoTitle')} content={t('groups:groupsNotAvailableInfoContent')} />
      </Box>
    )

  const onSelect = (selectedGroupId: string) => {
    setUserSelectedGroupId(selectedGroupId)
    React.startTransition(() => {
      setGroupId(selectedGroupId)
    })
  }

  const localisatedGroups: GroupOption[] = groups
    .map(({ id, name, teachers, studentCount }) => ({
      id,
      name: getLanguageValue(name, i18n.language),
      teachers,
      studentCount,
    }))
    .filter(group => group.studentCount && group.studentCount > 0 && group.studentCount < studentCount)
    .sort(sortGroups)

  const groupOptions: GroupOption[] = React.useMemo(
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

  if (groupOptions.length === 1) return null

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Typography variant="body2">{t('groups:chooseGroup')}</Typography>
      <ToggleButtonGroup value={userSelectedGroupId}>
        {groupOptions.map(opt => (
          <GroupButton key={opt.id} value={opt.id} option={opt} onClick={() => onSelect(opt.id)} />
        ))}
      </ToggleButtonGroup>
    </Box>
  )
}

export default GroupSelector
