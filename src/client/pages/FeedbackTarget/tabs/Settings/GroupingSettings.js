import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { ExpandMore } from '@mui/icons-material'
import { useQuery } from 'react-query'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import { getLanguageValue } from '../../../../util/languageUtils'
import TeacherChip from '../../../../components/common/TeacherChip'
import apiClient from '../../../../util/apiClient'
import { LoadingProgress } from '../../../../components/common/LoadingProgress'

const useGroupInformation = (feedbackTargetId, enabled) =>
  useQuery(
    ['feedbackTarget', feedbackTargetId, 'groups'],
    async () => {
      const data = await apiClient.get(`/feedback-targets/${feedbackTargetId}/groups`)
      return data
    },
    { enabled, retry: 0 }
  )

const GroupInformation = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const { data: groups, isLoading, isError } = useGroupInformation(id, open)

  return (
    <Accordion expanded={open} onClick={() => setOpen(!open)}>
      <AccordionSummary expandIcon={<ExpandMore />}>{t('groups:groupInformation')}</AccordionSummary>
      <AccordionDetails>
        {isLoading || !groups ? (
          <LoadingProgress isError={isError} message={t('common:fetchError')} />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('groups:groupName')}</TableCell>
                <TableCell>{t('common:studentCount')}</TableCell>
                <TableCell>{t('common:teachers')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map(group => (
                <TableRow key={group.id}>
                  <TableCell>{getLanguageValue(group.name, i18n.language)}</TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>
                    {group.teachers.map(teacher => (
                      <TeacherChip key={teacher.id} user={teacher} />
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

const GroupingSettings = () => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isAdmin } = useFeedbackTargetContext()
  const { groups } = feedbackTarget

  if (!isAdmin) return null

  return (
    <Box mb={2}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">{t('groups:groupingSettings')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>We have these groups available from SISU</Typography>
          <GroupInformation groups={groups} t={t} lang={i18n.language} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default GroupingSettings
