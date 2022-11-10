import { Box, Card, CardContent, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { TagChip } from '../common/TagChip'

const Tags = ({ organisation }) => {
  const { t, i18n } = useTranslation()
  const { tags } = organisation

  return (
    <Box>
      <Typography textTransform="uppercase">
        {t('organisationSettings:studyTracks')} ({tags.length})
      </Typography>
      <Card>
        <CardContent>
          <Box display="flex" flexWrap="wrap">
            {tags?.map((tag) => (
              <TagChip key={tag.id} tag={tag} language={i18n.language} />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Tags
