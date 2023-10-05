import React from 'react'
import { useTranslation } from 'react-i18next'

import { Box } from '@mui/material'

import { useParams } from 'react-router-dom'

import useOrganisation from '../../hooks/useOrganisation'

import { LoadingProgress } from '../../components/common/LoadingProgress'

const OrganisationSurveys = () => {
  const { code } = useParams()
  const { organisation, isLoading: isOrganisationLoading } = useOrganisation(code)
  const { t } = useTranslation()

  if (isOrganisationLoading) {
    return <LoadingProgress />
  }

  console.log(organisation)

  return <Box mb={2}>Testi</Box>
}

export default OrganisationSurveys
