import React from 'react'
import { useTranslation } from 'react-i18next'
import { format, isValid } from 'date-fns/esm'
import { Alert, Autocomplete, Box, Paper, SxProps, TextField, Theme, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../util/apiClient'
import { FeedbackTargetGrouping } from '../../util/feedbackTargetGrouping'
import useURLSearchParams from '../../hooks/useURLSearchParams'
import Title from '../../components/common/Title'
import { getLanguageValue } from '../../util/languageUtils'
import ExternalLink from '../../components/common/ExternalLink'
import { YearSemesterSelector } from '../../components/common/YearSemesterSelector'
import { getSemesterRange } from '../../util/semesterUtils'
import useOrganisationsList from '../../hooks/useOrganisationsList'

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

const usePublicOrganisationFeedbackTargets = (organisationCode: string | null, startDate: string, endDate: string) => {
  const queryKey = ['publicOrganisationFeedbackTargets', organisationCode, startDate, endDate]
  const queryFn = async () => {
    const { data: feedbackTargets } = await apiClient.get(
      `/feedback-targets/for-organisation/${organisationCode}/public`,
      {
        params: { startDate, endDate },
      }
    )
    return feedbackTargets
  }

  const { data: feedbackTargets, ...rest } = useQuery({
    queryKey,
    queryFn,
    enabled: !!organisationCode,
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
        <Typography color="textSecondary">{fbt.courseUnit.courseCode}</Typography>
        <Typography fontWeight={400}>{getLanguageValue(fbt.courseUnit.name, i18n.language)}</Typography>
        <ExternalLink href={t('links:courseRealisationPageStudent', { courseRealisationId: fbt.courseRealisation.id })}>
          {t('search:coursePageLink')}
        </ExternalLink>
      </Box>
      <Typography color="textSecondary" fontSize="14px" fontWeight={400}>
        {getLanguageValue(fbt.courseRealisation.name, i18n.language)}
      </Typography>
    </Paper>
  )
}

const toMonth = (date: string, locale: Intl.LocalesArgument) =>
  new Date(date).toLocaleString(locale, { month: 'short' })

const CalendarView = ({ feedbackTargetGrouping }: { feedbackTargetGrouping: FeedbackTargetGrouping }) => {
  const { i18n } = useTranslation()

  return (
    <>
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
    </>
  )
}

type DateRange = { start: Date; end: Date }

const Search = () => {
  const { t, i18n } = useTranslation()
  const { organisationsList, isLoading: isOrganisationsLoading } = useOrganisationsList()
  const [searchParams, setSearchParams] = useURLSearchParams()
  const [searchedName, setSearchedName] = React.useState<string>('')
  const [code, setCode] = React.useState<string | null>(searchParams.get('code'))
  const [option, setOption] = React.useState<string>(searchParams.get('option') ?? 'semester')

  const [dateRange, setDateRange] = React.useState<DateRange>(() => {
    // Converting to string is important, params.get may return 0 which would take us to the 70s
    const start = new Date(String(searchParams.get('startDate')))
    const end = new Date(String(searchParams.get('endDate')))

    return isValid(start) && isValid(end) ? { start, end } : getSemesterRange(new Date())
  })

  const updateDateRangeQS = (newDateRange: DateRange) => {
    setDateRange(newDateRange)
    if (isValid(newDateRange.start) && isValid(newDateRange.end)) {
      searchParams.set('startDate', format(newDateRange.start, 'yyyy-MM-dd'))
      searchParams.set('endDate', format(newDateRange.end, 'yyyy-MM-dd'))
      setSearchParams(searchParams)
    }
  }

  const { feedbackTargetGrouping, isLoading } = usePublicOrganisationFeedbackTargets(
    code,
    dateRange.start.toISOString(),
    dateRange.end.toISOString()
  )

  return (
    <>
      <Title>{t('search:title')}</Title>
      <Box mb="1rem" display="flex" flexWrap="wrap" alignItems="end" gap="1rem">
        <Typography variant="h4" component="h1">
          {t('search:title')}
        </Typography>
      </Box>
      {!isOrganisationsLoading && (
        <Autocomplete
          data-cy="search-input"
          id="search"
          fullWidth
          defaultValue={null}
          onChange={(_, r: any) => {
            if (r?.code) {
              searchParams.set('code', r.code)
              setCode(r.code)
            } else {
              searchParams.delete('code')
              setCode(null)
            }
            setSearchParams(searchParams)
          }}
          options={organisationsList}
          filterOptions={options =>
            options.filter(o =>
              getLanguageValue(o.name, i18n.language).toLowerCase().includes(searchedName.toLowerCase())
            )
          }
          onInputChange={(e, value) => setSearchedName(value)}
          getOptionLabel={(org: any) => `${org.code} ${getLanguageValue(org.name, i18n.language)}`}
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
        />
      )}
      <YearSemesterSelector
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
        (code && feedbackTargetGrouping.years.length === 0 ? (
          <Alert severity="info" data-cy="no-courses-alert">
            {t('search:noCourses')}
          </Alert>
        ) : (
          <CalendarView feedbackTargetGrouping={feedbackTargetGrouping} />
        ))}
    </>
  )
}

export default Search
