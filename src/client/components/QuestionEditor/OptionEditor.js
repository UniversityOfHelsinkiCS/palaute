import React from 'react'

import {
  Button,
  makeStyles,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from '@material-ui/core'

import { FieldArray, useField } from 'formik'
import CloseIcon from '@material-ui/icons/Close'
import { useTranslation } from 'react-i18next'

import { createOption } from './utils'
import FormikTextField from '../FormikTextField'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
    fontSize: '1rem',
  },
  optionsContainer: {
    '& > *': {
      marginBottom: theme.spacing(2),
    },
  },
}))

const OptionItem = ({ name, index, language, onRemove }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)

  const handleRemove = () => {
    // eslint-disable-next-line no-alert
    const hasConfirmed = window.confirm(
      t('questionEditor:removeOptionConfirmation'),
    )

    if (hasConfirmed) {
      onRemove()
    }
  }

  return (
    <Box display="flex">
      <Box flexGrow={1}>
        <FormikTextField
          name={`${name}.label.${language}`}
          label={
            <>
              {t('questionEditor:option')} {index + 1}
            </>
          }
          fullWidth
        />
      </Box>

      <Box ml={2} flexGrow={0}>
        <Tooltip title={t('questionEditor:removeOption')}>
          <IconButton onClick={handleRemove}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

const OptionEditor = ({ name, language }) => {
  const { i18n } = useTranslation()
  const t = i18n.getFixedT(language)
  const classes = useStyles()
  const [optionsField] = useField(name)
  const { value: options = [] } = optionsField

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <>
          <Typography className={classes.title} variant="h6" component="h4">
            {t('questionEditor:options')}
          </Typography>
          <div className={classes.optionsContainer}>
            {options.map((option, index) => (
              <OptionItem
                id={`option-${language}-${index}-${name}`}
                index={index}
                key={option.id}
                name={`${name}.${index}`}
                language={language}
                onRemove={() => arrayHelpers.remove(index)}
              />
            ))}
          </div>

          <Button
            color="primary"
            onClick={() => arrayHelpers.push(createOption())}
          >
            {t('questionEditor:addOption')}
          </Button>
        </>
      )}
    />
  )
}

export default OptionEditor
