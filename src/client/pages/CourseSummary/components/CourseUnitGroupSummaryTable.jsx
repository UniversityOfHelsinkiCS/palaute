import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Button,
  Alert,
  ButtonBase,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import { visuallyHidden } from '@mui/utils'
import { lightFormat } from 'date-fns'
import { useSummaryContext } from '../context'
import { TeacherChips } from './Labels'
import { getLanguageValue } from '../../../util/languageUtils'
import { getArrow } from '../../../components/SummaryResultItem/WorkloadResultItem'
import { getMeanOption } from '../../FeedbackTarget/tabs/Results/QuestionResults/AverageResult'
import { focusIndicatorStyle } from '../../../util/accessibility'

const styles = {
  cell: {
    whiteSpace: 'nowrap',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '3.5rem',
    borderRadius: 2,
    color: 'black',
  },
  headerCell: {
    verticalAlign: 'bottom',
    borderBottom: '0.4rem solid #5F93CE',
    p: 1,
    backgroundColor: 'white',
  },
  titleContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'white',
    backgroundColor: 'primary.main',
    p: 2,
    rowGap: 2,
  },
  caption: {
    captionSide: 'bottom',
    textAlign: 'left',
    fontSize: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
    py: 4,
    border: '1px solid gray',
  },
  curButton: {
    color: 'white',
    borderColor: 'white',
    py: 1,
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    ...focusIndicatorStyle({ color: 'white' }),
  },
  expandButton: {
    typography: 'h6',
    color: 'white',
    backgroundColor: 'transparent',
    borderRadius: 2,
    px: 1.5,
    textTransform: 'none',
    '& .MuiButton-startIcon svg': {
      fontSize: 32,
    },
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    ...focusIndicatorStyle({ color: 'white' }),
  },
  linkButton: {
    color: 'primary.main',
    textDecoration: 'underline',
    p: 0.5,
    borderRadius: 1,
    '&:hover': {
      color: 'primary.dark',
    },
    ...focusIndicatorStyle(),
  },
  tooltipArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '2.5rem',
    height: '2.5rem',
  },
}

const addTimePeriod = timePeriod => {
  if (timePeriod === null) return ''
  return ` (${timePeriod})`
}

const getSurveyGroupTimePeriod = ({ surveyGroup, validUntil, showTimePeriod }) => {
  let timeframe = null
  if (showTimePeriod) {
    const validFromYear = surveyGroup.survey?.validFrom ? new Date(surveyGroup.survey.validFrom).getFullYear() : null
    const validUntilYear = validUntil ? new Date(validUntil).getFullYear() : null

    let startYear = validFromYear
    if (!startYear) {
      const realisationYears = surveyGroup.feedbackTargets
        .map(fbt => fbt.courseRealisation?.startDate)
        .filter(Boolean)
        .map(d => new Date(d).getFullYear())
      startYear = realisationYears.length ? Math.min(...realisationYears) : null
    }

    if (startYear && !validUntilYear) timeframe = `${startYear}–`
    else if (startYear && validUntilYear) timeframe = `${startYear}–${validUntilYear}`
  }

  return timeframe
}

const getCourseRealisationTimePeriod = cur => {
  if (!cur?.startDate || !cur?.endDate) return '–'

  const { startDate, endDate } = cur

  const formattedStartDate = lightFormat(new Date(startDate), 'd.M.yyyy')
  const formattedEndDate = lightFormat(new Date(endDate), 'd.M.yyyy')
  const timePeriod = `${formattedStartDate}–${formattedEndDate}`

  return timePeriod
}

const getStaff = feedbackTarget => {
  if (!feedbackTarget?.userFeedbackTargets) return { teachers: [], responsibleTeachers: [], administrativePersons: [] }

  const teachers = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.accessStatus === 'TEACHER')
    .map(ufbt => ufbt.user)
  const responsibleTeachers = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.accessStatus === 'RESPONSIBLE_TEACHER' && !ufbt.isAdministrativePerson)
    .map(ufbt => ufbt.user)
  const administrativePersons = feedbackTarget.userFeedbackTargets
    .filter(ufbt => ufbt.isAdministrativePerson)
    .map(ufbt => ufbt.user)

  return { teachers, responsibleTeachers, administrativePersons }
}

