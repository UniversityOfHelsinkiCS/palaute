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
import { useTranslation } from 'react-i18next'

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

const LikertEditor = ({ name, language }) => {
  const { t } = useTranslation()

  return (
    <FormikTextField
      name={`${name}.data.label.${language}`}
      label={t('questionEditor:label')}
      fullWidth
    />
  )
}

const OpenEditor = ({ name, language }) => {
  const { t } = useTranslation()

  return (
    <FormikTextField
      name={`${name}.data.label.${language}`}
      label={t('questionEditor:label')}
      fullWidth
    />
  )
}

const ChoiceEditor = ({ name, language }) => {
  const { t } = useTranslation()

  return (
    <>
      <Box mb={2}>
        <FormikTextField
          name={`${name}.data.label.${language}`}
          label={t('questionEditor:label')}
          fullWidth
        />
      </Box>
      <OptionEditor name={`${name}.data.options`} language={language} />
    </>
  )
}

const TextEditor = ({ name, language }) => {
  const { t } = useTranslation()

  return (
    <FormikTextField
      name={`${name}.data.content.${language}`}
      label={t('questionEditor:label')}
      fullWidth
      multiline
    />
  )
}

const editorComponentByType = {
  LIKERT: LikertEditor,
  OPEN: OpenEditor,
  TEXT: TextEditor,
  MULTIPLE_CHOICE: ChoiceEditor,
  SINGLE_CHOICE: ChoiceEditor,
}

const getTitleByType = (type, t) => {
  const mapping = {
    LIKERT: t('questionEditor:likertQuestion'),
    OPEN: t('questionEditor:openQuestion'),
    TEXT: t('questionEditor:textualContent'),
    MULTIPLE_CHOICE: t('questionEditor:multipleChoiceQuestion'),
    SINGLE_CHOICE: t('questionEditor:singleChoiceQuestion'),
  }

  return mapping[type]
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
  const { t } = useTranslation()
  const classes = useStyles()
  const [field] = useField(name)
  const { value: question } = field
  const EditorComponent = editorComponentByType[question.type]
  const title = getTitleByType(question.type, t)

  const handleRemove = () => {
    // eslint-disable-next-line no-alert
    const hasConfirmed = window.confirm(
      t('questionEditor:removeQuestionConfirmation'),
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
            <Tooltip title={t('questionEditor:moveUp')}>
              <div>
                <IconButton disabled={moveUpDisabled} onClick={onMoveUp}>
                  <UpIcon />
                </IconButton>
              </div>
            </Tooltip>

            <Tooltip title={t('questionEditor:moveDown')}>
              <div>
                <IconButton disabled={moveDownDisabled} onClick={onMoveDown}>
                  <DownIcon />
                </IconButton>
              </div>
            </Tooltip>

            <Tooltip title={t('questionEditor:removeQuestion')}>
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
