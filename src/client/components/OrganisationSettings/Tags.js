import { Box, Card, CardContent, Chip, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { getLanguageValue } from '../../util/languageUtils'

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
              <Box p="0.5rem">
                <Chip
                  label={getLanguageValue(tag.name, i18n.language)}
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Tags
