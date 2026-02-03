import React, { useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { writeFileXLSX, utils } from 'xlsx'
import { format } from 'date-fns'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { ArrowDropDown, Menu as MenuIcon, KeyboardArrowDown, KeyboardArrowUp, Download } from '@mui/icons-material'

import { LoadingProgress } from '../../components/common/LoadingProgress'
import { YearSemesterPeriodSelector } from '../../components/common/YearSemesterPeriodSelector'
import useHistoryState from '../../hooks/useHistoryState'
import { getYearRange } from '../../util/yearUtils'
import { NorButton } from '../../components/common/NorButton'
import { useOrganisationFeedbackTargets, getCourseRealisationName, generateTeacherStats } from './responsiblesUtils'

const styles = {
  filtersHead: {
    color: theme => theme.palette.text.secondary,
  },
  filtersContent: {
    background: theme => theme.palette.background.default,
  },
}

const Filters = React.memo(({ startDate, endDate, onChange, timeOption, setTimeOption }) => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  return (
    <Box position="sticky" top="0" mb={2} zIndex={1}>
      <Accordion onChange={() => setOpen(!open)} disableGutters>
        <AccordionSummary sx={styles.filtersHead}>
          <Box display="flex" width="100%" alignItems="center" pl={1}>
            {t('organisationSettings:filters')}
            <Box mx={2} />
            <YearSemesterPeriodSelector
              value={{ start: startDate, end: endDate }}
              option={timeOption}
              onChange={v => onChange(v.start, v.end)}
              setOption={setTimeOption}
            />
            <Box ml="auto">{open ? <ArrowDropDown /> : <MenuIcon />}</Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={styles.filtersContent}>
          <Box p={1}>
            <Typography variant="body2" color="textSecondary">
              {t('organisationSettings:selectTimePeriod')}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
})

const Responsibles = () => {
  const { t, i18n } = useTranslation()
  const { code } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [timeOption, setTimeOption] = useHistoryState('responsiblesTimeperiodOption', 'year')
  const studyYearRange = getYearRange(new Date())

  // Initialize dates from URL params or default to current study year
  const initialStartDate = searchParams.get('startDate') || studyYearRange.start
  const initialEndDate = searchParams.get('endDate') || studyYearRange.end

  const [startDate, setStartDate] = React.useState(initialStartDate)
  const [endDate, setEndDate] = React.useState(initialEndDate)
  const [expandedTeacherId, setExpandedTeacherId] = React.useState(null)
  const [exportMenuAnchor, setExportMenuAnchor] = React.useState(null)

  useEffect(() => {
    if (searchParams.get('option') && searchParams.get('option') !== timeOption) {
      setTimeOption(searchParams.get('option'))
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (startDate) {
      const formattedStartDate = startDate instanceof Date ? format(startDate, 'yyyy-MM-dd') : startDate
      params.set('startDate', formattedStartDate)
    }
    if (endDate) {
      const formattedEndDate = endDate instanceof Date ? format(endDate, 'yyyy-MM-dd') : endDate
      params.set('endDate', formattedEndDate)
    }
    if (timeOption) params.set('option', timeOption)
    setSearchParams(params, { replace: true })
  }, [startDate, endDate, timeOption])

  const handleDateChange = (newStart, newEnd) => {
    setStartDate(newStart)
    setEndDate(newEnd)
  }

  const handleRowClick = teacherId => {
    setExpandedTeacherId(expandedTeacherId === teacherId ? null : teacherId)
  }

  const handleOpenExportMenu = event => {
    setExportMenuAnchor(event.currentTarget)
  }

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null)
  }

  const { data: feedbackTargets, isLoading } = useOrganisationFeedbackTargets({
    code,
    startDate,
    endDate,
    enabled: startDate !== null,
  })

  const teacherStats = useMemo(() => generateTeacherStats(feedbackTargets), [feedbackTargets])

  const exportSummary = () => {
    const headers = [t('common:lastName'), t('common:firstName'), t('organisationSettings:feedbackTargetCount')]
    const data = [headers, ...teacherStats.map(teacher => [teacher.lastName, teacher.firstName, teacher.count])]

    const worksheet = utils.aoa_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, t('organisationSettings:summary'))

    const fileName = `${code}_${t('organisationSettings:exportFilePrefix')}_${t('organisationSettings:summary')}.xlsx`
    writeFileXLSX(workbook, fileName)
    handleCloseExportMenu()
  }

  const exportDetailed = () => {
    const data = []

    // Headers
    data.push([
      t('common:lastName'),
      t('common:firstName'),
      t('common:code'),
      t('common:name'),
      t('organisationSettings:startDate'),
      t('organisationSettings:endDate'),
    ])

    // Data rows
    teacherStats.forEach(teacher => {
      teacher.feedbackTargets.forEach(fbt => {
        data.push([
          teacher.lastName,
          teacher.firstName,
          fbt.courseUnit.courseCode,
          getCourseRealisationName(fbt, i18n),
          new Date(fbt.courseRealisation.startDate).toLocaleDateString(i18n.language),
          new Date(fbt.courseRealisation.endDate).toLocaleDateString(i18n.language),
        ])
      })
    })

    const worksheet = utils.aoa_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, t('organisationSettings:detailed'))

    const fileName = `${code}_${t('organisationSettings:exportFilePrefix')}_${t('organisationSettings:detailed')}.xlsx`
    writeFileXLSX(workbook, fileName)
    handleCloseExportMenu()
  }

  if (isLoading) {
    return <LoadingProgress />
  }

  return (
    <Box>
      <Filters
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateChange}
        timeOption={timeOption}
        setTimeOption={setTimeOption}
      />

      <Box display="flex" gap={1} mb={2}>
        <NorButton
          color="primary"
          onClick={handleOpenExportMenu}
          disabled={teacherStats.length === 0}
          icon={<Download />}
        >
          {t('common:exportXLSX')}
        </NorButton>
        <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={handleCloseExportMenu}>
          <MenuItem onClick={exportSummary}>{t('organisationSettings:summary')}</MenuItem>
          <MenuItem onClick={exportDetailed}>{t('organisationSettings:detailed')}</MenuItem>
        </Menu>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('common:lastName')}</TableCell>
              <TableCell>{t('common:firstName')}</TableCell>
              <TableCell align="right">{t('organisationSettings:feedbackTargetCount')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teacherStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {t('organisationSettings:noTeachersFound')}
                </TableCell>
              </TableRow>
            ) : (
              teacherStats.map(teacher => {
                const isExpanded = expandedTeacherId === teacher.id

                return (
                  <React.Fragment key={teacher.id}>
                    <TableRow hover onClick={() => handleRowClick(teacher.id)} sx={{ cursor: 'pointer' }}>
                      <TableCell>
                        <IconButton size="small" sx={{ mr: 1 }}>
                          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                        {teacher.lastName}
                      </TableCell>
                      <TableCell>{teacher.firstName}</TableCell>
                      <TableCell align="right">{teacher.count}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>{t('common:code')}</TableCell>
                                  <TableCell>{t('common:name')}</TableCell>
                                  <TableCell>{t('organisationSettings:startDate')}</TableCell>
                                  <TableCell>{t('organisationSettings:endDate')}</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {teacher.feedbackTargets.map(fbt => (
                                  <TableRow key={fbt.id}>
                                    <TableCell>{fbt.courseUnit.courseCode}</TableCell>
                                    <TableCell>{getCourseRealisationName(fbt, i18n)}</TableCell>
                                    <TableCell>
                                      {new Date(fbt.courseRealisation.startDate).toLocaleDateString(i18n.language)}
                                    </TableCell>
                                    <TableCell>
                                      {new Date(fbt.courseRealisation.endDate).toLocaleDateString(i18n.language)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Responsibles
