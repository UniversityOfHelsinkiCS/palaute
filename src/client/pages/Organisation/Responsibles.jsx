import React, { useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { writeFileXLSX, utils } from 'xlsx'
import { format, isValid } from 'date-fns'
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
import useURLSearchParams from '../../hooks/useURLSearchParams'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { getYearRange, useAcademicYears } from '../../util/yearUtils'
import { NorButton } from '../../components/common/NorButton'
import { YearSelector } from '../../components/common/YearSemesterPeriodSelector'
import {
  useOrganisationFeedbackTargets,
  getCourseRealisationName,
  generateTeacherStats,
  useFacultyFeedbackTargets,
} from './responsiblesUtils'

const styles = {
  filtersHead: {
    color: theme => theme.palette.text.secondary,
  },
  filtersContent: {
    background: theme => theme.palette.background.default,
  },
}

const Filters = React.memo(({ selectedYear, handleYearChange, academicYears }) => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  return (
    <Box position="sticky" top="0" mb={2} zIndex={1}>
      <Accordion onChange={() => setOpen(!open)} disableGutters>
        <AccordionSummary sx={styles.filtersHead}>
          <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', pl: 1, pt: 2 }}>
            <Typography sx={{ mr: 2 }}>{t('organisationSettings:filters')}</Typography>
            <YearSelector value={selectedYear} onChange={handleYearChange} years={academicYears} />
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

const Responsibles = ({ organisation }) => {
  const { t, i18n } = useTranslation()
  const { code } = useParams()
  const ongoingAcademicYearRange = getYearRange(new Date())

  const [params, setParams] = useURLSearchParams()
  const [dateRange, setDateRange] = React.useState(() => {
    const paramsStart = params.get('startDate')
    const paramsEnd = params.get('endDate')

    const start = paramsStart ? new Date(String(params.get('startDate'))) : ongoingAcademicYearRange.start
    const end = paramsEnd ? new Date(String(params.get('endDate'))) : ongoingAcademicYearRange.end

    return isValid(start) && isValid(end) ? { start, end } : { start: new Date(), end: new Date() }
  })

  const startDate = format(new Date(dateRange.start), 'yyyy-MM-dd')
  const endDate = format(new Date(dateRange.end), 'yyyy-MM-dd')

  const { academicYears, selectedYear } = useAcademicYears(dateRange?.start ?? new Date())

  useEffect(() => {
    if (!params.get('startDate') || !params.get('endDate')) {
      params.set('startDate', format(new Date(selectedYear.start), 'yyyy-MM-dd'))
      params.set('endDate', format(new Date(selectedYear.end), 'yyyy-MM-dd'))
      setParams(params)
      setDateRange({ start: selectedYear.start, end: selectedYear.end })
    }
  }, [params, setParams])

  const handleYearChange = ({ start, end }) => {
    setDateRange({ start, end })
    params.set('startDate', format(new Date(start), 'yyyy-MM-dd'))
    params.set('endDate', format(new Date(end), 'yyyy-MM-dd'))
    setParams(params)
  }

  const [expandedTeacherId, setExpandedTeacherId] = React.useState(null)
  const [exportMenuAnchor, setExportMenuAnchor] = React.useState(null)

  const handleRowClick = teacherId => {
    setExpandedTeacherId(expandedTeacherId === teacherId ? null : teacherId)
  }

  const handleOpenExportMenu = event => {
    setExportMenuAnchor(event.currentTarget)
  }

  const handleCloseExportMenu = () => {
    setExportMenuAnchor(null)
  }

  const hookToUse = organisation.isFaculty ? useFacultyFeedbackTargets : useOrganisationFeedbackTargets
  const { data: feedbackTargets, isLoading } = hookToUse({
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
      <Filters selectedYear={selectedYear} handleYearChange={handleYearChange} academicYears={academicYears} />
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
