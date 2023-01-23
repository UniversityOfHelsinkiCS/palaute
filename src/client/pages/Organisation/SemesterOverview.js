import React from 'react'
import _ from 'lodash'
import {
  Box,
  Link as MuiLink,
  ButtonBase,
  Drawer,
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
  Switch,
  Paper,
  Tooltip,
} from '@mui/material'
import { ArrowDropDown, ChevronRight, Menu } from '@mui/icons-material'
import { useQuery } from 'react-query'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../../components/common/TeacherChip'
import MultiSelect from '../../components/common/MultiSelect'
import { YearSemesterSelector } from '../../components/common/YearSemesterSelector'
import useCourseSummaryAccessInfo from '../../hooks/useCourseSummaryAccessInfo'
import useHistoryState from '../../hooks/useHistoryState'
import { TagChip } from '../../components/common/TagChip'
import useUpdateCourseRealisationTags from './useUpdateCourseRealisationTags'
import TagSelector from './TagSelector'

const SelectionContext = React.createContext([])

class FeedbackTargetGrouping {
  years = []

  constructor(yearGroupedFeedbackTargets) {
    this.years = yearGroupedFeedbackTargets
  }

  filter(fn) {
    const filtered = this.years
      .map(([d, months]) => [
        d,
        months
          .map(([d, days]) => [d, days.map(([d, fbts]) => [d, fbts.filter(fn)]).filter(([, fbts]) => fbts.length > 0)])
          .filter(([, days]) => days.length > 0),
      ])
      .filter(([, months]) => months.length > 0)

    return new FeedbackTargetGrouping(filtered)
  }

  flatMap(fn) {
    const mapFn = typeof fn === 'function' ? fn : x => x
    const mapped = []
    this.forEach(fbt => mapped.push(mapFn(fbt)))
    return mapped
  }

  forEach(fn) {
    for (const year of this.years) {
      for (const month of year[1]) {
        for (const day of month[1]) {
          for (const fbt of day[1]) {
            fn(fbt)
          }
        }
      }
    }
  }
}

