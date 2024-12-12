import React from 'react'

import { IconButton, Tooltip, Box, Grid2 as Grid } from '@mui/material'

import { FieldArray, useField } from 'formik'
import CloseIcon from '@mui/icons-material/Close'
import { Add } from '@mui/icons-material'

import { useTranslation } from 'react-i18next'

import { NorButton } from '../common/NorButton'
import { createOption } from './utils'
import FormikTextField from '../common/FormikTextField'

const styles = {
  optionsContainer: {
    '& > *': {
      marginBottom: theme => theme.spacing(2),
    },
  },
}

const OptionItem = ({ name, index, languages, onRemove }) => {
  const { t, i18n } = useTranslation()

  const handleRemove = () => {
    const hasConfirmed = window.confirm(t('questionEditor:removeOptionConfirmation'))

    if (hasConfirmed) {
      onRemove()
    }
  }

  return (
    <Box display="flex">
      <Box flexGrow={1}>
        <Grid spacing={4} container>
          {languages.map(language => {
            const languageT = i18n.getFixedT(language)

            return (
              <Grid size={{ xs: 12, sm: 12, md: 4 }} key={language}>
                <FormikTextField
                  data-cy={`option-editor-new-option-${language}-name.${index}`}
                  name={`${name}.label.${language}`}
                  label={
                    <>
                      {languageT('questionEditor:option')} {index + 1}
                    </>
                  }
                  fullWidth
                />
              </Grid>
            )
          })}
        </Grid>
      </Box>

      <Box ml={2} flexGrow={0}>
        <Tooltip title={t('questionEditor:removeOption')}>
          <IconButton onClick={handleRemove} size="large">
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
                onRemove={() => arrayHelpers.remove(index)}
              />
            ))}
          </Box>

          <NorButton
            data-cy="option-editor-add-option"
            color="secondary"
            icon={<Add />}
            onClick={() => arrayHelpers.push(createOption())}
          >
            {t('questionEditor:addOption')}
          </NorButton>
        </>
      )}
    />
  )
}

export default OptionEditor
