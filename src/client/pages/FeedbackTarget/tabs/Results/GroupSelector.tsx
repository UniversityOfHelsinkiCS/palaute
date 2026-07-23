import type { LocalizedString } from '@common/types/common'
import type { User } from '@common/types/user'

import { Box, ToggleButton, ToggleButtonGroup, Typography, Alert } from '@mui/material'
import { Theme } from '@mui/material/styles'
import React from 'react'
import { useTranslation } from 'react-i18next'

import PaperTooltip from '../../../../components/common/PaperTooltip'
import TeacherChip from '../../../../components/common/TeacherChip'
import { getLanguageValue } from '../../../../util/languageUtils'
import { sortGroups } from './utils'

type Group = {
  id: string
  name: LocalizedString
  studentCount?: number
  teachers?: Array<User>
}

type GroupOption = {
  id: string
  name: string
  studentCount?: number
  teachers?: Array<User>
}

type GroupButtonProps = {
  option: GroupOption
  onClick: () => void
  value: string
  [key: string]: any
}

type GroupSelectorProps = {
  groupId: string
  setGroupId: (groupId: string) => void
  groups: Group[]
  groupsAvailable: boolean
  studentCount: number
}

const groupButtonStyle = (theme: Theme) => ({
  p: '3px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-focusVisible': {
    border: '3px solid',
    borderColor: theme.palette.primary.main,
    p: '0px',
  },
})

const GroupButton: React.FC<GroupButtonProps> = ({ option, onClick, value, ...props }) => {
  const { t } = useTranslation()

  const buttonLabel = <Box p={1}>{option.name}</Box>

  const hasTooltipContent = option.studentCount || option.teachers

  return option.id !== 'ALL' && hasTooltipContent ? (
    <PaperTooltip
      title={
        <Box p="0.3rem">
          {option.studentCount && (
            <Typography variant="body2">
              {t('common:studentCount')}:{' '}
              <Typography component="span" color="textSecondary">
                {option.studentCount}
              </Typography>
            </Typography>
          )}
          {option.teachers && option.teachers.length > 0 && (
            <>
              <Typography variant="body2" sx={{ mt: '0.3rem', mb: '0.2rem' }}>
                {t('groups:teachersOfGroup')}:
              </Typography>
              {option.teachers.map(teacher => (
                <div key={teacher.id}>
                  <TeacherChip user={teacher} tooltipPlacement="right" />
                </div>
              ))}
            </>
          )}
        </Box>
      }
    >
      <ToggleButton onClick={onClick} sx={groupButtonStyle} value={value} disableRipple {...props}>
        {buttonLabel}
      </ToggleButton>
    </PaperTooltip>
  ) : (
    <ToggleButton onClick={onClick} sx={groupButtonStyle} value={value} disableRipple {...props}>
      {buttonLabel}
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
      <Box sx={{ mr: 1, '@media print': { display: 'none' } }}>
        <Alert severity="info" role="status" sx={{ py: 0.3 }}>
          {t('groups:groupsNotAvailableInfo')}
        </Alert>
      </Box>
    )

  const onSelect = (selectedGroupId: string) => {
    setUserSelectedGroupId(selectedGroupId)
    React.startTransition(() => {
      setGroupId(selectedGroupId)
    })
  }

  const localisatedGroups: GroupOption[] = groups
    .map(group => ({
      id: group.id,
      name: getLanguageValue(group.name, i18n.language),
      teachers: group.teachers,
      studentCount: group.studentCount,
    }))
    .sort(sortGroups)

  const groupOptions: GroupOption[] = React.useMemo(() => {
    // First option for "ALL"
    const allOption: GroupOption = {
      id: 'ALL',
      name: t('common:all'),
      teachers: [],
      studentCount,
    }

    return [allOption, ...localisatedGroups]
  }, [localisatedGroups])

  if (groupOptions.length === 1) return null

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Typography variant="body2">{t('groups:chooseGroup')}</Typography>
      <Box sx={{ overflow: 'auto' }}>
        <ToggleButtonGroup value={userSelectedGroupId}>
          {groupOptions.map(opt => (
            <GroupButton key={opt.id} value={opt.id} option={opt} onClick={() => onSelect(opt.id)} />
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  )
}

export default GroupSelector
