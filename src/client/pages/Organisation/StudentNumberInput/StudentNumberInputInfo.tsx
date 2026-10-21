import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Instructions from '../../../components/common/Instructions'

const StudentNumberInputInfo = () => {
  const { t } = useTranslation()

  return (
    <Instructions title={t('organisationSurveys:studentNumberInformation')} dataCyPrefix="formik-student-number-input">
      <ul>
        <li>{t('organisationSurveys:studentNumberDelimeters:comma')}</li>
        <li>{t('organisationSurveys:studentNumberDelimeters:semicolon')}</li>
        <li>{t('organisationSurveys:studentNumberDelimeters:space')}</li>
        <li>{t('organisationSurveys:studentNumberDelimeters:newline')}</li>
      </ul>
      <Typography variant="body2" sx={{ mt: 2 }}>
        {t('organisationSurveys:studentNumberExampleInput')}
      </Typography>
      <Box
        data-cy="formik-student-number-input-example"
        sx={{ background: 'white', maxWidth: 480, p: 1, border: 1, borderRadius: 1 }}
        component="pre"
      >
        010000003;
        <br />
        011000002,
        <br />
        011000090 011000003
      </Box>
    </Instructions>
  )
}

export default StudentNumberInputInfo
