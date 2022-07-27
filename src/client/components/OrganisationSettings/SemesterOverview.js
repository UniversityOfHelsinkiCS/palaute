import React, { useEffect, useState } from 'react'
import { debounce } from 'lodash'
import {
  Box,
  Link as MuiLink,
  ButtonBase,
  ClickAwayListener,
  Drawer,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  Divider,
  TextField,
} from '@mui/material'
import { ChevronRight } from '@mui/icons-material'
import { useQuery } from 'react-query'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { addMonths, format } from 'date-fns'
import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../LoadingProgress'
import { getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../TeacherChip'

const useOrganisationFeedbackTargets = ({
  code,
  startDate,
  endDate,
  teacherQuery,
  courseQuery,
  language,
}) => {
  const queryKey = ['organisationFeedbackTargets', code, startDate, endDate]

  const queryFn = async () => {
    const { data: feedbackTargets } = await apiClient.get(
      `/feedback-targets/for-organisation/${code}`,
      { params: { startDate, endDate } },
    )

    return feedbackTargets
  }

  const { data: feedbackTargets, ...rest } = useQuery(queryKey, queryFn)

  const [filtered, setFiltered] = useState([])

  const [first, last] = teacherQuery.toLowerCase().split(' ')
  const courseQueryLower = courseQuery.toLowerCase()

  const filterFn = (fbt) =>
    getLanguageValue(fbt.courseUnit.name, language)
      .toLowerCase()
      .includes(courseQueryLower) &&
    fbt.teachers.some((u) => {
      const firstName = u.firstName.toLowerCase()
      const lastName = u.lastName.toLowerCase()
      return last
        ? firstName.startsWith(first) && lastName.startsWith(last)
        : firstName.startsWith(first) || lastName.startsWith(first)
    })

  const filter = debounce((feedbackTargets) => {
    console.log('filter')
    if (rest.isLoading) return
    if (teacherQuery.length < 3 && courseQuery.length < 3) {
      setFiltered(feedbackTargets)
      return
    }
    const filteredTargets = feedbackTargets
      .map(([d, months]) => [
        d,
        months
          .map(([d, days]) => [
            d,
            days
              .map(([d, fbts]) => [d, fbts.filter(filterFn)])
              .filter(([, fbts]) => fbts.length > 0),
          ])
          .filter(([, days]) => days.length > 0),
      ])
      .filter(([, months]) => months.length > 0)
    setFiltered(filteredTargets)
  }, 600)

  useEffect(
    () => filter(feedbackTargets),
    [courseQuery, teacherQuery, rest.isLoading],
  )

  return { feedbackTargets: filtered, ...rest }
}

const styles = {
  date: {
    position: 'sticky',
    top: '6rem',
    height: '3rem',
    minWidth: '5rem',
    textTransform: 'capitalize',
    color: (theme) => theme.palette.text.secondary,
    fontSize: '16px',
  },
  item: {
    borderRadius: '3px',
  },
  selectedItem: {
    background: (theme) => theme.palette.grey['100'],
  },
}

const FeedbackTargetDrawer = ({ feedbackTarget, onClose, language, t }) => (
  <ClickAwayListener onClickAway={onClose}>
    <Drawer
      open={Boolean(feedbackTarget)}
      onClose={onClose}
      anchor="right"
      variant="persistent"
    >
      <Toolbar />
      {feedbackTarget && (
        <Box mr={2} maxWidth="30rem">
          <Box display="flex" mb={2}>
            <IconButton onClick={onClose} disableFocusRipple>
              <ChevronRight />
            </IconButton>
            <Box ml={1}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">
                  {getLanguageValue(feedbackTarget.courseUnit.name, language)}
                </Typography>
                <Box mr={1} />
                <Typography>{feedbackTarget.courseUnit.courseCode}</Typography>
              </Box>
              <Box mb={1}>
                <MuiLink component={Link} to={`/targets/${feedbackTarget.id}`}>
                  {getLanguageValue(
                    feedbackTarget.courseRealisation.name,
                    language,
                  )}
                </MuiLink>
              </Box>
            </Box>
          </Box>
          <Divider />
          <Box m={3}>
            <Box>
              <Box display="flex">
                <Box
                  minWidth="9rem"
                  sx={{ color: (theme) => theme.palette.text.secondary }}
                >
                  {t('feedbackTargetView:coursePeriod')}:
                </Box>
                {new Date(
                  feedbackTarget.courseRealisation.startDate,
                ).toLocaleDateString(language)}{' '}
                -{' '}
                {new Date(
                  feedbackTarget.courseRealisation.endDate,
                ).toLocaleDateString(language)}
              </Box>
              <Box display="flex" mt={0.5}>
                <Box
                  minWidth="9rem"
                  sx={{ color: (theme) => theme.palette.text.secondary }}
                >
                  {t('feedbackTargetView:feedbackPeriod')}:
                </Box>
                {new Date(feedbackTarget.opensAt).toLocaleDateString(language)}{' '}
                -{' '}
                {new Date(feedbackTarget.closesAt).toLocaleDateString(language)}
              </Box>
            </Box>
            <Box mt={3}>
              <Typography variant="subtitle1">
                {t('courseSummary:responsibleTeachers')}
              </Typography>
            </Box>
            <Box mt={0.5} display="flex" flexWrap="wrap">
              {feedbackTarget.teachers.map((teacher) => (
                <TeacherChip user={teacher} key={teacher.id} />
              ))}
            </Box>
            <Box mt={3} sx={{ color: (theme) => theme.palette.text.secondary }}>
              {t('teacherView:feedbackCount', {
                count: feedbackTarget.feedbackCount,
                totalCount: feedbackTarget.studentCount,
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Drawer>
  </ClickAwayListener>
)

const FeedbackTargetItem = ({ title, onClick, selected }) => (
  <Box m={0.5}>
    <ButtonBase
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Paper sx={[styles.item, selected && styles.selectedItem]}>
        <Box m={1.5} fontSize="16px">
          {title}
        </Box>
      </Paper>
    </ButtonBase>
  </Box>
)

const Filters = ({ onChange, value, t }) => (
  <Box position="sticky" top="0" mb={2} zIndex={1}>
    <Paper elevation={2}>
      <Box display="flex" p={1} pb={2} alignItems="start">
        <TextField
          type="date"
          value={format(value.startDate, 'yyyy-MM-dd')}
          onChange={({ target }) =>
            onChange({ ...value, startDate: new Date(target.value) })
          }
          label={t('organisationSettings:startDate')}
        />
        <Box m={1} />
        <TextField
          type="date"
          value={format(value.endDate, 'yyyy-MM-dd')}
          onChange={({ target }) =>
            onChange({ ...value, endDate: new Date(target.value) })
          }
          label={t('organisationSettings:endDate')}
        />
        <Box m={2} />
        <TextField
          value={value.teacherQuery}
          onChange={(e) => onChange({ ...value, teacherQuery: e.target.value })}
          label={t('organisationSettings:findByTeacher')}
        />
        <Box m={1} />
        <TextField
          value={value.courseQuery}
          onChange={(e) => onChange({ ...value, courseQuery: e.target.value })}
          label={t('organisationSettings:findByCourseUnit')}
        />
      </Box>
    </Paper>
  </Box>
)

const toMonth = (date, locale) =>
  new Date(date).toLocaleString(locale, { month: 'short' })

const SemesterOverview = () => {
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: addMonths(new Date(), 12),
    teacherQuery: '',
    courseQuery: '',
  })

  const { code } = useParams()
  const { t, i18n } = useTranslation()
  const { feedbackTargets: years, isLoading } = useOrganisationFeedbackTargets({
    code,
    ...filters,
  })

  return (
    <Box>
      <FeedbackTargetDrawer
        feedbackTarget={selected}
        onClose={() => setSelected(null)}
        language={i18n.language}
        t={t}
      />
      <Filters value={filters} onChange={setFilters} t={t} />
      {isLoading && <LoadingProgress />}
      {!isLoading &&
        years.map(([year, months]) => (
          <Box display="flex" mb={4} key={year}>
            <Box sx={styles.date} mt={1}>
              {year}
            </Box>
            <Box>
              {months.map(([firstDayOfMonth, days]) => (
                <Box display="flex" mb={3} key={firstDayOfMonth}>
                  <Box sx={styles.date} mt={1}>
                    {toMonth(firstDayOfMonth, i18n.language)}
                  </Box>
                  <Box>
                    {days.map(([startDate, feedbackTargets]) => (
                      <Box key={startDate} display="flex">
                        <Box sx={styles.date} mr={2} mt={1}>
                          {format(Date.parse(startDate), 'dd/MM')}
                        </Box>
                        <Box display="flex" flexWrap="wrap">
                          {feedbackTargets.map((fbt) => (
                            <FeedbackTargetItem
                              key={fbt.id}
                              title={getLanguageValue(
                                fbt.courseUnit.name,
                                i18n.language,
                              )}
                              onClick={() => setSelected(fbt)}
                              selected={selected?.id === fbt.id}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
    </Box>
  )
}

export default SemesterOverview
