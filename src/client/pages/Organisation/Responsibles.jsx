import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { orderBy } from 'lodash-es'
import { useQuery } from '@tanstack/react-query'
import { writeFileXLSX, utils } from 'xlsx'
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
import apiClient from '../../util/apiClient'
import { NorButton } from '../../components/common/NorButton'

const styles = {
  filtersHead: {
    color: theme => theme.palette.text.secondary,
  },
  filtersContent: {
    background: theme => theme.palette.background.default,
  },
}

const useOrganisationFeedbackTargets = ({ code, startDate, endDate, enabled }) => {
  const queryKey = ['organisationFeedbackTargets', code, startDate, endDate]

  const queryFn = async () => {
    const { data: feedbackTargets } = await apiClient.get(`/feedback-targets/for-organisation/${code}`, {
      params: { startDate, endDate },
    })

    return feedbackTargets
  }

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
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

  const [timeOption, setTimeOption] = useHistoryState('responsiblesTimeperiodOption', 'year')
  const studyYearRange = getYearRange(new Date())
  const [startDate, setStartDate] = React.useState(studyYearRange.start)
  const [endDate, setEndDate] = React.useState(studyYearRange.end)
  const [expandedTeacherId, setExpandedTeacherId] = React.useState(null)
  const [exportMenuAnchor, setExportMenuAnchor] = React.useState(null)

  const getCourseRealisationName = fbt =>
    fbt.courseRealisation.name[i18n.language] ||
    fbt.courseRealisation.name.fi ||
    fbt.courseRealisation.name.en ||
    fbt.courseRealisation.name.sv

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

  const teacherStats = useMemo(() => {
    if (!feedbackTargets || !Array.isArray(feedbackTargets)) return []

    const stats = new Map()

    feedbackTargets.forEach(([_year, months]) => {
      if (!Array.isArray(months)) return

      months.forEach(([_month, days]) => {
        if (!Array.isArray(days)) return

        days.forEach(([_date, fbts]) => {
          if (!Array.isArray(fbts)) return

          fbts.forEach(fbt => {
            if (fbt.responsibleTeachers && Array.isArray(fbt.responsibleTeachers)) {
              fbt.responsibleTeachers.forEach(teacher => {
                if (stats.has(teacher.id)) {
                  stats.get(teacher.id).count++
                  stats.get(teacher.id).feedbackTargets.push(fbt)
                } else {
                  stats.set(teacher.id, {
                    id: teacher.id,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    email: teacher.email,
                    count: 1,
                    feedbackTargets: [fbt],
                  })
                }
              })
            }
          })
        })
      })
    })

    return orderBy(Array.from(stats.values()), ['lastName', 'firstName'], ['asc', 'asc'])
  }, [feedbackTargets])

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
          getCourseRealisationName(fbt),
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
                                    <TableCell>{getCourseRealisationName(fbt)}</TableCell>
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
