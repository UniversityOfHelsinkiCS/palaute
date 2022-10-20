import React, { useEffect, useState } from 'react'
import _, { debounce } from 'lodash'
import {
  Box,
  Link as MuiLink,
  ButtonBase,
  Drawer,
  Paper,
  Toolbar,
  Typography,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Button,
} from '@mui/material'
import { ArrowDropDown, ChevronRight, Menu } from '@mui/icons-material'
import { useQuery } from 'react-query'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { addMonths, format } from 'date-fns'
import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../common/LoadingProgress'
import { getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../common/TeacherChip'
import MultiSelect from '../common/MultiSelect'

const useOrganisationFeedbackTargets = ({
  code,
  startDate,
  endDate,
  teacherQuery,
  courseQuery,
  tags,
  includeWithoutTeachers,
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
    // filter by tag
    (!tags.length > 0 ||
      fbt.courseRealisation.tags.some((tag) => tags.includes(tag.id))) &&
    // filter by course name
    (getLanguageValue(fbt.courseUnit.name, language)
      .toLowerCase()
      .includes(courseQueryLower) ||
      // filter by code
      fbt.courseUnit.courseCode.toLowerCase().includes(courseQueryLower)) &&
    // if teacher name query not empty, filter by teachers
    ((!first && !last) ||
      fbt.teachers.some((u) => {
        const firstName = u.firstName.toLowerCase()
        const lastName = u.lastName.toLowerCase()
        return last
          ? firstName.startsWith(first) && lastName.startsWith(last)
          : firstName.startsWith(first) || lastName.startsWith(first)
      })) &&
    // if includeWithoutTeachers, skip checking that there are teachers
    (includeWithoutTeachers || fbt.teachers.length > 0)

  const filter = debounce((feedbackTargets) => {
    if (rest.isLoading) return
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
    [courseQuery, teacherQuery, includeWithoutTeachers, tags, rest.isLoading],
  )

  return { feedbackTargets: filtered, ...rest }
}

const styles = {
  date: {
    position: 'sticky',
    top: '4rem',
    height: '1rem',
    minWidth: '5rem',
    textTransform: 'capitalize',
    color: (theme) => theme.palette.text.secondary,
    fontSize: '16px',
  },
  item: {
    borderRadius: '3px',
    '&:hover': {
      color: (theme) => theme.palette.primary.main,
    },
  },
  specialItem: {
    background: (theme) => theme.palette.action.disabled,
  },
  selectedItem: {
    color: (theme) => theme.palette.primary.main,
  },
  filtersHead: {
    color: (theme) => theme.palette.text.secondary,
  },
  filtersContent: {
    background: (theme) => theme.palette.background.default,
  },
}

const TagSelector = ({ feedbackTarget, tags, t, language }) => {
  const originalTagIds = feedbackTarget.courseRealisation.tags.map(
    (tag) => tag.id,
  )
  const [tagIds, setTagIds] = React.useState(originalTagIds)

  const onSubmit = async () => {
    console.log('not yet implemented')
  }

  return (
    <Box display="flex" flexDirection="column" gap="1rem">
      <MultiSelect
        label={t('common:studyTracks')}
        value={tagIds}
        options={tags.map((t) => ({
          id: t.id,
          label: getLanguageValue(t.name, language),
        }))}
        onChange={setTagIds}
      />
      <Button onClick={onSubmit}>SAVE</Button>
    </Box>
  )
}

const FeedbackTargetDrawer = ({
  feedbackTarget,
  onClose,
  language,
  t,
  organisation,
}) => (
  <Drawer
    open={Boolean(feedbackTarget)}
    onClose={onClose}
    anchor="right"
    variant="persistent"
    elevation={3}
  >
    {feedbackTarget && (
      <Box mr={2} width="35rem">
        <Box display="flex">
          <ButtonBase
            onClick={onClose}
            sx={{
              height: '100vh',
              padding: '0.5rem',
              '&:hover': { backgroundColor: '#fafafa' },
            }}
            disableRipple
          >
            <ChevronRight color="primary" />
          </ButtonBase>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Toolbar />
            <Box mb={2} m={3}>
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
              {feedbackTarget.isMoocCourse && (
                <Box>
                  <Chip label="mooc" />
                </Box>
              )}
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
                  {new Date(feedbackTarget.opensAt).toLocaleDateString(
                    language,
                  )}{' '}
                  -{' '}
                  {new Date(feedbackTarget.closesAt).toLocaleDateString(
                    language,
                  )}
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
              <Box mt={3}>
                <Typography variant="subtitle1">
                  {t('common:studyTracks')}
                </Typography>
              </Box>
              <Box mt={0.5}>
                <TagSelector
                  feedbackTarget={feedbackTarget}
                  t={t}
                  language={language}
                  tags={organisation.tags}
                />
              </Box>
              <Box
                mt={3}
                sx={{ color: (theme) => theme.palette.text.secondary }}
              >
                {t('teacherView:feedbackCount', {
                  count: feedbackTarget.feedbackCount,
                  totalCount: feedbackTarget.studentCount,
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    )}
  </Drawer>
)

const FeedbackTargetItem = ({ code, name, onClick, selected, special }) => (
  <Box m="0.2rem" zIndex={selected ? 1 : 0}>
    <ButtonBase
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Paper
        elevation={selected ? 8 : 4}
        sx={[
          styles.item,
          special && styles.specialItem,
          selected && styles.selectedItem,
        ]}
      >
        <Box
          m="0.2rem"
          mx="0.6rem"
          fontSize="16px"
          display="flex"
          alignItems="center"
        >
          <Typography color="textSecondary">{code}</Typography>
          <Box mr="0.5rem" />
          {name}
        </Box>
      </Paper>
    </ButtonBase>
  </Box>
)

const Filters = ({ onChange, value, t, language, organisation }) => {
  const [open, setOpen] = useState(false)
  const { tags } = organisation
  // eslint-disable-next-line no-nested-ternary
  const valueIsActive = (value) => value && value.length !== 0
  const activeCount =
    _.sum(Object.values(value).map((v) => (valueIsActive(v) ? 1 : 0))) - 2 // subtract the 2 date pickers

  return (
    <Box position="sticky" top="0" mb={2} zIndex={1}>
      <Accordion onChange={() => setOpen(!open)}>
        <AccordionSummary sx={styles.filtersHead}>
          <Box display="flex" width="100%" pl={1}>
            {t('organisationSettings:filters')}
            <Box ml={1}>
              {activeCount > 0 ? <Chip label={activeCount} size="small" /> : ''}
            </Box>
            <Box ml="auto">{open ? <ArrowDropDown /> : <Menu />}</Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={styles.filtersContent}>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={1}
            p={1}
            pb={2}
            alignItems="center"
          >
            <TextField
              type="date"
              value={format(value.startDate, 'yyyy-MM-dd')}
              onChange={({ target }) =>
                onChange({ ...value, startDate: new Date(target.value) })
              }
              label={t('organisationSettings:startDate')}
            />
            <TextField
              type="date"
              value={format(value.endDate, 'yyyy-MM-dd')}
              onChange={({ target }) =>
                onChange({ ...value, endDate: new Date(target.value) })
              }
              label={t('organisationSettings:endDate')}
            />
            <TextField
              value={value.teacherQuery}
              onChange={(e) =>
                onChange({ ...value, teacherQuery: e.target.value })
              }
              label={t('organisationSettings:findByTeacher')}
            />
            <TextField
              value={value.courseQuery}
              onChange={(e) =>
                onChange({ ...value, courseQuery: e.target.value })
              }
              label={t('organisationSettings:findByCourseUnit')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.includeWithoutTeachers}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      includeWithoutTeachers: e.target.checked,
                    })
                  }
                />
              }
              label={t('organisationSettings:includeWithoutTeachers')}
            />
            <MultiSelect
              value={value.tags}
              onChange={(tags) => onChange({ ...value, tags })}
              options={tags.map((tag) => ({
                id: tag.id,
                label: getLanguageValue(tag.name, language),
              }))}
              label="Opintosuunta"
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

const toMonth = (date, locale) =>
  new Date(date).toLocaleString(locale, { month: 'short' })

const SemesterOverview = ({ organisation }) => {
  const [opened, setOpened] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: addMonths(new Date(), 12),
    teacherQuery: '',
    courseQuery: '',
    includeWithoutTeachers: false,
    tags: [],
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
        organisation={organisation}
        feedbackTarget={opened}
        onClose={() => setOpened(null)}
        language={i18n.language}
        t={t}
      />
      <Filters
        value={filters}
        onChange={setFilters}
        t={t}
        language={i18n.language}
        organisation={organisation}
      />
      {isLoading && <LoadingProgress />}
      {!isLoading &&
        years.map(([year, months]) => (
          <Box display="flex" key={year}>
            <Box sx={styles.date} mt={1.5}>
              {year}
            </Box>
            <Box>
              {months.map(([firstDayOfMonth, days]) => (
                <Box display="flex" mb={4} key={firstDayOfMonth}>
                  <Box sx={styles.date} mt={1.5}>
                    {toMonth(firstDayOfMonth, i18n.language)}
                  </Box>
                  <Box>
                    {days.map(([startDate, feedbackTargets]) => (
                      <Box key={startDate} display="flex" my={1.5}>
                        <Box sx={styles.date} mr={2}>
                          {format(Date.parse(startDate), 'dd/MM')}
                        </Box>
                        <Box display="flex" flexWrap="wrap">
                          {feedbackTargets.map((fbt) => (
                            <FeedbackTargetItem
                              key={fbt.id}
                              code={fbt.courseUnit.courseCode}
                              name={getLanguageValue(
                                fbt.courseUnit.name,
                                i18n.language,
                              )}
                              onClick={() => setOpened(fbt)}
                              selected={opened?.id === fbt.id}
                              special={fbt.teachers.length === 0}
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
