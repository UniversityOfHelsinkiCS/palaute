import React from 'react'
import _ from 'lodash'
import { SettingsBackupRestore } from '@mui/icons-material'
import { Box, Button, IconButton } from '@mui/material'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'react-i18next'
import MultiSelect from '../../components/common/MultiSelect'
import { getLanguageValue } from '../../util/languageUtils'

const TagSelector = ({ objectIds, originalTagIds, tags, onClose, mutation }) => {
  const { enqueueSnackbar } = useSnackbar()
  const { t, i18n } = useTranslation()
  const [tagIds, setTagIds] = React.useState([])
  const reset = () => setTagIds(originalTagIds)

  React.useEffect(() => {
    reset()
  }, [objectIds])

  const onSubmit = async () => {
    try {
      await mutation(tagIds)
      if (typeof onClose === 'function') onClose()
      enqueueSnackbar(t('common:success'), { variant: 'success' })
    } catch (error) {
      console.error(error)
      enqueueSnackbar(t('common:unknownError'), { variant: 'failure' })
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap="1rem">
      <MultiSelect
        colors
        label={t('common:studyTracks')}
        value={tagIds}
        options={tags.map(t => ({
          hash: t.hash,
          id: t.id,
          label: getLanguageValue(t.name, i18n.language),
        }))}
        onChange={setTagIds}
      />
      <Box display="flex">
        <Button onClick={onSubmit} variant="contained" size="small" disabled={!(objectIds?.length > 0)}>
          {t('common:accept')}
        </Button>
        <IconButton onClick={reset}>
          <SettingsBackupRestore />
        </IconButton>
      </Box>
    </Box>
  )
}

export default TagSelector
