import React from 'react'

import { Box, Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useField } from 'formik'

import OptionEditor from './OptionEditor'
import FormikTextField from '../common/FormikTextField'

const styles = {
  container: theme => ({
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 64px)',
    },
  }),
}

const InfoEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <>
      <Box mb={2}>
        <FormikTextField
          id={`choice-question-${language}-${name}`}
          name={`${name}.data.label.${language}`}
          label={t('questionEditor:label')}
          fullWidth
        />
      </Box>

      <Box mb={2}>
        <FormikTextField
          id={`choice-description-${language}-${name}`}
          name={`${name}.data.description.${language}`}
          label={t('questionEditor:description')}
          helperText={t('questionEditor:descriptionHelper')}
          fullWidth
        />
      </Box>
    </>
  )
}

const GroupingEditor = ({ name, languages = ['fi', 'sv', 'en'] }) => {
  const { i18n } = useTranslation()
  const [field] = useField(name)
  const { value } = field

  console.log(value)

  return (
    <>
      {}
      <Box sx={styles.container}>
        <Grid spacing={4} container>
          {languages.map(language => (
            <Grid md={4} sm={12} xs={12} item key={language}>
              <Box mb={2}>
                <Typography variant="h6" component="h2">
                  {language.toUpperCase()}
                </Typography>
              </Box>

              <InfoEditor name={name} language={language} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={styles.container}>
        <Box mb={2}>
          <Grid spacing={4} container>
            {languages.map(language => {
              const languageT = i18n.getFixedT(language)

              return (
                <Grid xs={4} item key={language}>
                  <Typography variant="h6" component="h3">
                    {languageT('questionEditor:options')}
                  </Typography>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      </Box>

      <OptionEditor name={`${name}.data.options`} languages={languages} />
    </>
  )
}

export default GroupingEditor
