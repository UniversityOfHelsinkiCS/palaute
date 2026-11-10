import { Add, ExpandMore, InfoOutlined } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Paper,
  Stack,
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
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'
import { getAllTranslations, getLanguageValue } from '../../util/languageUtils'
import { useQuestionLanguage } from '../../util/questionLanguageContext'
import { useTranslationContext } from '../../util/translationContext'
import { NorButton } from '../common/NorButton'
import QuestionPublicityToggle from '../common/QuestionPublicityToggle'
import TeacherChip from '../common/TeacherChip'
import QuestionCard from './QuestionCard'
import { createQuestion, getQuestionLabel } from './utils'

const GroupingInfo = () => {
  const { t } = useTranslation()
  const context = useTranslationContext()

  return (
    <Alert severity="info" role="presentation" sx={{ mb: 2, mt: 1 }}>
      <Stack spacing={1}>
        {t('groups:groupingInfoText', { context })
          .split('\n\n')
          .map(paragraph => (
            <Typography key={paragraph} variant="body2">
              {paragraph}
            </Typography>
          ))}
      </Stack>
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

const GroupingQuestionChips = ({ questionId, isPublic, questionLabel }) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ px: '1.5rem', pt: '1.5rem' }}>
      <Grid
        container
        direction="row"
        spacing="0.5rem"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: '0.5rem' }}
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
              checked={isPublic}
              disabled={true}
              disabledInfo={t('groups:groupingPublicityInfo')}
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

const createGroupingQuestion = (groups, context, type = 'SINGLE_CHOICE') => {
  const data = {
    label: getAllTranslations('groups:groupingQuestionDefaultLabel', { context }),
    options: groups.map(g => ({
      id: g.id,
      label: { fi: '', en: '', sv: '', ...g.name },
    })),
  }

  const options = { required: true, secondaryType: 'GROUPING', public: false, publicityConfigurable: false }

  return createQuestion({ type, data, options })
}

const GroupingQuestionSettings = ({
  groups,
  onAddQuestion,
  onRemove,
  groupingQuestion,
  isEditing,
  onStartEditing,
  onStopEditing,
  onCancelEditing,
}) => {
  const { t } = useTranslation()
  const language = useQuestionLanguage()
  const context = useTranslationContext()
  const addButtonRef = useRef(null)

  const handleAddGroupingQuestion = async () => {
    const question = createGroupingQuestion(groups, context)
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
          isPublic={Boolean(groupingQuestion?.public)}
          questionLabel={getQuestionLabel(groupingQuestion, language)}
        />
        <Accordion
          elevation={0}
          disableGutters
          slotProps={{ heading: { component: 'div' } }}
          sx={{ mx: '1rem', '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              px: '0.5rem',
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
          <AccordionDetails sx={{ px: '0.5rem', pb: 0 }}>
            <GroupingInfo />
            {groups.length > 0 && <GroupInformation groups={groups} />}
          </AccordionDetails>
        </Accordion>
        <Divider sx={{ mx: '1.5rem', mt: '0.5rem' }} />
        <Box>
          {!groupingQuestion && (
            <Box sx={{ px: '1.5rem', pt: '1rem', pb: '1.5rem' }}>
              <Typography>{`${t('groups:noGroupingQuestion')}${automaticGroupingInfo}`}</Typography>
              <Box sx={{ mt: '1rem' }}>
                <NorButton ref={addButtonRef} onClick={handleAddGroupingQuestion} color="secondary" icon={<Add />}>
                  {t('groups:addGroupingQuestion')}
                </NorButton>
              </Box>
            </Box>
          )}
        </Box>
        {groupingQuestion && (
          <QuestionCard
            name="groupingQuestion" // Used to access the value from formik context.
            onRemove={() => {
              onRemove()
              // The add button only appears once the question is removed, see onCancelEditing below
              setTimeout(() => addButtonRef.current?.focus(), 100)
            }}
            isEditing={isEditing}
            onStopEditing={onStopEditing}
            onCancelEditing={isNew => {
              onCancelEditing(isNew)
              // The add button only appears once the question is removed, and Firefox does not
              // announce it if focused immediately, so give the accessibility tree time to update
              if (isNew) setTimeout(() => addButtonRef.current?.focus(), 100)
            }}
            onStartEditing={onStartEditing}
          />
        )}
      </Box>
    </Paper>
  )
}

export default GroupingQuestionSettings
