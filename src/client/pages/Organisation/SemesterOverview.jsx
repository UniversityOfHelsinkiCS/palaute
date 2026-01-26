import React from 'react'
import { orderBy, sum, uniq } from 'lodash-es'
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
} from '@mui/material'
import { ArrowDropDown, CalendarTodayOutlined, ChevronRight, Menu, List } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import apiClient from '../../util/apiClient'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../../components/common/TeacherChip'
import MultiSelect from '../../components/common/MultiSelect'
import { YearSemesterPeriodSelector } from '../../components/common/YearSemesterPeriodSelector'
import useHistoryState from '../../hooks/useHistoryState'
import { TagChip } from '../../components/common/TagChip'
import { NorButton } from '../../components/common/NorButton'
import useUpdateCourseRealisationTags from './useUpdateCourseRealisationTags'
import TagSelector from './TagSelector'
import useLocalStorageState from '../../hooks/useLocalStorageState'
import { getYearRange } from '../../util/yearUtils'
import { FeedbackTargetGrouping } from '../../util/feedbackTargetGrouping'
import { getSafeCourseCode } from '../../util/courseIdentifiers'

const SelectionContext = React.createContext({})

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

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const [first, last] = teacherQuery.toLowerCase().split(' ')
  const courseQueryLower = courseQuery.toLowerCase()

  const filterFn = fbt =>
    // if noTags checked, only get stuff with no tags
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
        const firstName = u.firstName?.toLowerCase()
        const lastName = u.lastName?.toLowerCase()
        return last
          ? firstName?.startsWith(first) && lastName?.startsWith(last)
          : firstName?.startsWith(first) || lastName?.startsWith(first)
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
  year: {
    color: theme => theme.palette.text.primary,
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
      originalTagIds={uniq(
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
 * This proxy component may seem stupid, but massively improves rendering performance when selection changes,
 * by using memoized versions of unchanged list items.
 */
const FeedbackTargetButtonProxy = ({ feedbackTarget }) => {
  const { selection, onClick, showCurName } = React.useContext(SelectionContext)

  const selected = selection.some(fbt => fbt.id === feedbackTarget.id)

  return (
    <FeedbackTargetButton
      feedbackTarget={feedbackTarget}
      selected={selected}
      onClick={onClick}
      showCurName={showCurName}
    />
  )
}

const FeedbackTargetButton = React.memo(({ feedbackTarget, onClick, selected, showCurName }) => {
  const { i18n } = useTranslation()

  const code = feedbackTarget.courseUnit.courseCode
  const cuName = feedbackTarget.courseUnit.name
  const curName = feedbackTarget.courseRealisation.name
  const { tags } = feedbackTarget
  const special = feedbackTarget.teachers.length === 0

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
        <FeedbackTargetItem
          code={code}
          cuName={cuName}
          curName={curName}
          showCurName={showCurName}
          tags={tags}
          language={i18n.language}
        />
      </Button>
    </Box>
  )
})

const FeedbackTargetItem = ({ code, cuName, curName, tags, language, showCurName }) => {
  const { t } = useTranslation()
  const safeCourseCode = getSafeCourseCode({ courseCode: code })

  return (
    <Box m="0.3rem" display="flex" flexDirection="column" alignItems="start">
      <Box fontSize="16px" display="flex" alignItems="start" columnGap="0.5rem">
        <Typography color="textSecondary">{code}</Typography>
        <Typography fontWeight={400}>{getLanguageValue(cuName, language)}</Typography>
        <div>
          {tags.map(tag => (
            <TagChip key={tag.id} tag={tag} prefix={`${code}: `} language={language} compact />
          ))}
        </div>
      </Box>
      {showCurName && (
        <Typography color="textSecondary" fontSize="14px" fontWeight={400}>
          {getLanguageValue(curName, language)}
        </Typography>
      )}
      <MuiLink component={Link} to={`/course-summary/course-unit/${safeCourseCode}?option=all`}>
        {t('organisationSettings:allCourseUnitRealisations')}
      </MuiLink>
    </Box>
  )
}

const Filters = React.memo(({ onChange, value, organisation }) => {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [timeOption, setTimeOption] = useHistoryState('overviewTimeperiodOption', 'year')

  const tags = organisation.tags.map(tag => ({
    hash: tag.hash,
    id: tag.id,
    label: getLanguageValue(tag.name, i18n.language),
  }))

  const valueIsActive = value => value && value.length !== 0
  const activeCount = sum(Object.values(value).map(v => (valueIsActive(v) ? 1 : 0))) - 2 // subtract the 2 date pickers

  return (
    <Box position="sticky" top="0" mb={2} zIndex={1}>
      <Accordion onChange={() => setOpen(!open)} disableGutters>
        <AccordionSummary sx={styles.filtersHead}>
          <Box display="flex" width="100%" alignItems="center" pl={1}>
            {t('organisationSettings:filters')}
            <Box mx={2}>{activeCount > 0 ? <Chip label={activeCount} size="small" /> : ''}</Box>
            <YearSemesterPeriodSelector
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

  return (
    <Box>
      {feedbackTargets?.years?.map(([year, months]) => (
        <Box display="flex" key={year}>
          <Box sx={[styles.date, styles.year]} mt={1.5}>
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
    </Box>
  )
})

const ListView = React.memo(({ feedbackTargets }) => {
  const flatFeedbackTargets = orderBy(feedbackTargets?.flatMap(), fbt => fbt.courseUnit.courseCode)

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
  const { code } = useParams()
  const { t, i18n } = useTranslation()

  const [viewMode, setViewMode] = React.useState('list')
  const [showCurName, setShowCurName] = useLocalStorageState('show-cur-names', false)

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

  const studyYearRange = getYearRange(new Date())
  const [filters, setFilters] = React.useState({
    startDate: studyYearRange.start,
    endDate: studyYearRange.end,
    teacherQuery: '',
    courseQuery: '',
    includeWithoutTeachers: false,
    noTags: false,
    tags: [],
  })

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

  const toggleShowCurName = () => {
    React.startTransition(() => {
      setShowCurName(!showCurName)
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

  const { feedbackTargets, isLoading } = useOrganisationFeedbackTargets({
    code,
    filters,
    enabled: filters.startDate !== null,
  })

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

  const contextValue = React.useMemo(
    () => ({
      selection: selected.current,
      onClick: onFeedbackTargetClick,
      showCurName,
    }),
    [selected.current, onFeedbackTargetClick, showCurName]
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
      <Box display="flex" columnGap="0.5rem">
        <FormControlLabel
          control={<Switch checked={sidebarEditMode} onChange={toggleEditMode} />}
          label={t('organisationSettings:editMode')}
        />
        <FormControlLabel
          control={<Switch checked={showCurName} onChange={toggleShowCurName} />}
          label={t('organisationSettings:showCurName')}
        />
        <NorButton
          color="secondary"
          onClick={toggleViewMode}
          icon={viewMode === 'calendar' ? <List /> : <CalendarTodayOutlined />}
        >
          {viewMode === 'calendar' ? t('organisationSettings:listMode') : t('organisationSettings:calendarMode')}
        </NorButton>
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
