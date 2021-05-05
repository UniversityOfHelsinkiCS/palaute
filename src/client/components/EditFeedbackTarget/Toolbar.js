import React from 'react'
import { Link } from 'react-router-dom'
import {
  makeStyles,
  Button,
  Paper,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@material-ui/core'
import { useInView } from 'react-intersection-observer'

import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  saveButton: {
    marginRight: theme.spacing(1),
  },
  floatingWrapper: {
    position: 'fixed',
    bottom: '0px',
    width: '100%',
    left: '0px',
    padding: theme.spacing(2, 0),
    zIndex: 999,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}))

const useLanguageSelectStyles = makeStyles({
  select: {
    minWidth: '180px',
  },
})

const LanguageSelect = ({ value, onChange }) => {
  const { t } = useTranslation()
  const classes = useLanguageSelectStyles()
  const labelId = 'editFeedbackTargetLanguageSelect'
  const label = t('editFeedbackTarget:translationLanguage')

  const handleChange = (event) => {
    onChange(event.target.value)
  }

  return (
    <FormControl variant="outlined">
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        className={classes.select}
        onChange={handleChange}
        value={value}
        label={label}
      >
        <MenuItem value="fi">{t('languages.fi')}</MenuItem>
        <MenuItem value="sv">{t('languages.sv')}</MenuItem>
        <MenuItem value="en">{t('languages.en')}</MenuItem>
      </Select>
    </FormControl>
  )
}

const Toolbar = ({ onSave, previewLink, language, onLanguageChange }) => {
  const { t } = useTranslation()
  const classes = useStyles()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const content = (
    <div className={classes.container}>
      <div>
        <Button
          color="primary"
          variant="contained"
          onClick={onSave}
          className={classes.saveButton}
        >
          {t('save')}
        </Button>

        <Button color="primary" component={Link} to={previewLink}>
          {t('editFeedbackTarget:showPreview')}
        </Button>
      </div>

      <LanguageSelect value={language} onChange={onLanguageChange} />
    </div>
  )

  return (
    <>
      {!inView && (
        <Paper className={classes.floatingWrapper} elevation={3} square>
          <Container>{content}</Container>
        </Paper>
      )}
      <div ref={ref}>{content}</div>
    </>
  )
}

export default Toolbar