const useOrganisationFeedbackTargets = ({ code, filters, language, enabled }) => {
  const deferredFilters = React.useDeferredValue(filters)
  const { startDate, endDate, teacherQuery, courseQuery, tags, includeWithoutTeachers, noTags } = deferredFilters

  const queryKey = ['organisationFeedbackTargets', code, startDate, endDate]

  const queryFn = async () => {
    const { data: feedbackTargets } = await apiClient.get(`/feedback-targets/for-organisation/${code}`, {
      params: { startDate, endDate },
    })

    return feedbackTargets
  }

  const { data: feedbackTargets, ...rest } = useQuery(queryKey, queryFn, {
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const [first, last] = teacherQuery.toLowerCase().split(' ')
  const courseQueryLower = courseQuery.toLowerCase()

  const filterFn = fbt =>
    // if no tags checked, only get stuff with no tags
    (!noTags || fbt.tags.length === 0) &&
    // filter by tag
    (noTags || !tags.length > 0 || fbt.tags.some(tag => tags.includes(tag.id))) &&
    // filter by course name
    (getLanguageValue(fbt.courseUnit.name, language).toLowerCase().includes(courseQueryLower) ||
      // filter by code
      fbt.courseUnit.courseCode.toLowerCase().includes(courseQueryLower)) &&
    // if teacher name query not empty, filter by teachers
    ((!first && !last) ||
      fbt.teachers.some(u => {
        const firstName = u.firstName.toLowerCase()
        const lastName = u.lastName.toLowerCase()
        return last
          ? firstName.startsWith(first) && lastName.startsWith(last)
          : firstName.startsWith(first) || lastName.startsWith(first)
      })) &&
    // if includeWithoutTeachers, skip checking that there are teachers
    (includeWithoutTeachers || fbt.teachers.length > 0)

  const filter = feedbackTargets => {
    if (!feedbackTargets || rest.isLoading || rest.isFetching) return null
    const filteredTargets = new FeedbackTargetGrouping(feedbackTargets).filter(filterFn)
    return filteredTargets
  }

  const filteredTargets = React.useMemo(
    () => filter(feedbackTargets),
    [courseQuery, teacherQuery, includeWithoutTeachers, noTags, tags, rest.dataUpdatedAt]
  )

  return { feedbackTargets: filteredTargets, ...rest }
}

const styles = {
  date: {
    position: 'sticky',
    top: '4rem',
    height: '1rem',
    minWidth: '5rem',
    textTransform: 'capitalize',
    color: theme => theme.palette.text.secondary,
    fontSize: '16px',
  },
  item: {
    textTransform: 'none',
    fontWeight: 'inherit',
    padding: 0,
    backgroundColor: 'white',
    borderRadius: '3px',
    '&:hover': {
      color: theme => theme.palette.primary.main,
      backgroundColor: 'white',
    },
  },
  specialItem: {
    background: theme => theme.palette.action.disabled,
  },
  selectedItem: {
    color: theme => theme.palette.primary.main,
    outline: theme => `${theme.palette.info.light} solid 3px`,
  },
  filtersHead: {
    color: theme => theme.palette.text.secondary,
  },
  filtersContent: {
    background: theme => theme.palette.background.default,
  },
}

const CourseRealisationTagSelector = ({ feedbackTargets, organisation, onClose }) => {
  const mutation = useUpdateCourseRealisationTags()

  const courseRealisationIds = feedbackTargets.map(fbt => fbt.courseRealisation.id)

  const onSubmit = async tagIds => {
    await mutation.mutateAsync({
      organisationCode: organisation.code,
      courseRealisationIds,
      tagIds,
    })
  }

  return (
    <TagSelector
      mutation={onSubmit}
      objectIds={courseRealisationIds}
      originalTagIds={_.uniq(
        feedbackTargets.flatMap(fbt => fbt.tags.filter(t => t.from === 'courseRealisation').map(t => t.id))
      )}
      tags={organisation.tags}
      onClose={onClose}
    />
  )
}

const CourseUnitTagInfo = ({ feedbackTarget, t, language }) => {
  const cuTags = feedbackTarget.tags.filter(t => t.from === 'courseUnit')

  return (
    <Box mt={6}>
      {cuTags.length > 0 && (
        <>
          <Typography variant="body1">
            {t('organisationSettings:courseUnitTagInfo', {
              count: cuTags.length,
              code: feedbackTarget.courseUnit.courseCode,
            })}
            :
          </Typography>
          <Box mt={1} display="flex" flexWrap="wrap">
            {cuTags.map(t => (
              <TagChip key={t.id} tag={t} language={language} />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}

const FeedbackTargetDetails = ({ feedbackTarget, language, t, organisation, onClose }) => (
  <Box>
    <Toolbar />
    <Box mb={2} m={3}>
      <Box display="flex" alignItems="center">
        <Typography variant="h6">{getLanguageValue(feedbackTarget.courseUnit.name, language)}</Typography>
        <Box mr={1} />
        <Typography>{feedbackTarget.courseUnit.courseCode}</Typography>
      </Box>
      <Box mb={1}>
        <MuiLink component={Link} to={`/targets/${feedbackTarget.id}`}>
          {getLanguageValue(feedbackTarget.courseRealisation.name, language)}
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
          <Box minWidth="9rem" sx={{ color: theme => theme.palette.text.secondary }}>
            {t('feedbackTargetView:coursePeriod')}:
          </Box>
          {new Date(feedbackTarget.courseRealisation.startDate).toLocaleDateString(language)} -{' '}
          {new Date(feedbackTarget.courseRealisation.endDate).toLocaleDateString(language)}
        </Box>
        <Box display="flex" mt={0.5}>
          <Box minWidth="9rem" sx={{ color: theme => theme.palette.text.secondary }}>
            {t('feedbackTargetView:feedbackPeriod')}:
          </Box>
          {new Date(feedbackTarget.opensAt).toLocaleDateString(language)} -{' '}
          {new Date(feedbackTarget.closesAt).toLocaleDateString(language)}
        </Box>
      </Box>
      <Box mt={5} sx={{ color: theme => theme.palette.text.secondary }}>
        {t('teacherView:feedbackCount', {
          count: feedbackTarget.feedbackCount,
          totalCount: feedbackTarget.studentCount,
        })}
      </Box>
      <Box mt={5}>
        <Typography variant="subtitle1">{t('courseSummary:responsibleTeachers')}</Typography>
      </Box>
      <Box mt={1} display="flex" flexWrap="wrap">
        {feedbackTarget.teachers.map(teacher => (
          <TeacherChip user={teacher} key={teacher.id} />
        ))}
      </Box>
      <Box mt={5}>
        <Typography variant="subtitle1">{t('organisationSettings:setStudyTracks')}</Typography>
      </Box>
      <Box mt={2}>
        <CourseRealisationTagSelector
          organisation={organisation}
          feedbackTargets={[feedbackTarget]}
          onClose={onClose}
        />
      </Box>
      <CourseUnitTagInfo feedbackTarget={feedbackTarget} t={t} />
    </Box>
  </Box>
)

const MultiEdit = ({ selected, language, t, organisation }) => (
  <Box width="100%">
    <Toolbar />
    <Box mb={2} m={3}>
      <Typography>{t('organisationSettings:setStudyTracksForSelection')}</Typography>
      <Box m={1.5} />
      <CourseRealisationTagSelector organisation={organisation} feedbackTargets={selected} />
      <Box m={5} />
      <Typography>
        {t('common:currentlySelected')} ({selected.length})
      </Typography>
      <Box m={1.5} />
      {selected.map(fbt => (
        <Box key={fbt.id} my={1}>
          <Paper>
            <Box py={0.5}>
              <FeedbackTargetItem
                code={fbt.courseUnit.courseCode}
                cuName={fbt.courseUnit.name}
                curName={fbt.courseRealisation.name}
                tags={fbt.tags}
                language={language}
              />
            </Box>
          </Paper>
        </Box>
      ))}
    </Box>
  </Box>
)

const SideDrawer = ({ open, editMode, selected, onClose, language, t, organisation }) => (
  // console.log("sidebar renders")
  <Drawer open={open} onClose={onClose} anchor="right" variant="persistent" elevation={3}>
    <Box mr={2} width="35rem">
      <Box display="flex" minHeight="100vh">
        <ButtonBase
          onClick={onClose}
          sx={{
            height: 'full',
            padding: '0.5rem',
            '&:hover': { backgroundColor: '#fafafa' },
          }}
          disableRipple
        >
          <ChevronRight color="primary" />
        </ButtonBase>
        <Divider orientation="vertical" flexItem />
        {!editMode && selected[0] ? (
          <FeedbackTargetDetails
            feedbackTarget={selected[0]}
            t={t}
            language={language}
            organisation={organisation}
            onClose={onClose}
          />
        ) : (
          <MultiEdit organisation={organisation} selected={selected} t={t} language={language} onClose={onClose} />
        )}
      </Box>
    </Box>
  </Drawer>
)

/**
 * This may seem stupid, but massively improves rendering performance when selection changes,
 * by using memoized versions of unchanged list items.
 */
const FeedbackTargetButtonProxy = ({ feedbackTarget }) => {
  const { selection, onClick } = React.useContext(SelectionContext)

  const selected = selection.some(fbt => fbt.id === feedbackTarget.id)

  return <FeedbackTargetButton feedbackTarget={feedbackTarget} selected={selected} onClick={onClick} />
}

const FeedbackTargetButton = React.memo(({ feedbackTarget, onClick, selected }) => {
  const { i18n } = useTranslation()

  const code = feedbackTarget.courseUnit.courseCode
  const cuName = feedbackTarget.courseUnit.name
  const curName = feedbackTarget.courseRealisation.name
  const { tags } = feedbackTarget
  const special = feedbackTarget.teachers.length === 0
  // console.log("Item renders")
  return (
    <Box m="0.3rem">
      <Button
        variant="contained"
        color="inherit"
        onClick={e => {
          e.stopPropagation()
          onClick(feedbackTarget)
        }}
        sx={[styles.item, special && styles.specialItem, selected && styles.selectedItem]}
      >
        <FeedbackTargetItem code={code} cuName={cuName} curName={curName} tags={tags} language={i18n.language} />
      </Button>
    </Box>
  )
})

const FeedbackTargetItem = ({ code, cuName, curName, tags, language }) => (
  <Tooltip title={getLanguageValue(curName, language)} placement="top" disableInteractive>
    <Box m="0.3rem" mx="0.6rem" fontSize="16px" display="flex" alignItems="start">
      <Typography color="textSecondary">{code}</Typography>
      <Box mr="0.5rem" />
      <Typography fontWeight={350}>{getLanguageValue(cuName, language)}</Typography>
      <Box mr="0.3rem" />
      {tags
        .filter(t => t.from === 'courseUnit')
        .map(tag => (
          <TagChip key={tag.id} tag={tag} prefix={`${code}: `} language={language} compact />
        ))}
      {tags
        .filter(t => t.from === 'courseRealisation')
        .map(tag => (
          <TagChip key={tag.id} tag={tag} language={language} compact />
        ))}
    </Box>
  </Tooltip>
)

const Filters = React.memo(({ onChange, value, organisation }) => {
  const { t, i18n } = useTranslation()
  // console.log("Filters render")
  const [open, setOpen] = React.useState(false)
  const [timeOption, setTimeOption] = useHistoryState('overviewTimeperiodOption', 'year')

  const tags = organisation.tags.map(tag => ({
    hash: tag.hash,
    id: tag.id,
    label: getLanguageValue(tag.name, i18n.language),
  }))

  const valueIsActive = value => value && value.length !== 0
  const activeCount = _.sum(Object.values(value).map(v => (valueIsActive(v) ? 1 : 0))) - 2 // subtract the 2 date pickers

  return (
    <Box position="sticky" top="0" mb={2} zIndex={1}>
      <Accordion onChange={() => setOpen(!open)} disableGutters>
        <AccordionSummary sx={styles.filtersHead}>
          <Box display="flex" width="100%" alignItems="center" pl={1}>
            {t('organisationSettings:filters')}
            <Box mx={2}>{activeCount > 0 ? <Chip label={activeCount} size="small" /> : ''}</Box>
            <YearSemesterSelector
              value={{ start: value.startDate, end: value.endDate }}
              option={timeOption}
              onChange={v => onChange({ ...value, startDate: v.start, endDate: v.end })}
              setOption={setTimeOption}
            />
            <Box ml="auto">{open ? <ArrowDropDown /> : <Menu />}</Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={styles.filtersContent}>
          <Box display="flex" flexWrap="wrap" gap={1} p={1} pb={2} alignItems="center">
            <TextField
              value={value.teacherQuery}
              onChange={e => onChange({ ...value, teacherQuery: e.target.value })}
              label={t('organisationSettings:findByTeacher')}
            />
            <TextField
              value={value.courseQuery}
              onChange={e => onChange({ ...value, courseQuery: e.target.value })}
              label={t('organisationSettings:findByCourseUnit')}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.includeWithoutTeachers}
                  onChange={e =>
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
              colors
              onChange={tags => onChange({ ...value, tags })}
              options={tags}
              label="Opintosuunta"
              disabled={value.noTags}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={value.noTags}
                  onChange={e =>
                    onChange({
                      ...value,
                      noTags: e.target.checked,
                    })
                  }
                />
              }
              label={t('organisationSettings:noTags')}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
})

const toMonth = (date, locale) => new Date(date).toLocaleString(locale, { month: 'short' })

const CalendarView = React.memo(({ feedbackTargets }) => {
  const { i18n } = useTranslation()
  // console.log("list renders")
  return (
    <>
      {feedbackTargets.years.map(([year, months]) => (
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
                        {feedbackTargets.map(fbt => (
                          <FeedbackTargetButtonProxy key={fbt.id} feedbackTarget={fbt} />
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
    </>
  )
})

const ListView = React.memo(({ feedbackTargets }) => {
  const flatFeedbackTargets = React.useMemo(
    () => _.orderBy(feedbackTargets?.flatMap(), fbt => fbt.courseUnit.courseCode),
    [feedbackTargets]
  )
  // console.log("list renders")
  return (
    <Box my={1.5}>
      {flatFeedbackTargets.map(fbt => (
        <Box key={fbt.id} my={1}>
          <FeedbackTargetButtonProxy feedbackTarget={fbt} />
        </Box>
      ))}
    </Box>
  )
})

const SemesterOverview = ({ organisation }) => {
  const [viewMode, setViewMode] = React.useState('list')

  /**
   * This is a ref because we want to memoize onFeedbackTargetClick as much as possible. That way we dont need to re-render the list when the selection changes,
   * but the onClick function still works correctly
   */
  const selected = React.useRef([])
  /**
   * This state is needed to re-render the sidebar when selection changes.
   */
  const [sidebarContent, setSidebarContent] = React.useState([])

  // Same goes here...
  const editMode = React.useRef(false)
  const [sidebarEditMode, setSidebarEditMode] = React.useState(false)

  const [filters, setFilters] = React.useState({
    startDate: null,
    endDate: null,
    teacherQuery: '',
    courseQuery: '',
    includeWithoutTeachers: false,
    noTags: false,
    tags: [],
  })

  const { courseSummaryAccessInfo, isLoading: defaultDatesLoading } = useCourseSummaryAccessInfo()

  React.useEffect(() => {
    if (!courseSummaryAccessInfo?.defaultDateRange) return
    const { startDate, endDate } = courseSummaryAccessInfo.defaultDateRange
    setFilters({
      ...filters,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    })
  }, [defaultDatesLoading])

  const onFeedbackTargetClick = React.useCallback(feedbackTarget => {
    React.startTransition(() => {
      if (editMode.current) {
        if (selected.current.includes(feedbackTarget)) {
          selected.current = selected.current.filter(f => f.id !== feedbackTarget.id)
        } else {
          selected.current = selected.current.concat(feedbackTarget)
        }
      } else {
        selected.current = [feedbackTarget]
      }
      setSidebarContent(selected.current)
    })
  }, []) // Zero deps!

  const toggleEditMode = React.useCallback(() => {
    React.startTransition(() => {
      if (editMode.current) {
        selected.current = []
        editMode.current = false
        setSidebarEditMode(false)
        setSidebarContent([])
      } else {
        editMode.current = true
        setSidebarEditMode(true)
      }
    })
  }, []) // And another one

  const toggleViewMode = () => {
    React.startTransition(() => {
      if (viewMode === 'calendar') {
        setViewMode('list')
      } else {
        setViewMode('calendar')
      }
    })
  }

  const onClose = React.useCallback(() => {
    React.startTransition(() => {
      selected.current = []
      setSidebarContent([])
      editMode.current = false
      setSidebarEditMode(false)
    })
  }, []) // And again

  const { code } = useParams()
  const { t, i18n } = useTranslation()

  const { feedbackTargets, isLoading: feedbackTargetsLoading } = useOrganisationFeedbackTargets({
    code,
    filters,
    enabled: filters.startDate !== null,
    refetchOnFocus: false,
  })

  const isLoading = defaultDatesLoading || feedbackTargetsLoading

  // when data changes, object references in state have to be updated. Sucx
  React.useEffect(() => {
    if (!feedbackTargets) return
    const newSelected = []
    feedbackTargets.forEach(fbt => {
      if (selected.current.some(f => f.id === fbt.id)) newSelected.push(fbt)
    })
    selected.current = newSelected
    setSidebarContent(newSelected)
  }, [feedbackTargets])

  // console.log("SemesterOverview")

  const contextValue = React.useMemo(
    () =>
      // console.log("CONTEXT UPDATE")
      ({
        selection: selected.current,
        onClick: onFeedbackTargetClick,
      }),
    [selected.current, onFeedbackTargetClick]
  )

  return (
    <SelectionContext.Provider value={contextValue}>
      <SideDrawer
        open={sidebarContent.length > 0}
        organisation={organisation}
        selected={sidebarContent}
        editMode={sidebarEditMode}
        onClose={onClose}
        language={i18n.language}
        t={t}
      />
      <Filters value={filters} onChange={setFilters} t={t} language={i18n.language} organisation={organisation} />
      <Box display="flex">
        <FormControlLabel
          control={<Switch checked={sidebarEditMode} onChange={toggleEditMode} />}
          label={t('organisationSettings:editMode')}
        />
        <Button onClick={toggleViewMode}>
          {viewMode === 'calendar' ? t('organisationSettings:listMode') : t('organisationSettings:calendarMode')}
        </Button>
      </Box>
      <Box minWidth="35rem" maxWidth="70vw">
        {isLoading && <LoadingProgress />}
        {!isLoading && viewMode === 'calendar' && (
          <CalendarView feedbackTargets={feedbackTargets} onClick={onFeedbackTargetClick} />
        )}
        {!isLoading && viewMode === 'list' && (
          <ListView feedbackTargets={feedbackTargets} onClick={onFeedbackTargetClick} />
        )}
      </Box>
    </SelectionContext.Provider>
  )
}

export default SemesterOverview
