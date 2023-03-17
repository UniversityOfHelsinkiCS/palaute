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
import { ExpandMore } from '@mui/icons-material'
import { useFeedbackTargetContext } from '../../FeedbackTargetContext'
import { getLanguageValue } from '../../../../util/languageUtils'
import TeacherChip from '../../../../components/common/TeacherChip'

const GroupInformation = ({ groups, t, lang }) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMore />}>
      {t('groups:groupInformation', { count: groups.length })}
    </AccordionSummary>
    <AccordionDetails>
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
              <TableCell>{getLanguageValue(group.name, lang)}</TableCell>
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
    </AccordionDetails>
  </Accordion>
)

const GroupingSettings = () => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget } = useFeedbackTargetContext()
  const { groups } = feedbackTarget

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
