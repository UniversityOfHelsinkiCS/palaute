import { Grid2 as Grid, Stack } from '@mui/material'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../common/FormikTextField'
import LinkButton from '../common/LinkButton'
import LanguageFieldset from './LanguageFieldset'

const LikertField = ({ name, language, fieldName, labelKey, helperKey, inputRef }) => {
  const { t, i18n } = useTranslation()
  const languageT = i18n.getFixedT(language)

  return (
    <FormikTextField
      id={`likert-${fieldName}-${language}-${name}`}
      name={`${name}.data.${fieldName}.${language}`}
      label={languageT(`questionEditor:${labelKey}`)}
      helperText={helperKey ? languageT(`questionEditor:${helperKey}`) : undefined}
      accessibleLabel={`${t(`questionEditor:${labelKey}`)} ${t(`questionEditor:inLanguage:${language}`)}`}
      accessibleHelperText={helperKey ? t(`questionEditor:${helperKey}`) : undefined}
      fullWidth
      inputRef={inputRef}
    />
  )
}

const ALL_FIELDS = [
  { fieldName: 'label', labelKey: 'label' },
  { fieldName: 'shortLabel', labelKey: 'shortLabel', helperKey: 'shortLabelHelper' },
  { fieldName: 'description', labelKey: 'description', helperKey: 'descriptionHelper' },
]

const LikertEditor = forwardRef((props, ref) => {
  const { t } = useTranslation()
  const { name, languages = ['fi', 'sv', 'en'], editorLevel } = props
  const firstInputRef = useRef(null)

  const showShortLabel = editorLevel === 'programme' || editorLevel === 'university'
  const FIELDS = showShortLabel ? ALL_FIELDS : ALL_FIELDS.filter(field => field.fieldName !== 'shortLabel')

  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      firstInputRef.current?.focus?.()
    },
  }))

  return (
    <Grid columnSpacing={4} rowSpacing={2} container>
      {languages.map((language, languageIndex) => (
        <Grid size={{ xs: 12, md: 4 }} key={language}>
          <LanguageFieldset language={language}>
            <Stack spacing={2}>
              {FIELDS.map((field, fieldIdx) => (
                <LikertField
                  key={field.fieldName}
                  name={name}
                  language={language}
                  fieldName={field.fieldName}
                  labelKey={field.labelKey}
                  helperKey={field.helperKey}
                  inputRef={fieldIdx === 0 && languageIndex === 0 ? firstInputRef : undefined}
                />
              ))}
            </Stack>
          </LanguageFieldset>
        </Grid>
      ))}

      <Grid size={12}>
        <LinkButton title={t('feedbackResponse:markdownLink')} to={t('links:markdownHelp')} external />
      </Grid>
    </Grid>
  )
})

export default LikertEditor
