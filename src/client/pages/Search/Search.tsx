import React from 'react'
import { useTranslation } from 'react-i18next'
import { format, isValid } from 'date-fns/esm'
import { Alert, Autocomplete, Box, Paper, SxProps, TextField, Theme, Typography, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import type { LocalizedString } from '@common/types/common'
import apiClient from '../../util/apiClient'
import { FeedbackTargetGrouping } from '../../util/feedbackTargetGrouping'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import Title from '../../components/common/Title'
import { getLanguageValue } from '../../util/languageUtils'
import ExternalLink from '../../components/common/ExternalLink'
import { YearSemesterPeriodSelector } from '../../components/common/YearSemesterPeriodSelector'
import { getSemesterRange } from '../../util/semesterUtils'
import useOrganisationsList from '../../hooks/useOrganisationsList'
import useIsMobile from '../../hooks/useIsMobile'

const styles: {
  [key: string]: SxProps<Theme>
} = {
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
}

interface Organisation {
  name: LocalizedString
  code: string
}

const usePublicOrganisationFeedbackTargets = (organisationCodes: string, startDate: string, endDate: string) => {
  const queryKey = ['publicOrganisationFeedbackTargets', organisationCodes, startDate, endDate]
  const queryFn = async () => {
    const { data: feedbackTargets } = await apiClient.get(
      `/feedback-targets/for-organisation/${organisationCodes}/public`,
      {
        params: { startDate, endDate },
      }
    )
    return feedbackTargets
  }

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: organisationCodes.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return { feedbackTargetGrouping: new FeedbackTargetGrouping(feedbackTargets), ...rest }
}

const FeedbackTargetItem = ({ fbt }: { fbt: any }) => {
  const { t, i18n } = useTranslation()

  return (
    <Paper
      sx={{
        p: '0.5rem',
        m: '0.3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        borderRadius: '0.3rem',
      }}
    >
      <Box fontSize="16px" display="flex" alignItems="start" gap={1}>
        <Typography>
          {`${fbt.courseUnit.courseCode}  ${getLanguageValue(fbt.courseUnit.name, i18n.language)}`}
        </Typography>
      </Box>
      <Typography color="textSecondary" fontSize="14px" fontWeight={400}>
        {getLanguageValue(fbt.courseRealisation.name, i18n.language)}
      </Typography>
      <ExternalLink href={t('links:courseRealisationPageStudent', { courseRealisationId: fbt.courseRealisation.id })}>
        {t('search:coursePageLink')}
      </ExternalLink>
    </Paper>
  )
}

const toMonth = (date: string, locale: Intl.LocalesArgument) =>
  new Date(date).toLocaleString(locale, { month: 'short' })

const CalendarViewMobile = ({ feedbackTargetGrouping }: { feedbackTargetGrouping: FeedbackTargetGrouping }) => {
  const { i18n } = useTranslation()

  return (
    <Stack spacing={4} sx={{ mt: '24px' }}>
      {feedbackTargetGrouping.years.map(([year, months]) => (
        <Stack key={year} spacing={1}>
          <Box sx={{ pt: '12px', pb: '12px', pl: '12px', backgroundColor: '#00000014' }}>{year}</Box>
          {months.map(([firstDayOfMonth, days]) => (
            <Stack key={firstDayOfMonth} spacing={2} sx={{ pl: '12px' }}>
              <Box sx={{ ...styles.date, position: 'static', pt: '16px', pb: '12px' }}>
                {toMonth(firstDayOfMonth, i18n.language)}
              </Box>
              {days.map(([startDate, feedbackTargets]) => (
                <Stack key={startDate} spacing={1}>
                  <Box sx={{ ...styles.date, position: 'static' }}>{format(Date.parse(startDate), 'dd/MM')}</Box>
                  <Stack spacing={1}>
                    {feedbackTargets.map(fbt => (
                      <FeedbackTargetItem key={fbt.id} fbt={fbt} />
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  )
}

const CalendarViewPC = ({ feedbackTargetGrouping }: { feedbackTargetGrouping: FeedbackTargetGrouping }) => {
  const { i18n } = useTranslation()

  return (
    <Box sx={{ mt: '1rem' }}>
      {feedbackTargetGrouping.years.map(([year, months]) => (
        <Box display="flex" key={year}>
          <Box sx={[styles.date, styles.year] as SxProps<Theme>} mt={1.5}>
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
                          <FeedbackTargetItem key={fbt.id} fbt={fbt} />
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

const CalendarView = ({
  feedbackTargetGrouping,
  isMobile,
}: {
  feedbackTargetGrouping: FeedbackTargetGrouping
  isMobile: boolean
}) => {
  if (isMobile) {
    return <CalendarViewMobile feedbackTargetGrouping={feedbackTargetGrouping} />
  }

  return <CalendarViewPC feedbackTargetGrouping={feedbackTargetGrouping} />
}

type DateRange = { start: Date; end: Date }

const Search = () => {
  const { t, i18n } = useTranslation()
  const isMobile = useIsMobile()
  const { organisationsList, isLoading: isOrganisationsLoading } = useOrganisationsList()
  const [searchParams, setSearchParams] = useURLSearchParams()
  const [searchedName, setSearchedName] = React.useState<string>('')
  const [codes, setCodes] = React.useState<string[]>(() => {
    const codesFromParams = searchParams.get('codes')
    return codesFromParams ? codesFromParams.split(',') : []
  })

  const [option, setOption] = React.useState<string>(searchParams.get('option') ?? 'semester')
  const [dateRange, setDateRange] = React.useState<DateRange>(() => {
    // Converting to string is important, params.get may return 0 which would take us to the 70s
    const start = new Date(String(searchParams.get('startDate')))
    const end = new Date(String(searchParams.get('endDate')))

    return isValid(start) && isValid(end) ? { start, end } : getSemesterRange(new Date())
  })

  const selectedValues = React.useMemo(
    () => (organisationsList ?? []).filter((org: Organisation) => codes.includes(org.code)),
    [organisationsList, codes]
  )

  const updateDateRangeQS = (newDateRange: DateRange) => {
    setDateRange(newDateRange)
    if (isValid(newDateRange.start) && isValid(newDateRange.end)) {
      searchParams.set('startDate', format(newDateRange.start, 'yyyy-MM-dd'))
      searchParams.set('endDate', format(newDateRange.end, 'yyyy-MM-dd'))
      setSearchParams(searchParams)
    }
  }

  const { feedbackTargetGrouping, isLoading } = usePublicOrganisationFeedbackTargets(
    codes.join(','),
    dateRange.start.toISOString(),
    dateRange.end.toISOString()
  )

  const handleCodesChange = (_: React.SyntheticEvent, selectedOptions: Organisation[]) => {
    const newCodes = selectedOptions.map(op => op.code)
    setCodes(newCodes)

    const next = new URLSearchParams(searchParams)
    if (newCodes.length > 0) {
      next.set('codes', newCodes.join(','))
    } else {
      next.delete('codes')
    }
    setSearchParams(next)
  }

  return (
    <>
      <Title>{t('search:title')}</Title>
      <Box sx={{ mb: '2rem' }} display="flex" flexWrap="wrap" alignItems="end" gap="1rem">
        <Typography variant="h4" component="h1">
          {t('search:title')}
        </Typography>
      </Box>
      {!isOrganisationsLoading && (
        <Autocomplete
          multiple
          data-cy="search-input"
          id="search"
          fullWidth
          value={selectedValues}
          onChange={handleCodesChange}
          inputValue={searchedName}
          onInputChange={(_, v) => setSearchedName(v)}
          options={organisationsList ?? []}
          getOptionLabel={(org: Organisation) => `${org.code} ${getLanguageValue(org.name, i18n.language)}`}
          getOptionDisabled={op => selectedValues.some((v: Organisation) => v.code === op.code)}
          isOptionEqualToValue={(op, value) => op.code === value.code}
          renderInput={params => (
            <TextField
              {...params}
              slotProps={{
                htmlInput: {
                  ...params.inputProps,
                  'data-cy': 'formik-search-input',
                },
              }}
              label={t('search:searchField')}
            />
          )}
          noOptionsText={t('search:noOptions')}
          loading={isOrganisationsLoading}
          sx={{ mb: isMobile ? '12px' : '6px' }}
        />
      )}
      <YearSemesterPeriodSelector
        value={dateRange}
        onChange={updateDateRangeQS}
        futureYears={1}
        option={option}
        setOption={newOption => {
          searchParams.set('option', newOption)
          setSearchParams(searchParams)
          setOption(newOption)
        }}
        allowAll={false}
      />
      {!isLoading &&
        (codes.length > 0 && feedbackTargetGrouping.years.length === 0 ? (
          <Alert severity="info" data-cy="no-courses-alert">
            {t('search:noCourses')}
          </Alert>
        ) : (
          <CalendarView feedbackTargetGrouping={feedbackTargetGrouping} isMobile={isMobile} />
        ))}
    </>
  )
}

export default Search
