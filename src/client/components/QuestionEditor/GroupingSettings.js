import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ExpandMore } from '@mui/icons-material'
import { useFeedbackTargetContext } from '../../pages/FeedbackTarget/FeedbackTargetContext'
import { getAllTranslations, getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../common/TeacherChip'
import InstructionAccordion from '../common/InstructionAccordion'
import useUpdateTeacherSurvey from '../../hooks/useUpdateTeacherSurvey'
import useInteractiveMutation from '../../hooks/useInteractiveMutation'
import { createQuestion } from './utils'

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
              <TableCell>{t('groups:teachersOfGroup')}</TableCell>
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

const createGroupingQuestion = groups => {
  const data = {
    label: getAllTranslations('groups:groupingQuestionDefaultLabel'),
    options: groups.map(g => ({
      id: g.id,
      label: { fi: '', en: '', sv: '', ...g.name },
    })),
  }

  return createQuestion({ type: 'MULTIPLE_CHOICE', data, options: { required: true, secondaryType: 'GROUPING' } })
}

const GroupingSettings = () => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget, isAdmin } = useFeedbackTargetContext()
  const { groups } = feedbackTarget

  const updateSurveyMutation = useUpdateTeacherSurvey(feedbackTarget)

  const addGroupingQuestion = useInteractiveMutation(
    question => updateSurveyMutation.mutateAsync({ questions: [question] }),
    {
      success: t('groups:groupingQuestionAddSuccess'),
    }
  )

  const handleAddGroupingQuestion = () => {
    addGroupingQuestion(createGroupingQuestion(groups))
  }

  const groupingQuestion = feedbackTarget.questions.find(q => q.secondaryType === 'GROUPING')

  if (!isAdmin) return null

  return (
    <Box mb={2}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">{t('groups:groupingSettings')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <InstructionAccordion title={t('groups:groupingInfoTextTitle')} text={t('groups:groupingInfoText')} />
          {groupingQuestion ? (
            t('groups:hasGroupingQuestion', { name: getLanguageValue(groupingQuestion.name, i18n.language) })
          ) : (
            <Box>
              {t('groups:noGroupingQuestion')}
              <Button onClick={handleAddGroupingQuestion}>{t('groups:addGroupingQuestion')}</Button>
            </Box>
          )}
          <Typography>We have these groups available from SISU</Typography>
          <GroupInformation groups={groups} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default GroupingSettings
