import { Add } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
import { IconButton, Tooltip, Box, Grid2 as Grid } from '@mui/material'
import { FieldArray, useField } from 'formik'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { useQuestionLanguage } from '../../util/questionLanguageContext'
import ConfirmDialog from '../common/ConfirmDialog'
import FormikTextField from '../common/FormikTextField'
import { NorButton } from '../common/NorButton'
import { createOption, getOptionLabel } from './utils'

const styles = {
  optionsContainer: {
    '& > *': {
      marginBottom: theme => theme.spacing(2),
    },
  },
}

const OptionItem = ({ name, index, languages, onRemove, isNew }) => {
  const { t, i18n } = useTranslation()

  return (
    <Box display="flex">
      <Box flexGrow={1}>
        <Grid rowSpacing={1} columnSpacing={4} container>
          {languages.map((language, languageIndex) => {
            const languageT = i18n.getFixedT(language)

            return (
              <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
                <FormikTextField
                  data-cy={`option-editor-new-option-${language}-name.${index}`}
                  name={`${name}.label.${language}`}
                  label={`${languageT('questionEditor:option')} ${index + 1}`}
                  accessibleLabel={`${t('questionEditor:option')} ${index + 1} ${t(`questionEditor:inLanguage:${language}`)}`}
                  fullWidth
                  // The option is added above the add button, so move focus to it. This happens only after
                  // the user clicks the add button, not when the dialog opens.
                  // oxlint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={isNew && languageIndex === 0}
                />
              </Grid>
            )
          })}
        </Grid>
      </Box>

      <Box ml={2} flexGrow={0}>
        <Tooltip title={t('questionEditor:removeOption')}>
          <IconButton
            onClick={onRemove}
            size="large"
            sx={focusIndicatorStyle()}
            disableFocusRipple
            aria-label={t('questionEditor:removeOptionLabel', { number: index + 1 })}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

const OptionEditor = ({ name, languages = ['fi', 'sv', 'en'] }) => {
  const { t } = useTranslation()
  const [optionsField] = useField(name)
  const { value: options = [] } = optionsField
  const [newOptionId, setNewOptionId] = useState(null)
  const [removeIndex, setRemoveIndex] = useState(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [removeConfirmed, setRemoveConfirmed] = useState(false)
  const addButtonRef = useRef(null)
  const language = useQuestionLanguage()
  const removeOptionLabel = removeIndex === null ? undefined : getOptionLabel(options[removeIndex], language)

  const handleRemoveClick = (index, arrayHelpers) => {
    // An option that is empty in every language has nothing to lose, so remove it without confirmation
    if (!getOptionLabel(options[index], language)) {
      arrayHelpers.remove(index)
      addButtonRef.current?.focus()
      return
    }

    setRemoveIndex(index)
    setRemoveConfirmed(false)
    setRemoveDialogOpen(true)
  }

  const handleConfirmRemove = () => {
    setRemoveConfirmed(true)
    setRemoveDialogOpen(false)
  }

  return (
    <FieldArray
      name={name}
      render={arrayHelpers => (
        <>
          <Box sx={styles.optionsContainer}>
            {options.map((option, index) => (
              <OptionItem
                index={index}
                key={option.id}
                name={`${name}.${index}`}
                languages={languages}
                onRemove={() => handleRemoveClick(index, arrayHelpers)}
                isNew={option.id === newOptionId}
              />
            ))}
          </Box>

          <NorButton
            data-cy="option-editor-add-option"
            color="secondary"
            icon={<Add />}
            sx={{ mt: 1 }}
            ref={addButtonRef}
            onClick={() => {
              const option = createOption()
              setNewOptionId(option.id)
              arrayHelpers.push(option)
            }}
          >
            {t('questionEditor:addOption')}
          </NorButton>

          <ConfirmDialog
            open={removeDialogOpen}
            onClose={() => setRemoveDialogOpen(false)}
            onConfirm={handleConfirmRemove}
            disableRestoreFocus={removeConfirmed}
            onExited={() => {
              if (removeConfirmed) {
                arrayHelpers.remove(removeIndex)
                addButtonRef.current?.focus()
              }
              setRemoveIndex(null)
              setRemoveConfirmed(false)
            }}
            title={t('questionEditor:removeQuestionConfirmationTitle')}
            content={t('questionEditor:removeOptionLabelConfirmation', { label: removeOptionLabel })}
            confirmLabel={t('questionEditor:removeOption')}
            confirmColor="error"
            dataCy="option-editor-remove-option"
          />
        </>
      )}
    />
  )
}

export default OptionEditor
