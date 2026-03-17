import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Card, CardActionArea, Chip } from '@mui/material'

import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import { LoadingProgress } from '../../components/common/LoadingProgress'
import { getLanguageValue } from '../../util/languageUtils'
import type { OrganisationWithAccess } from '../../../common/types/organisation'

const isProgrammeCode = (code: string) => /^\d{3}-[MK]\d{3,4}$/.test(code)

const getAccessLabel = (access: OrganisationWithAccess['access'], t: (key: string) => string) => {
  if (access.admin) return t('myOrganisationsPage:admin')
  if (access.write) return t('myOrganisationsPage:write')
  if (access.read) return t('myOrganisationsPage:read')
  return ''
}

const getAccessColor = (access: OrganisationWithAccess['access']): 'error' | 'warning' | 'info' => {
  if (access.admin) return 'error'
  if (access.write) return 'warning'
  return 'info'
}

const MyOrganisations = () => {
  const { t, i18n } = useTranslation()
  const { authorizedUser, isLoading } = useAuthorizedUser()

  if (isLoading || !authorizedUser) {
    return <LoadingProgress />
  }

  const { organisations } = authorizedUser

  const accessRank = (access: OrganisationWithAccess['access']) => {
    if (access.admin) return 0
    if (access.write) return 1
    return 2
  }

  const sortedOrganisations = [...(organisations ?? [])].sort((a, b) => {
    const rankDiff = accessRank(a.access) - accessRank(b.access)
    if (rankDiff !== 0) return rankDiff
    const nameA = getLanguageValue(a.organisation.name, i18n.language) ?? ''
    const nameB = getLanguageValue(b.organisation.name, i18n.language) ?? ''
    return nameA.localeCompare(nameB)
  })

  const allAreProgrammes =
    sortedOrganisations.length > 0 &&
    sortedOrganisations.every(({ organisation }) => isProgrammeCode(organisation.code))

  const titleKey = allAreProgrammes ? 'myOrganisationsPage:titleProgrammes' : 'myOrganisationsPage:title'

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {t(titleKey)}
      </Typography>

      {sortedOrganisations.length === 0 ? (
        <Typography color="textSecondary">{t('myOrganisationsPage:noOrganisations')}</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sortedOrganisations.map(({ organisation, access }) => (
            <Card key={organisation.code} variant="outlined">
              <CardActionArea
                component={Link}
                to={`/organisations/${organisation.code}`}
                sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {getLanguageValue(organisation.name, i18n.language)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {organisation.code}
                  </Typography>
                </Box>
                <Chip
                  label={getAccessLabel(access, t)}
                  color={getAccessColor(access)}
                  size="small"
                  variant="outlined"
                />
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default MyOrganisations
