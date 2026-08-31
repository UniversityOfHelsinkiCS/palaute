import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import FormikTextField from '../common/FormikTextField'
import LinkButton from '../common/LinkButton'

const LikertField = ({ name, language, fieldName, labelKey, helperKey, inputRef }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  return (
    <FormikTextField
      id={`likert-${fieldName}-${language}-${name}`}
      name={`${name}.data.${fieldName}.${language}`}
      label={t(`questionEditor:${labelKey}`)}
      helperText={helperKey ? t(`questionEditor:${helperKey}`) : undefined}
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

  // One "row" per heading + each field.
  const ROW_COUNT = FIELDS.length + 1

  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      firstInputRef.current?.focus?.()
    },
  }))

  // In desktop view, each language has its inputs in one column. Columns are side by side.
  // In mobile view, all inputs in Finnish come first, followed by Swedish and English.
  const orderSx = (rowIndex, languageIndex) => ({
    order: {
      xs: languageIndex * ROW_COUNT + rowIndex,
      md: rowIndex * languages.length + languageIndex,
    },
  })

  return (
    <Box>
      <Grid columnSpacing={4} rowSpacing={2} container alignItems="stretch">
        {languages.map((language, languageIndex) => (
          <Grid size={{ xs: 12, md: 4 }} key={`heading-${language}`} sx={orderSx(0, languageIndex)}>
            <Typography variant="h6" component="h2">
              {language.toUpperCase()}
            </Typography>
          </Grid>
        ))}

        {FIELDS.map((field, fieldIdx) =>
          languages.map((language, languageIndex) => (
            <Grid
              size={{ xs: 12, md: 4 }}
              key={`${field.fieldName}-${language}`}
              sx={orderSx(fieldIdx + 1, languageIndex)}
            >
              <LikertField
                name={name}
                language={language}
                fieldName={field.fieldName}
                labelKey={field.labelKey}
                helperKey={field.helperKey}
                inputRef={fieldIdx === 0 && languageIndex === 0 ? firstInputRef : undefined}
              />
            </Grid>
          ))
        )}

        <Grid size={12} sx={{ order: ROW_COUNT * languages.length }}>
          <LinkButton title={t('feedbackResponse:markdownLink')} to={t('links:markdownHelp')} external />
        </Grid>
      </Grid>
    </Box>
  )
})

export default LikertEditor
