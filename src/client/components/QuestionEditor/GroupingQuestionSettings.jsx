import { Add, ExpandMore, InfoOutlined } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Alert,
  Grid2 as Grid,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { useFeedbackTargetContext } from '../../pages/FeedbackTarget/FeedbackTargetContext'
import { focusIndicatorStyle } from '../../util/accessibility'
import { getAllTranslations, getLanguageValue } from '../../util/languageUtils'
import { useQuestionLanguage } from '../../util/questionLanguageContext'
import { NorButton } from '../common/NorButton'
import QuestionPublicityToggle from '../common/QuestionPublicityToggle'
import TeacherChip from '../common/TeacherChip'
import QuestionCard from './QuestionCard'
import { createQuestion, getQuestionLabel } from './utils'

const GroupingInfo = () => {
  const { t } = useTranslation()

  return (
    <Alert severity="info" role="presentation" sx={{ mb: 2, mt: 1 }}>
      {t('groups:groupingInfoText')
        .split('\n\n')
        .map(paragraph => (
          <Typography key={paragraph} variant="body2" sx={{ mb: 1 }}>
            {paragraph}
          </Typography>
        ))}
    </Alert>
  )
}

const GroupInformation = ({ groups }) => {
  const { t, i18n } = useTranslation()

  return (
    <TableContainer sx={{ px: '1rem' }}>
      <Table size="small">
        <caption
          style={{ fontWeight: 'bold', fontSize: '1rem', captionSide: 'top', color: '#000000de', paddingLeft: 0 }}
        >
          {t('groups:groupInformation')}
        </caption>
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
    </TableContainer>
  )
}

const GroupingQuestionChips = ({ questionId, questionLabel }) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ pl: '1rem', pt: '1.5rem' }}>
      <Grid
        container
        direction="row"
        spacing="0.5rem"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: '1.5rem' }}
      >
        <Grid size={{ xs: 12, sm: 4 }}>
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            <Chip label={t('groups:groupingQuestion')} variant="outlined" />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'start', sm: 'center' } }}>
          {questionId && (
            <QuestionPublicityToggle
              questionId={questionId}
              checked={false}
              disabled={true}
              onChange={() => {}}
              questionLabel={questionLabel}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: { xs: 'start', sm: 'end' } }}></Grid>
      </Grid>
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
  const { t } = useTranslation()
  const language = useQuestionLanguage()
  const { feedbackTarget } = useFeedbackTargetContext()
  const { groups } = feedbackTarget

  const handleAddGroupingQuestion = async () => {
    const question = createGroupingQuestion(groups)
    onAddQuestion(question)
  }

  let automaticGroupingInfo = ''
  if (groups.length === 1) {
    automaticGroupingInfo = t('groups:onlyOneGroup')
  } else if (groups.length > 1) {
    automaticGroupingInfo = t('groups:automaticGroupingInfo')
  }

  return (
    <Paper>
      <Box>
        <GroupingQuestionChips
          questionId={groupingQuestion?.id}
          questionLabel={getQuestionLabel(groupingQuestion, language)}
        />
        <Accordion
          elevation={0}
          slotProps={{ heading: { component: 'div' } }}
          sx={{ m: '0.5rem', p: '0.5rem', '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              '&:hover': { backgroundColor: '#e5f6fd' },
              borderRadius: '0.5rem',
              ...focusIndicatorStyle({ backgroundColor: 'white' }),
            }}
            id="grouping-question-settings-header"
            aria-controls="grouping-question-settings-content"
          >
            <InfoOutlined sx={{ mr: '0.5rem', color: '#0288d1' }} aria-hidden="true" />
            <Typography sx={{ color: '#014361' }}>{t('groups:groupingInfo')}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: '2rem' }}>
            <GroupingInfo />
            {groups.length > 0 && <GroupInformation groups={groups} />}
          </AccordionDetails>
        </Accordion>
        <Box>
          {!groupingQuestion && (
            <Box sx={{ p: '1.5rem' }}>
              <Typography>{`${t('groups:noGroupingQuestion')}${automaticGroupingInfo}`}</Typography>
              <Box sx={{ mt: '0.5rem' }}>
                <NorButton onClick={handleAddGroupingQuestion} color="secondary" icon={<Add />}>
                  {t('groups:addGroupingQuestion')}
                </NorButton>
              </Box>
            </Box>
          )}
        </Box>
        {groupingQuestion && (
          <QuestionCard
            name="groupingQuestion" // Used to access the value from formik context.
            onRemove={onRemove}
            moveUpDisabled
            moveDownDisabled
            language={language}
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
  )
}

export default GroupingQuestionSettings
