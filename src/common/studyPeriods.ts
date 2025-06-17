// Start dates are the official start dates of periods
// Where necessary, end dates are modified to be one day before the next period starts to avoid courses falling between periods
// Summer period starts one day after IV period exam week ends and ends one day before I period starts

const studyPeriods = {
  years: [
    {
      start_year: 2020,
      end_year: 2021,
      periods: [
        // {
        //   name: 'I',
        //   start_date: '31.8.2020',
        //   end_date: '25.10.2020'
        // },
        // {
        //   name: 'II',
        //   start_date: '26.10.2020',
        //   end_date: '17.1.2021',
        // },
        {
          name: 'III',
          start_date: '18.1.2021',
          end_date: '14.3.2021',
        },
        {
          name: 'IV',
          start_date: '15.3.2021',
          end_date: '16.5.2021',
        },
        {
          name: 'Summer',
          start_date: '17.5.2021',
          end_date: '5.9.2021',
        },
      ],
    },
    {
      start_year: 2021,
      end_year: 2022,
      periods: [
        {
          name: 'I',
          start_date: '6.9.2021',
          end_date: '31.10.2021',
        },
        {
          name: 'II',
          start_date: '1.11.2021',
          end_date: '16.1.2022',
        },
        {
          name: 'III',
          start_date: '17.1.2022',
          end_date: '13.3.2022',
        },
        {
          name: 'IV',
          start_date: '14.3.2022',
          end_date: '15.5.2022',
        },
        {
          name: 'Summer',
          start_date: '16.5.2022',
          end_date: '4.9.2022',
        },
      ],
    },
    {
      start_year: 2022,
      end_year: 2023,
      periods: [
        {
          name: 'I',
          start_date: '5.9.2022',
          end_date: '30.10.2022',
        },
        {
          name: 'II',
          start_date: '31.10.2022',
          end_date: '15.1.2023',
        },
        {
          name: 'III',
          start_date: '16.1.2023',
          end_date: '12.3.2023',
        },
        {
          name: 'IV',
          start_date: '13.3.2023',
          end_date: '14.5.2023',
        },
        {
          name: 'Summer',
          start_date: '15.5.2023',
          end_date: '3.9.2023',
        },
      ],
    },
    {
      start_year: 2023,
      end_year: 2024,
      periods: [
        {
          name: 'I',
          start_date: '4.9.2023',
          end_date: '29.10.2023',
        },
        {
          name: 'II',
          start_date: '30.10.2023',
          end_date: '14.1.2024',
        },
        {
          name: 'III',
          start_date: '15.1.2024',
          end_date: '10.3.2024',
        },
        {
          name: 'IV',
          start_date: '11.3.2024',
          end_date: '12.5.2024',
        },
        {
          name: 'Summer',
          start_date: '13.5.2024',
          end_date: '1.9.2024',
        },
      ],
    },
    {
      start_year: 2024,
      end_year: 2025,
      periods: [
        {
          name: 'I',
          start_date: '2.9.2024',
          end_date: '27.10.2024',
        },
        {
          name: 'II',
          start_date: '28.10.2024',
          end_date: '12.1.2025',
        },
        {
          name: 'III',
          start_date: '13.1.2025',
          end_date: '9.3.2025',
        },
        {
          name: 'IV',
          start_date: '10.3.2025',
          end_date: '11.5.2025',
        },
        {
          name: 'Summer',
          start_date: '12.5.2025',
          end_date: '31.8.2025',
        },
      ],
    },
    {
      start_year: 2025,
      end_year: 2026,
      periods: [
        {
          name: 'I',
          start_date: '1.9.2025',
          end_date: '26.10.2025',
        },
        {
          name: 'II',
          start_date: '27.10.2025',
          end_date: '11.1.2026',
        },
        {
          name: 'III',
          start_date: '12.1.2026',
          end_date: '8.3.2026',
        },
        {
          name: 'IV',
          start_date: '9.3.2026',
          end_date: '10.5.2026',
        },
        {
          name: 'Summer',
          start_date: '11.5.2026',
          end_date: '30.8.2026',
        },
      ],
    },
    {
      start_year: 2026,
      end_year: 2027,
      periods: [
        {
          name: 'I',
          start_date: '31.8.2026',
          end_date: '25.10.2026',
        },
        {
          name: 'II',
          start_date: '26.10.2026',
          end_date: '17.1.2027',
        },
        {
          name: 'III',
          start_date: '18.1.2027',
          end_date: '14.3.2027',
        },
        {
          name: 'IV',
          start_date: '15.3.2027',
          end_date: '16.5.2027',
        },
        {
          name: 'Summer',
          start_date: '17.5.2027',
          end_date: '5.9.2027',
        },
      ],
    },
    {
      start_year: 2027,
      end_year: 2028,
      periods: [
        {
          name: 'I',
          start_date: '6.9.2027',
          end_date: '31.10.2027',
        },
        {
          name: 'II',
          start_date: '1.11.2027',
          end_date: '16.1.2028',
        },
        {
          name: 'III',
          start_date: '17.1.2028',
          end_date: '12.3.2028',
        },
        {
          name: 'IV',
          start_date: '13.3.2028',
          end_date: '14.5.2028',
        },
        {
          name: 'Summer',
          start_date: '15.5.2028',
          end_date: '3.9.2028',
        },
      ],
    },
    {
      start_year: 2028,
      end_year: 2029,
      periods: [
        {
          name: 'I',
          start_date: '4.9.2028',
          end_date: '29.10.2028',
        },
        {
          name: 'II',
          start_date: '30.10.2028',
          end_date: '14.1.2029',
        },
        {
          name: 'III',
          start_date: '15.1.2029',
          end_date: '11.3.2029',
        },
        {
          name: 'IV',
          start_date: '12.3.2029',
          end_date: '13.5.2029',
        },
        {
          name: 'Summer',
          start_date: '14.5.2029',
          end_date: '2.9.2029',
        },
      ],
    },
    {
      start_year: 2029,
      end_year: 2030,
      periods: [
        {
          name: 'I',
          start_date: '3.9.2029',
          end_date: '28.10.2029',
        },
        {
          name: 'II',
          start_date: '29.10.2029',
          end_date: '13.1.2030',
        },
        {
          name: 'III',
          start_date: '14.1.2030',
          end_date: '10.3.2030',
        },
        {
          name: 'IV',
          start_date: '11.3.2030',
          end_date: '12.5.2030',
        },
        {
          name: 'Summer',
          start_date: '13.5.2030',
          end_date: '1.9.2030',
        },
      ],
    },
    {
      start_year: 2030,
      end_year: 2031,
      periods: [
        {
          name: 'I',
          start_date: '2.9.2030',
          end_date: '27.10.2030',
        },
        {
          name: 'II',
          start_date: '28.10.2030',
          end_date: '12.1.2031',
        },
        {
          name: 'III',
          start_date: '13.1.2031',
          end_date: '9.3.2031',
        },
        {
          name: 'IV',
          start_date: '10.3.2031',
          end_date: '11.5.2031',
        },
        {
          name: 'Summer',
          start_date: '16.5.2031',
          end_date: '31.8.2031',
        },
      ],
    },
    {
      start_year: 2031,
      end_year: 2032,
      periods: [
        {
          name: 'I',
          start_date: '1.9.2031',
          end_date: '26.10.2031',
        },
        {
          name: 'II',
          start_date: '27.10.2031',
          end_date: '11.1.2032',
        },
        {
          name: 'III',
          start_date: '12.1.2032',
          end_date: '7.3.2032',
        },
        {
          name: 'IV',
          start_date: '8.3.2032',
          end_date: '9.5.2032',
        },
        {
          name: 'Summer',
          start_date: '10.5.2032',
          end_date: '30.8.2032',
        },
      ],
    },
  ],
}

export type Period = {
  start: Date
  end: Date
  name?: string
}

const parseDate = (date: string) => {
  const [day, month, year] = date.split('.').map(Number)
  return new Date(year, month - 1, day)
}

export const getAllPeriods = (): Period[] => {
  const periods = studyPeriods.years.flatMap(y => y.periods).reverse()
  const periodsWithParsedDates = periods.map(p => ({
    name: p.name,
    start: parseDate(p.start_date),
    end: parseDate(p.end_date),
  }))

  return periodsWithParsedDates
}

export const getPeriodsUntil = (until: Date): Period[] => {
  const periods = getAllPeriods()
  const pastPeriods = until ? periods.filter(p => p.start <= until) : periods

  return pastPeriods
}

export const getPeriodDates = (until: Date): Period[] => {
  const periods = getPeriodsUntil(until)
  const periodDates = periods.map(p => ({ start: p.start, end: p.end }))

  return periodDates
}
