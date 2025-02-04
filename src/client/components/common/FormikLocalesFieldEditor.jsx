import React from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'

import { useTranslation } from 'react-i18next'

import FormikTextField from './FormikTextField'
import { LANGUAGES } from '../../util/common'

const FormikLocalesFieldEditor = ({ name, localesLabelString, languages = LANGUAGES }) => {
  const { i18n } = useTranslation()

  return (
    <>
      {languages.map(language => {
        const t = i18n.getFixedT(language)

        return (
          <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
            <Box mb={2}>
              <Typography variant="h6" component="h2">
                {language.toUpperCase()}
              </Typography>
            </Box>
            <Box mb={2}>
              <FormikTextField
                data-cy={`formik-locales-field-${language}-${name}`}
                id={`locales-field-${language}-${name}`}
                name={`${name}.${language}`}
                label={t(localesLabelString)}
                fullWidth
              />
            </Box>
          </Grid>
        )
      })}
    </>
  )
}

export default FormikLocalesFieldEditor
