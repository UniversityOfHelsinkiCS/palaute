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
import DeleteIcon from '@material-ui/icons/Delete'

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

const OptionItem = ({ name, language, onRemove }) => {
  const handleRemove = () => {
    // eslint-disable-next-line no-alert
    const hasConfirmed = window.confirm(
      'Are you sure you want to remove this option?',
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
          label="Option"
          fullWidth
        />
      </Box>

      <Box ml={2} flexGrow={0}>
        <Tooltip title="Remove option">
          <IconButton onClick={handleRemove}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

const OptionEditor = ({ name, language }) => {
  const classes = useStyles()
  const [optionsField] = useField(name)
  const { value: options = [] } = optionsField

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <>
          <Typography className={classes.title} variant="h6" component="h4">
            Options
          </Typography>
          <div className={classes.optionsContainer}>
            {options.map((option, index) => (
              <OptionItem
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
            Add option
          </Button>
        </>
      )}
    />
  )
}

export default OptionEditor
