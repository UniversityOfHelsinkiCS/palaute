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

const GroupInformation = ({ groups }) => {
  const { t, i18n } = useTranslation()

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>{t('groups:groupInformation')}</AccordionSummary>
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
                <TableCell>{getLanguageValue(group.name, i18n.language)}</TableCell>
                <TableCell>{group.studentCount}</TableCell>
                <TableCell>
                  {group.teachers?.map(teacher => (
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
}

const GroupingSettings = () => {
  const { t } = useTranslation()
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
          <GroupInformation groups={groups} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default GroupingSettings
