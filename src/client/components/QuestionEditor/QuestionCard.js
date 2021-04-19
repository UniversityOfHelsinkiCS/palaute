import React from 'react'

import {
  Card,
  CardContent,
  TextField,
  IconButton,
  Grid,
  Typography,
  makeStyles,
} from '@material-ui/core'

import DeleteIcon from '@material-ui/icons/Delete'
import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import produce from 'immer'

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(2),
  },
}))

const BoundTextField = ({ name, question, language, onChange, ...props }) => {
  const handleChange = (event) => {
    onChange(
      produce(question, (draft) => {
        draft.data[name][language] = event.target.value
      }),
    )
  }

  const value = question.data[name][language] ?? ''

  return (
    <TextField
      value={value}
      variant="outlined"
      fullWidth
      onChange={handleChange}
      {...props}
    />
  )
}

const LabelTextField = ({ question, language, onChange }) => (
  <BoundTextField
    name="label"
    label="Label"
    question={question}
    language={language}
    onChange={onChange}
  />
)

const LikertEditor = ({ question, onChange, language }) => (
  <LabelTextField question={question} onChange={onChange} language={language} />
)

const OpenEditor = ({ question, onChange, language }) => (
  <LabelTextField question={question} onChange={onChange} language={language} />
)

const TextEditor = ({ question, onChange, language }) => (
  <BoundTextField
    name="content"
    label="Content"
    question={question}
    onChange={onChange}
    language={language}
    multiline
  />
)

const editorComponentByType = {
  LIKERT: LikertEditor,
  OPEN: OpenEditor,
  TEXT: TextEditor,
}

const titleByType = {
  LIKERT: 'Likert question',
  OPEN: 'Open question',
  TEXT: 'Textual content',
}

const QuestionCard = ({
  question,
  onChange,
  onDelete,
  language,
  onMoveUp,
  onMoveDown,
  className,
  moveUpDisabled = false,
  moveDownDisabled = false,
}) => {
  const classes = useStyles()
  const EditorComponent = editorComponentByType[question.type]
  const title = titleByType[question.type]

  return (
    <Card className={className}>
      <CardContent>
        <Grid spacing={2} container>
          <Grid xs={12} sm item>
            <Typography variant="h6" component="h3" className={classes.title}>
              {title}
            </Typography>
            <EditorComponent
              question={question}
              onChange={onChange}
              language={language}
            />
          </Grid>
          <Grid item>
            <IconButton
              disabled={moveUpDisabled}
              onClick={() => onMoveUp(question)}
            >
              <UpIcon />
            </IconButton>
            <IconButton
              disabled={moveDownDisabled}
              onClick={() => onMoveDown(question)}
            >
              <DownIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(question)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default QuestionCard