const questionFilter = q => q.type === 'LIKERT' || q.secondaryType === 'WORKLOAD'

const getBackgroundColor = ({ value, factor }) => {
  const backgroundColors = {
    1: '#d355b3',
    2: '#e8a6d7',
    3: '#a8def0',
    4: '#a6e8b6',
    5: '#289a44',
  }

  for (let i = 1; i < 5; i++) {
    if (value < i * factor + 1) return backgroundColors[i]
  }

  return backgroundColors[5]
}

const FeedbackResponseIndicator = ({ percentage, isCourseUnitGroup, t }) => {
  if (percentage === null) return <Typography>–</Typography>

  if (isCourseUnitGroup)
    return (
      <>
        <Tooltip title={t('courseSummary:feedbackResponsePercentage')}>
          <Box sx={styles.tooltipArea} aria-hidden aria-label={undefined}>
            {`${percentage} %`}
          </Box>
        </Tooltip>
        <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
          {`${t('courseSummary:feedbackResponsePercentage')}: ${percentage} %`}
        </Box>
      </>
    )

  const text = percentage > 0 ? t('teacherView:feedbackResponseGiven') : t('teacherView:feedbackResponseMissing')

  return (
    <>
      <Tooltip title={text}>
        <Box sx={styles.tooltipArea} aria-hidden aria-label={undefined}>
          {percentage > 0 ? <CheckIcon sx={{ color: 'black' }} /> : <ClearIcon sx={{ color: 'black' }} />}
        </Box>
      </Tooltip>
      <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
        {text}
      </Box>
    </>
  )
}

const SummaryTableHeaderCell = ({ children, sx = {}, ...props }) => (
  <TableCell sx={{ ...styles.headerCell, ...sx }} {...props}>
    {children}
  </TableCell>
)

const SummaryTableCell = ({ children, sx = {}, ...props }) => (
  <TableCell sx={{ backgroundColor: 'white', verticalAlign: 'center', ...sx }} {...props}>
    {children}
  </TableCell>
)

const SummaryTableCellContent = ({ width, backgroundColor, children, ...props }) => (
  <Box sx={{ width, backgroundColor, ...styles.cell }} {...props}>
    {children}
  </Box>
)

const CourseUnitGroupSummaryTableHeader = ({ questions }) => {
  const { t, i18n } = useTranslation()

  return (
    <TableHead>
      <TableRow>
        <SummaryTableHeaderCell sx={{ position: 'sticky', left: 0, zIndex: 3 }}>
          {t('courseSummary:summaryTarget')}
        </SummaryTableHeaderCell>
        <SummaryTableHeaderCell>{t('courseSummary:courseStaff')}</SummaryTableHeaderCell>
        {questions.map(q => (
          <SummaryTableHeaderCell key={q.id} sx={styles.headerCell}>
            {getLanguageValue(q.data.label, i18n.language)}
          </SummaryTableHeaderCell>
        ))}
        <SummaryTableHeaderCell>{`${t('courseSummary:feedbackCount')} / ${t('courseSummary:studentCount')}`}</SummaryTableHeaderCell>
        <SummaryTableHeaderCell>{t('courseSummary:feedbackPercentage')}</SummaryTableHeaderCell>
        <SummaryTableHeaderCell>{t('feedbackResponse:responseLabel')}</SummaryTableHeaderCell>
        <SummaryTableHeaderCell>{t('courseSummary:censoredCount')}</SummaryTableHeaderCell>
      </TableRow>
    </TableHead>
  )
}

