import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles, Button, Tooltip } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import FixedContainer from '../FixedContainer'
import LanguageSelect from '../LanguageSelect'

const useStyles = makeStyles((theme) => ({
  saveButton: {
    marginRight: theme.spacing(1),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}))

const Toolbar = ({
  onSave,
  previewLink,
  language,
  onLanguageChange,
  formIsDirty,
}) => {
  const { t } = useTranslation()
  const classes = useStyles()

  const saveButton = (
    <Button
      color="primary"
      variant="contained"
      onClick={onSave}
      disabled={!formIsDirty}
      className={classes.saveButton}
    >
      {t('save')}
    </Button>
  )

  return (
    <FixedContainer>
      <div className={classes.container}>
        <div>
          {formIsDirty ? (
            saveButton
          ) : (
            <Tooltip title={t('editFeedbackTarget:noUnsavedChanges')}>
              <span>{saveButton}</span>
            </Tooltip>
          )}

          <Button color="primary" component={Link} to={previewLink}>
            {t('editFeedbackTarget:showPreview')}
          </Button>
        </div>

        <LanguageSelect
          value={language}
          onChange={onLanguageChange}
          label={t('editFeedbackTarget:translationLanguage')}
        />
      </div>
    </FixedContainer>
  )
}

export default Toolbar
