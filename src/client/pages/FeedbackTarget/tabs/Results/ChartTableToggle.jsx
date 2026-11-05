import BarChartIcon from '@mui/icons-material/BarChart'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { Tooltip } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../../../components/common/NorButton'
import { mergeSx } from '../../../../util/sx'

export const useShowTable = () => {
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    const handleKeyDown = event => {
      const { target } = event
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (isEditable) return

      // Alt + T to toggle between chart and table
      if (event.altKey && event.key === 't') {
        event.preventDefault()
        setShowTable(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return [showTable, setShowTable]
}

const ChartTableToggle = ({ showTable, setShowTable, sx, ...props }) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={t('feedbackTargetResults:keyboardShortcut')} placement="top">
      <NorButton
        id="chart-table-toggle-button"
        onClick={() => setShowTable(prev => !prev)}
        icon={showTable ? <BarChartIcon /> : <TableRowsIcon />}
        sx={mergeSx({ '@media print': { display: 'none' } }, sx)}
        aria-label={`${showTable ? t('feedbackTargetResults:chartView') : t('feedbackTargetResults:tableView')}. ${t('feedbackTargetResults:keyboardShortcut')}`}
        {...props}
      >
        {showTable ? t('feedbackTargetResults:chartView') : t('feedbackTargetResults:tableView')}
      </NorButton>
    </Tooltip>
  )
}

export default ChartTableToggle