const CourseUnitGroupSummaryTableRow = ({ target, surveyGroup, questions, timePeriod, depth = 1 }) => {
  const { t, i18n } = useTranslation()
  const isCourseUnitGroup = Boolean(target?.surveyGroups)

  const title = isCourseUnitGroup
    ? `${target?.courseCode} ${getLanguageValue(target?.name, i18n.language)}${addTimePeriod(timePeriod)}`
    : `${getLanguageValue(target?.courseRealisation?.name, i18n.language)} ${timePeriod}`

  const data = isCourseUnitGroup ? surveyGroup?.summary?.data : target?.summary?.data
  const percent = data ? ((data.feedbackCount / data.studentCount) * 100).toFixed() : null
  const feedbackResponsePercentage = data ? (data.feedbackResponsePercentage * 100).toFixed() : null
  const hiddenCount = data?.hiddenCount || 0

  const staff = isCourseUnitGroup ? getStaff() : getStaff(target)
  const { teachers, responsibleTeachers, administrativePersons } = staff
  const teacherChips = isCourseUnitGroup ? (
    <>
      <SummaryTableCellContent width="3.5rem" aria-hidden>
        <Tooltip title={t('courseSummary:courseStaffInfo')}>
          <Box sx={styles.tooltipArea}>
            <Typography>–</Typography>
          </Box>
        </Tooltip>
      </SummaryTableCellContent>
      <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
        {t('courseSummary:courseStaffInfo')}
      </Box>
    </>
  ) : (
    <TeacherChips
      teachers={teachers}
      responsibleTeachers={responsibleTeachers}
      administrativePersons={administrativePersons}
    />
  )

  return (
    <TableRow
      sx={{
        '& > th:first-of-type': {
          boxShadow: depth === 1 ? `inset ${depth * 0.4}rem 0 0 #5F93CE` : `inset ${depth * 0.6}rem 0 0 #5F93CE`,
          pl: depth === 1 ? `${depth * 0.4 + 1}rem` : `${depth * 0.6 + 1}rem`,
        },
      }}
    >
      <SummaryTableCell component="th" scope="row" sx={{ position: 'sticky', left: 0, zIndex: 2 }}>
        {!isCourseUnitGroup && target?.id ? (
          <Tooltip title={t('courseSummary:openFeedbackPage')} placement="bottom" arrow describeChild>
            <ButtonBase component={Link} to={`/targets/${target.id}/results`} sx={styles.linkButton}>
              <Typography variant="body2">{title}</Typography>
            </ButtonBase>
          </Tooltip>
        ) : (
          <Typography>{title}</Typography>
        )}
      </SummaryTableCell>
      <SummaryTableCell>{teacherChips}</SummaryTableCell>
      {questions.map(q => {
        const isWorkloadQuestion = q?.secondaryType === 'WORKLOAD'
        const mean = data?.result?.[q.id]?.mean?.toFixed(2) || 0
        const normalizedMean = isWorkloadQuestion ? 5.0 - Math.abs((mean - 3) * 2.0) : mean

        const meanText = isWorkloadQuestion
          ? getLanguageValue(getMeanOption(mean, q)?.label, i18n.language)
          : normalizedMean
        const screenReaderText =
          normalizedMean > 0 ? `${t('feedbackSummary:average')}: ${meanText}` : t('courseSummary:noResults')

        return (
          <SummaryTableCell key={q.id}>
            <SummaryTableCellContent
              width="3.5rem"
              backgroundColor={mean ? getBackgroundColor({ value: normalizedMean, factor: 0.8 }) : 'transparent'}
              aria-hidden
            >
              {isWorkloadQuestion &&
                (mean > 0 ? (
                  <Tooltip title={screenReaderText}>
                    <Box sx={styles.tooltipArea}>{getArrow(mean)}</Box>
                  </Tooltip>
                ) : (
                  <Typography>–</Typography>
                ))}
              {!isWorkloadQuestion && <Typography>{mean > 0 ? mean : '–'}</Typography>}
            </SummaryTableCellContent>
            <Box component="span" sx={{ ...visuallyHidden, width: '0px', height: '0px' }}>
              {screenReaderText}
            </Box>
          </SummaryTableCell>
        )
      })}
      <SummaryTableCell>
        <SummaryTableCellContent
          width="8rem"
          backgroundColor={percent ? getBackgroundColor({ value: percent, factor: 10 }) : 'transparent'}
        >
          <Typography>{data ? `${data.feedbackCount} / ${data.studentCount}` : '–'}</Typography>
        </SummaryTableCellContent>
      </SummaryTableCell>
      <SummaryTableCell>
        <SummaryTableCellContent
          width="4.5rem"
          backgroundColor={percent !== null ? getBackgroundColor({ value: percent, factor: 10 }) : 'transparent'}
        >
          <Typography>{percent !== null ? `${percent} %` : '–'}</Typography>
        </SummaryTableCellContent>
      </SummaryTableCell>
      <SummaryTableCell>
        <SummaryTableCellContent
          width="4.5rem"
          backgroundColor={
            feedbackResponsePercentage !== null
              ? getBackgroundColor({ value: feedbackResponsePercentage, factor: 20 })
              : 'transparent'
          }
        >
          <FeedbackResponseIndicator
            percentage={feedbackResponsePercentage}
            isCourseUnitGroup={isCourseUnitGroup}
            t={t}
          />
        </SummaryTableCellContent>
      </SummaryTableCell>
      <SummaryTableCell>
        <SummaryTableCellContent width="3.5rem" backgroundColor={hiddenCount > 0 ? '#e8a6d7' : '#a8def0'}>
          <Typography>{hiddenCount}</Typography>
        </SummaryTableCellContent>
      </SummaryTableCell>
    </TableRow>
  )
}

