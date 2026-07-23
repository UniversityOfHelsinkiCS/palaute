import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import useIsMobile from '../../hooks/useIsMobile'
import FormikTextField from '../common/FormikTextField'
import LinkButton from '../common/LinkButton'
import OptionEditor from './OptionEditor'

const styles = {
  container: theme => ({
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 64px)',
    },
  }),
}

const InfoEditor = ({ name, language, inputRef }) => {
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
          inputRef={inputRef}
        />
      </Box>

      <Box>
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

const ChoiceEditor = forwardRef((props, ref) => {
  const { name, languages = ['fi', 'sv', 'en'] } = props
  const { i18n, t } = useTranslation()
  const isMobile = useIsMobile()

  const firstInputRef = useRef(null)
  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      firstInputRef.current?.focus?.()
    },
  }))

  return (
    <>
      <Box sx={styles.container}>
        <Grid rowSpacing={1} columnSpacing={4} container>
          {languages.map((language, idx) => (
            <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
              <Box mb={2}>
                <Typography variant="h6" component="h2">
                  {language.toUpperCase()}
                </Typography>
              </Box>

              <InfoEditor name={name} language={language} inputRef={idx === 0 ? firstInputRef : undefined} />
            </Grid>
          ))}
          <LinkButton title={t('feedbackResponse:markdownLink')} to={t('links:markdownHelp')} external sx={{ mb: 2 }} />
        </Grid>
      </Box>

      <Box sx={styles.container}>
        {!isMobile && (
          <Box mb={2}>
            <Grid spacing={4} container>
              {languages.map(language => {
                const languageT = i18n.getFixedT(language)

                return (
                  <Grid size={4} key={language}>
                    <Typography variant="h6" component="h3">
                      {languageT('questionEditor:options')}
                    </Typography>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        )}
        {isMobile && (
          <Box mb={2}>
            <Typography variant="h6" component="h3">
              {t('questionEditor:options')}
            </Typography>
          </Box>
        )}
      </Box>

      <OptionEditor name={`${name}.data.options`} languages={languages} />
    </>
  )
})

export default ChoiceEditor
