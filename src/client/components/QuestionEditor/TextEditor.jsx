import { Grid2 as Grid, Alert } from '@mui/material'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import AlertLink from '../common/AlertLink'
import FormikTextField from '../common/FormikTextField'
import LanguageFieldset from './LanguageFieldset'

const LanguageTextEditor = ({ name, language, inputRef }) => {
  const { t, i18n } = useTranslation()
  const languageT = i18n.getFixedT(language)

  return (
    <FormikTextField
      id={`textual-context-text-${language}-${name}`}
      name={`${name}.data.content.${language}`}
      label={languageT('questionEditor:content')}
      accessibleLabel={`${t('questionEditor:content')} ${t(`questionEditor:inLanguage:${language}`)}`}
      fullWidth
      multiline
      inputRef={inputRef}
    />
  )
}

const TextEditor = forwardRef((props, ref) => {
  const { t } = useTranslation()
  const { name, languages = ['fi', 'sv', 'en'] } = props
  const firstInputRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      firstInputRef.current?.focus?.()
    },
  }))

  return (
    <Grid spacing={4} container>
      {languages.map((language, idx) => (
        <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
          <LanguageFieldset language={language}>
            <LanguageTextEditor name={name} language={language} inputRef={idx === 0 ? firstInputRef : undefined} />
          </LanguageFieldset>
        </Grid>
      ))}
      <Alert severity="info" role="presentation" sx={{ width: '100%' }}>
        {t('questionEditor:markdownSupport')}{' '}
        <AlertLink href={t('links:markdownHelp')} target="_blank">
          {t('feedbackResponse:markdownLink')}
        </AlertLink>
      </Alert>
    </Grid>
  )
})

export default TextEditor