const CourseUnitGroupSummaryTable = ({ courseUnitGroup, group, showTimePeriod, validUntil, isLoading }) => {
  const { t, i18n } = useTranslation()
  const { questions: contextQuestions } = useSummaryContext()
  const questions = group.survey ? (group.survey.questions ?? []).filter(questionFilter) : contextQuestions

  const [depth, setDepth] = React.useState('cur') // 'hide', 'cu', 'cur'

  const courseUnitGroupTimePeriod = getSurveyGroupTimePeriod({ surveyGroup: group, validUntil, showTimePeriod })

  const courseUnitTitle = `${courseUnitGroup?.courseCode} ${getLanguageValue(courseUnitGroup?.name, i18n.language)}${addTimePeriod(courseUnitGroupTimePeriod)}`
  const fbtCount = group?.feedbackTargets?.length || 0

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={styles.titleContainer}>
        <Button
          type="button"
          onClick={() => (depth === 'hide' ? setDepth('cur') : setDepth('hide'))}
          startIcon={depth === 'hide' ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          sx={styles.expandButton}
          aria-label={
            depth === 'hide'
              ? `${courseUnitTitle}: ${t('courseSummary:showSummary')}`
              : `${courseUnitTitle}: ${t('courseSummary:hideSummary')}`
          }
          disableRipple
        >
          {courseUnitTitle}
        </Button>
        {depth !== 'hide' && (
          <Button
            variant="outlined"
            onClick={() => (depth === 'cur' ? setDepth('cu') : setDepth('cur'))}
            sx={styles.curButton}
            disableRipple
          >
            {depth === 'cur' ? t('courseSummary:hideCurs') : t('courseSummary:showCurs')}
          </Button>
        )}
      </Box>
      {depth !== 'hide' && Boolean(isLoading) && (
        <Box sx={styles.loadingContainer}>
          <CircularProgress size="2rem" variant="indeterminate" role={undefined} aria-hidden />
          <Typography>{t('courseSummary:loading')}</Typography>
        </Box>
      )}
      {depth !== 'hide' && !isLoading && fbtCount === 0 && (
        <Alert severity="info">
          {t('courseSummary:noCourseRealisations', { courseCode: courseUnitGroup?.courseCode })}
        </Alert>
      )}
      {depth !== 'hide' && !isLoading && fbtCount > 0 && (
        <Box sx={{ p: 1, border: '1px solid gray' }}>
          <TableContainer sx={{ maxHeight: Math.floor(window.innerHeight * 0.8), overflow: 'auto' }}>
            <Table stickyHeader>
              <caption style={styles.caption}>{`${t('organisationSettings:summaryTab')}: ${courseUnitTitle}`}</caption>
              <CourseUnitGroupSummaryTableHeader questions={questions} />
              <TableBody>
                <CourseUnitGroupSummaryTableRow
                  target={courseUnitGroup}
                  surveyGroup={group}
                  questions={questions}
                  timePeriod={courseUnitGroupTimePeriod}
                />
                {depth === 'cur' &&
                  group.feedbackTargets.map(fbt => (
                    <CourseUnitGroupSummaryTableRow
                      key={fbt.id}
                      target={fbt}
                      questions={questions}
                      timePeriod={getCourseRealisationTimePeriod(fbt.courseRealisation)}
                      depth={2}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

export default CourseUnitGroupSummaryTable
