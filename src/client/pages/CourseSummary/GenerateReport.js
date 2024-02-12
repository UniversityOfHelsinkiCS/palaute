import React from 'react'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Popover,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Download } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import { useSummaryContext } from './context'
import apiClient from '../../util/apiClient'

const GenerateReport = () => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const { dateRange } = useSummaryContext()

  const [includeOrgs, setIncludeOrgs] = React.useState(true)
  const [includeCUs, setIncludeCUs] = React.useState(false)
  const [includeCURs, setIncludeCURs] = React.useState(false)
  const [allTime, setAllTime] = React.useState(false)

  const isValid = includeOrgs || includeCUs || includeCURs

  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async ev => {
    ev.preventDefault()

    setIsLoading(true)

    try {
      const res = await apiClient.get('/course-summaries/export-xlsx', {
        responseType: 'blob',
        params: {
          includeOrgs,
          includeCUs,
          includeCURs,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      })

      const xlsxName = res.headers['content-disposition']?.split('filename=')?.[1]

      const tempLink = document.createElement('a')
      const url = URL.createObjectURL(res.data)
      tempLink.setAttribute('href', url)
      tempLink.setAttribute('download', xlsxName)
      tempLink.click()

      URL.revokeObjectURL(url)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }

    setIsLoading(false)
  }

  return (
    <div>
      <Button variant="outlined" onClick={ev => setAnchorEl(ev.currentTarget)}>
        {t('common:exportXLSX')}
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <form onSubmit={handleSubmit}>
          <FormControl sx={{ p: '1rem' }}>
            <FormLabel id="include-checkbox-group-label">{t('generateReport:selectIncluded')}</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={includeOrgs} />}
                onChange={(_, checked) => setIncludeOrgs(checked)}
                label={t('generateReport:organisations')}
              />
              <FormControlLabel
                control={<Checkbox checked={includeCUs} onChange={(_, checked) => setIncludeCUs(checked)} />}
                label={t('generateReport:courseUnits')}
              />
              <FormControlLabel
                control={<Checkbox checked={includeCURs} onChange={(_, checked) => setIncludeCURs(checked)} />}
                label={t('generateReport:courseRealisations')}
              />
            </FormGroup>
            <FormLabel id="include-timerange-label" sx={{ mt: '1rem' }}>
              {t('generateReport:selectTimeRange')}
            </FormLabel>
            <RadioGroup
              aria-labelledby="include-timerange-label"
              value={allTime}
              onChange={(_, value) => setAllTime(value)}
            >
              <FormControlLabel value={false} control={<Radio />} label={t('generateReport:selectedTime')} />
              <FormControlLabel value control={<Radio />} label={t('generateReport:allTime')} />
            </RadioGroup>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              sx={{ mt: '1rem' }}
              variant="contained"
              endIcon={<Download />}
            >
              {t('common:exportXLSX')}
            </Button>
          </FormControl>
        </form>
      </Popover>
    </div>
  )
}

export default GenerateReport
