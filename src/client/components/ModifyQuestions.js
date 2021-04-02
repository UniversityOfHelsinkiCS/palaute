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
        <Button variant="contained" color="primary" href="/list">
          Takaisin
        </Button>
      </Container>
    </>
  )
}

export default ModifyQuestions
