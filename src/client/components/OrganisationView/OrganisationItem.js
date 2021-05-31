import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

import { TableRow, TableCell, Link } from '@material-ui/core'

import { getLanguageValue } from '../../util/languageUtils'

const OrganisationItem = ({ organisation }) => {
  const { i18n } = useTranslation()

  return (
    <TableRow>
      <TableCell>
        <Link
          component={RouterLink}
          to={`/programme-survey/${organisation.code}`}
        >
          {getLanguageValue(organisation.name, i18n.language)}
        </Link>
      </TableCell>
      <TableCell>{organisation.code}</TableCell>
    </TableRow>
  )
}

export default OrganisationItem
