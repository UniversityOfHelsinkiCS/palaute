import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'

import {
  Container,
  Paper,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Checkbox,
  Button,
  Select,
  MenuItem,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormLabel,
} from '@material-ui/core'

import { red, green } from '@material-ui/core/colors'

import { Edit, Clear, Check, Delete } from '@material-ui/icons'

import {
  getCourseQuestionsAction,
  toggleRequiredField,
  submitUpdates,
  changeTypeField,
  changeNameField,
  deleteQuestionAction,
  addQuestionAction,
} from '../util/redux/modifyQuestionsReducer'

const mapTypeToText = {
  CHOICE: 'Monivalinta',
  TEXT: 'Tekstikenttä',
}

const ModifyQuestions = () => {
  const courseId = useParams().id
  const history = useHistory()
  const dispatch = useDispatch()
  const questions = useSelector((state) => state.questions)
  const [editing, setEditing] = useState({})
  const [dialogOpen, setOpen] = useState(false)
  const [questionData, setQuestionData] = useState({
    question: {
      fi: '',
      en: '',
      se: '',
    },
    type: 'CHOICE',
    required: false,
  })

  useEffect(() => {
    dispatch(getCourseQuestionsAction(courseId))
  }, [])

  const toggleRequired = (questionIndex) => {
    dispatch(toggleRequiredField(questionIndex))
  }

  const updateQuestions = () => {
    dispatch(submitUpdates(courseId, questions.data))
    history.push('/list')
  }

  const backButton = () => {
    history.push('/list')
  }

  // Form action handlers
  const handleFormOpen = () => {
    setOpen(true)
  }

  const addQuestion = () => {
    dispatch(addQuestionAction(questionData))
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const toggleFormRequired = () => {
    setQuestionData({
      ...questionData,
      required: !questionData.required,
    })
  }

  const changeFormType = (event) => {
    setQuestionData({
      ...questionData,
      type: event.target.value,
    })
  }

  const changeFormName = (event) => {
    setQuestionData({
      ...questionData,
      question: {
        ...questionData.question,
        [event.target.id]: event.target.value,
      },
    })
  }

  const formTableRow = (question, i) => {
    const changeType = (event) => {
      dispatch(changeTypeField(i, event.target.value))
    }

    const switchToEdit = (lang) => {
      setEditing({ id: i, lang, text: question.question[lang] })
    }

    const handleTextChange = (event) => {
      setEditing({ ...editing, text: event.target.value })
    }

    const rejectNameChange = () => {
      setEditing({})
    }

    const acceptNameChange = (lang) => {
      dispatch(changeNameField(i, editing.text, lang))
      setEditing({})
    }

    const deleteQuestion = () => {
      dispatch(deleteQuestionAction(i))
    }
    const formNameField = (lang) => {
      if (editing.id === i && editing.lang === lang) {
        return (
          <TableCell>
            <TextField
              value={editing.text}
              variant="outlined"
              onChange={handleTextChange}
            />
            <IconButton
              style={{ color: green[500] }}
              onClick={() => acceptNameChange(lang)}
            >
              <Check />
            </IconButton>
            <IconButton style={{ color: red[500] }} onClick={rejectNameChange}>
              <Clear />
            </IconButton>
          </TableCell>
        )
      }
      return (
        <TableCell>
          {question.question[lang]}
          {editing.id ? null : (
            <IconButton color="primary" onClick={() => switchToEdit(lang)}>
              <Edit />
            </IconButton>
          )}
        </TableCell>
      )
    }

    return (
      <TableRow key={question.id}>
        {formNameField('fi')}
        <TableCell>Kysymys [englanti]</TableCell>
        <TableCell>Kysymys [ruotsi]</TableCell>
        <TableCell>
          <Select
            variant="outlined"
            value={question.type}
            onChange={changeType}
          >
            <MenuItem value="CHOICE">{mapTypeToText.CHOICE}</MenuItem>
            <MenuItem value="TEXT">{mapTypeToText.TEXT}</MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          <Checkbox
            checked={question.required}
            onChange={() => toggleRequired(i)}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={deleteQuestion}>
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    )
  }

  if (questions.pending) return null

  return (
    <>
      <Container size="md" component={Paper}>
        <h2>Kysymykset</h2>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Kysymys [suomi]</b>
              </TableCell>
              <TableCell>
                <b>Kysymys [englanti]</b>
              </TableCell>
              <TableCell>
                <b>Kysymys [ruotsi]</b>
              </TableCell>
              <TableCell>
                <b>Tyyppi</b>
              </TableCell>
              <TableCell>
                <b>Pakollinen</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.data.questions.map((question, i) =>
              formTableRow(question, i),
            )}
          </TableBody>
        </Table>
        <Button variant="contained" color="primary" onClick={updateQuestions}>
          Tallenna
        </Button>
        <Button variant="contained" color="primary" onClick={backButton}>
          Takaisin
        </Button>
        <Button variant="contained" color="primary" onClick={handleFormOpen}>
          Lisää kysymys
        </Button>
        <Dialog open={dialogOpen} onClose={handleClose}>
          <DialogTitle>Lisää kysymys</DialogTitle>
          <DialogContent>
            <TextField
              id="fi"
              onChange={changeFormName}
              margin="dense"
              autoFocus
              fullWidth
              variant="outlined"
              label="Kysymys suomeksi"
            />
            <TextField
              id="en"
              onChange={changeFormName}
              margin="dense"
              fullWidth
              variant="outlined"
              label="Kysymys englanniksi"
            />
            <TextField
              id="se"
              onChange={changeFormName}
              margin="dense"
              fullWidth
              variant="outlined"
              label="Kysymys ruotsiksi"
            />
            <FormLabel>Kysymyksen tyyppi </FormLabel>
            <Select value={questionData.type} onChange={changeFormType}>
              <MenuItem value="CHOICE">{mapTypeToText.CHOICE}</MenuItem>
              <MenuItem value="TEXT">{mapTypeToText.TEXT}</MenuItem>
            </Select>
            <br />
            <FormLabel>Pakollinen </FormLabel>
            <Checkbox
              checked={questionData.required}
              onChange={toggleFormRequired}
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="contained" onClick={addQuestion}>
              Lisää
            </Button>
            <Button color="primary" variant="contained" onClick={handleClose}>
              Peruuta
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default ModifyQuestions
