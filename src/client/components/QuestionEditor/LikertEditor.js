import React from 'react'
import { Box, Grid, Typography } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../FormikTextField'

const LanguageLikertEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <>
      <Box mb={2}>
        <FormikTextField
          id={`likert-question-${language}-${name}`}
          name={`${name}.data.label.${language}`}
          label={t('questionEditor:label')}
          fullWidth
        />
      </Box>

      <FormikTextField
        id={`likert-description-${language}-${name}`}
        name={`${name}.data.description.${language}`}
        label={t('questionEditor:description')}
        helperText={t('questionEditor:descriptionHelper')}
        fullWidth
      />
    </>
  )
}

const LikertEditor = ({ name, languages = ['fi', 'sv', 'en'] }) => (
  <Grid spacing={4} container>
    {languages.map((language) => (
      <Grid md={4} sm={12} xs={12} item key={language}>
        <Box mb={2}>
          <Typography variant="h6" as="h2">
            {language.toUpperCase()}
          </Typography>
        </Box>

        <LanguageLikertEditor name={name} language={language} />
      </Grid>
    ))}
  </Grid>
)

export default LikertEditor
