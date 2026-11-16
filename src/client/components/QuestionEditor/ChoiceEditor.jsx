import { Box, Grid2 as Grid } from '@mui/material'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../common/FormikTextField'
import LinkButton from '../common/LinkButton'
import LanguageFieldset from './LanguageFieldset'
import OptionEditor from './OptionEditor'

const styles = {
  container: theme => ({
    [theme.breakpoints.up('md')]: {
      width: 'calc(100% - 64px)',
    },
  }),
}

const InfoEditor = ({ name, language, inputRef }) => {
  const { t, i18n } = useTranslation()
  const languageT = i18n.getFixedT(language)
  const inLanguage = t(`questionEditor:inLanguage:${language}`)

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <FormikTextField
          id={`choice-question-${language}-${name}`}
          name={`${name}.data.label.${language}`}
          label={languageT('questionEditor:label')}
          accessibleLabel={`${t('questionEditor:label')} ${inLanguage}`}
          fullWidth
          inputRef={inputRef}
        />
      </Box>

      <Box>
        <FormikTextField
          id={`choice-description-${language}-${name}`}
          name={`${name}.data.description.${language}`}
          label={languageT('questionEditor:description')}
          helperText={languageT('questionEditor:descriptionHelper')}
          accessibleLabel={`${t('questionEditor:description')} ${inLanguage}`}
          accessibleHelperText={t('questionEditor:descriptionHelper')}
          fullWidth
        />
      </Box>
    </>
  )
}

const ChoiceEditor = forwardRef((props, ref) => {
  const { name, languages = ['fi', 'sv', 'en'], showMissingOptionsError } = props
  const { t } = useTranslation()

  const firstInputRef = useRef(null)
  const addOptionButtonRef = useRef(null)
  const firstOptionInputRef = useRef(null)
  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      firstInputRef.current?.focus?.()
    },
    focusMissingOptions: () => {
      ;(firstOptionInputRef.current ?? addOptionButtonRef.current)?.focus()
    },
  }))

  return (
    <>
      <Box sx={styles.container}>
        <Grid rowSpacing={1} columnSpacing={4} container>
          {languages.map((language, idx) => (
            <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
              <LanguageFieldset language={language}>
                <InfoEditor name={name} language={language} inputRef={idx === 0 ? firstInputRef : undefined} />
              </LanguageFieldset>
            </Grid>
          ))}
          <Grid size={12}>
            <LinkButton
              title={t('feedbackResponse:markdownLink')}
              to={t('links:markdownHelp')}
              external
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>
      </Box>

      <OptionEditor
        name={`${name}.data.options`}
        languages={languages}
        addButtonRef={addOptionButtonRef}
        firstOptionInputRef={firstOptionInputRef}
        showMissingOptionsError={showMissingOptionsError}
      />
    </>
  )
})

export default ChoiceEditor
