import React, { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material'
import { Reorder, Segment } from '@mui/icons-material'
import { useSummaryContext } from '../context'

interface DateRangeType {
  start: Date
  end: Date
}

interface SummaryContextType {
  showSummariesWithNoFeedback: boolean
  setShowSummariesWithNoFeedback: Dispatch<SetStateAction<boolean>>
  dateRange: DateRangeType
  setDateRange: Dispatch<SetStateAction<DateRangeType>>
  option: 'year' | 'semester'
  setOption: Dispatch<SetStateAction<'year' | 'semester'>>
  sortBy: [string, 'asc' | 'desc']
  setSortBy: Dispatch<SetStateAction<[string, 'asc' | 'desc']>>
  sortFunction: (summary: any) => number
  questions: any[]
  viewingMode: 'tree' | 'flat'
  setViewingMode: Dispatch<SetStateAction<'tree' | 'flat'>>
  extraOrgId: string
  setExtraOrgId: Dispatch<SetStateAction<string>>
  extraOrgMode: 'include' | 'exclude'
  setExtraOrgMode: Dispatch<SetStateAction<'include' | 'exclude'>>
}

const ViewingModeSelector = () => {
  const { t } = useTranslation()
  const { viewingMode, setViewingMode } = useSummaryContext() as unknown as SummaryContextType
  const handleChange = (_ev: React.MouseEvent<HTMLElement>, value: 'flat' | 'tree') => {
    if (!value) return
    setViewingMode(value)
  }

  return (
    <ToggleButtonGroup
      exclusive
      value={viewingMode}
      onChange={handleChange}
      color="primary"
      size="small"
      sx={{ height: '40px' }}
    >
      <ToggleButton value="flat">
        <Tooltip title={t('courseSummary:flatView')}>
          <Reorder fontSize="medium" />
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="tree">
        <Tooltip title={t('courseSummary:treeView')}>
          <Segment fontSize="medium" />
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )
}

export default ViewingModeSelector
