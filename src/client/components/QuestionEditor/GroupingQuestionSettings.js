import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { EditOutlined, ExpandMore } from '@mui/icons-material'
import { useFeedbackTargetContext } from '../../pages/FeedbackTarget/FeedbackTargetContext'
import { getAllTranslations, getLanguageValue } from '../../util/languageUtils'
import TeacherChip from '../common/TeacherChip'
import InstructionAccordion from '../common/InstructionAccordion'
import { createQuestion } from './utils'
import QuestionCard from './QuestionCard'

const GroupInformation = ({ groups }) => {
  const { t, i18n } = useTranslation()

  return (
    <Box>
      <Accordion elevation={0}>
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
    </Box>
  )
}

const createGroupingQuestion = (groups, type = 'SINGLE_CHOICE') => {
  const data = {
    label: getAllTranslations('groups:groupingQuestionDefaultLabel'),
    options: groups.map(g => ({
      id: g.id,
      label: { fi: '', en: '', sv: '', ...g.name },
    })),
  }

  const options = { required: true, secondaryType: 'GROUPING', public: false, publicityConfigurable: false }

  return createQuestion({ type, data, options })
}

const GroupingQuestionSettings = ({
  onAddQuestion,
  onRemove,
  groupingQuestion,
  isEditing,
  onStartEditing,
  onStopEditing,
}) => {
  const { t, i18n } = useTranslation()
  const { feedbackTarget } = useFeedbackTargetContext()
  const { groups } = feedbackTarget

  const handleAddGroupingQuestion = async () => {
    const question = createGroupingQuestion(groups)
    onAddQuestion(question)
  }

  return (
    <Box mb={2}>
      <Paper>
        <Box p={1}>
          <Accordion variant="outlined" elevation={0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="body1" fontWeight="medium">
                {t('groups:groupingSettings')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box mt="1rem" mb="2rem" display="flex" gap="1rem" flexWrap="wrap">
                <InstructionAccordion title={t('groups:groupingInfoTextTitle')} text={t('groups:groupingInfoText')} />
                <GroupInformation groups={groups} />
              </Box>

              <Box mb="1rem">
                {groupingQuestion ? (
                  t('groups:hasGroupingQuestion', {
                    name: getLanguageValue(groupingQuestion.data.label, i18n.language),
                  })
                ) : (
                  <Box>
                    {t('groups:noGroupingQuestion')}
                    <Box mt="0.5rem">
                      <Button onClick={handleAddGroupingQuestion} variant="outlined" startIcon={<EditOutlined />}>
                        {t('groups:addGroupingQuestion')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
          {groupingQuestion && (
            <QuestionCard
              name="groupingQuestion" // Used to access the value from formik context.
              onRemove={onRemove}
              moveUpDisabled
              moveDownDisabled
              language={i18n.language}
              isEditing={isEditing}
              onStopEditing={onStopEditing}
              onStartEditing={onStartEditing}
              editable
              showMoveButtons={false}
              showRequiredToggle={false}
              onPublicityToggle={() => {}} // should never get called because of the above
              elevation={0} // Because this component is already inside a paper
            />
          )}
        </Box>
      </Paper>
    </Box>
  )
}

export default GroupingQuestionSettings
