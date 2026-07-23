import { Download, Close } from '@mui/icons-material'
import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Popover,
  Box,
  Typography,
  IconButton,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { NorButton } from '../../components/common/NorButton'
import { optionFocusIndicatorStyle, focusIndicatorStyle } from '../../util/accessibility'
import apiClient from '../../util/apiClient'
import { useSummaryContext } from './context'

const checkBoxStyle = {
  ml: 1,
  pr: 1,
  ...optionFocusIndicatorStyle(),
}

const GenerateReport = ({ organisationId }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const closeButtonRef = React.useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation()
  const { dateRange } = useSummaryContext()

  const [includeOrgs, setIncludeOrgs] = React.useState(true)
  const [includeCUs, setIncludeCUs] = React.useState(false)
  const [includeCURs, setIncludeCURs] = React.useState(false)
  const isValid = includeOrgs || includeCUs || includeCURs
  const open = Boolean(anchorEl)

  const popoverId = open ? 'export-xlsx-popover' : undefined
  const labelId = 'select-content-label'
  const errorId = 'select-content-error'

  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setTimeout(() => closeButtonRef.current?.focus(), 0)
    }
  }, [open])

  const handleClose = () => {
    setAnchorEl(null)
  }

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
          organisationId,
        },
      })

      const xlsxName = res.headers['content-disposition']?.split('filename=')?.[1]

      const tempLink = document.createElement('a')
      const url = URL.createObjectURL(res.data)
      tempLink.setAttribute('href', url)
      tempLink.setAttribute('download', xlsxName)
      tempLink.click()

      URL.revokeObjectURL(url)
      closeButtonRef.current?.focus()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      enqueueSnackbar(t('common:unknownError'), { variant: 'error' })
    }

    setIsLoading(false)
  }

  return (
    <Box>
      <NorButton
        color="secondary"
        onClick={ev => setAnchorEl(ev.currentTarget)}
        icon={<Download />}
        sx={{ p: 1 }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
      >
        {t('common:exportXLSX')}
      </NorButton>
      <Popover
        id={popoverId}
        role="dialog"
        aria-labelledby={labelId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: '1rem' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'top', mb: 1.5 }}>
            <IconButton
              ref={closeButtonRef}
              size="small"
              onClick={handleClose}
              aria-label={t('common:close')}
              sx={{ ml: 1, ...focusIndicatorStyle() }}
              disableFocusRipple
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <form onSubmit={handleSubmit}>
            <FormControl component="fieldset" aria-describedby={!isValid ? errorId : undefined}>
              <FormLabel component="legend" id={labelId} sx={{ color: 'primary.main' }}>
                {t('generateReport:selectIncluded')}
              </FormLabel>
              <FormGroup aria-labelledby={labelId}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeOrgs}
                      onChange={(_, checked) => setIncludeOrgs(checked)}
                      disableFocusRipple
                    />
                  }
                  label={t('generateReport:organisations')}
                  sx={{ my: 1, ...checkBoxStyle }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeCUs}
                      onChange={(_, checked) => setIncludeCUs(checked)}
                      disableFocusRipple
                    />
                  }
                  label={t('generateReport:courseUnits')}
                  sx={{ mb: 1, ...checkBoxStyle }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeCURs}
                      onChange={(_, checked) => setIncludeCURs(checked)}
                      disableFocusRipple
                    />
                  }
                  label={t('generateReport:courseRealisations')}
                  sx={checkBoxStyle}
                />
              </FormGroup>
              {!isValid && (
                <Typography id={errorId} variant="body2" role="alert" sx={{ mt: 1, color: 'error.main' }}>
                  {t('generateReport:atLeastOneRequired')}
                </Typography>
              )}
              <NorButton
                data-cy="export-xlsx-submit"
                color="primary"
                type="submit"
                disabled={!isValid || isLoading}
                sx={{ mt: '1rem' }}
                icon={isLoading ? <CircularProgress sx={{ color: 'primary.main' }} size={16} /> : <Download />}
              >
                {isLoading ? t('generateReport:exporting') : t('common:exportXLSX')}
              </NorButton>
            </FormControl>
          </form>
        </Box>
      </Popover>
    </Box>
  )
}

export default GenerateReport
