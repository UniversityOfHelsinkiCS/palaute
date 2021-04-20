import React from 'react'

import {
  Card,
  CardContent,
  IconButton,
  Grid,
  Typography,
  makeStyles,
  Tooltip,
  Box,
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import { useField } from 'formik'

import OptionEditor from './OptionEditor'
import FormikTextField from '../FormikTextField'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'row',
    },
  },
}))

const LikertEditor = ({ name, language }) => (
  <FormikTextField
    name={`${name}.data.label.${language}`}
    label="Label"
    fullWidth
  />
)

const OpenEditor = ({ name, language }) => (
  <FormikTextField
    name={`${name}.data.label.${language}`}
    label="Label"
    fullWidth
  />
)

const ChoiceEditor = ({ name, language }) => (
  <>
    <Box mb={2}>
      <FormikTextField
        name={`${name}.data.label.${language}`}
        label="Label"
        fullWidth
      />
    </Box>
    <OptionEditor name={`${name}.data.options`} language={language} />
  </>
)

const TextEditor = ({ name, language }) => (
  <FormikTextField
    name={`${name}.data.label.${language}`}
    label="Content"
    fullWidth
    multiline
  />
)

const editorComponentByType = {
  LIKERT: LikertEditor,
  OPEN: OpenEditor,
  TEXT: TextEditor,
  MULTIPLE_CHOICE: ChoiceEditor,
  SINGLE_CHOICE: ChoiceEditor,
}

const titleByType = {
  LIKERT: 'Likert question',
  OPEN: 'Open question',
  TEXT: 'Textual content',
  MULTIPLE_CHOICE: 'Multiple choice question',
  SINGLE_CHOICE: 'Single choice question',
}

const QuestionCard = ({
  name,
  onRemove,
  language,
  onMoveUp,
  onMoveDown,
  className,
  moveUpDisabled = false,
  moveDownDisabled = false,
}) => {
  const classes = useStyles()
  const [field] = useField(name)
  const { value: question } = field
  const EditorComponent = editorComponentByType[question.type]
  const title = titleByType[question.type]

  const handleRemove = () => {
    // eslint-disable-next-line no-alert
    const hasConfirmed = window.confirm(
      'Are you sure you want to remove this question?',
    )

    if (hasConfirmed) {
      onRemove()
    }
  }

  return (
    <Card className={className}>
      <CardContent>
        <Grid spacing={2} container>
          <Grid xs={12} sm item>
            <Typography variant="h6" component="h3" className={classes.title}>
              {title}
            </Typography>
            <EditorComponent name={name} language={language} />
          </Grid>
          <Grid className={classes.actionsContainer} item>
            <Tooltip title="Move up">
              <div>
                <IconButton disabled={moveUpDisabled} onClick={onMoveDown}>
                  <UpIcon />
                </IconButton>
              </div>
            </Tooltip>

            <Tooltip title="Move down">
              <div>
                <IconButton disabled={moveDownDisabled} onClick={onMoveUp}>
                  <DownIcon />
                </IconButton>
              </div>
            </Tooltip>

            <Tooltip title="Remove question">
              <div>
                <IconButton onClick={handleRemove}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </Tooltip>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default QuestionCard
