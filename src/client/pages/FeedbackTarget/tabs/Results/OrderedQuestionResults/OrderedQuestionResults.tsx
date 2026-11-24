import type { Question } from '@common/types/question'

import { Box } from '@mui/material'
import { useMemo } from 'react'

import type { OpenAnswerActions } from './OpenAnswers'
import type { PublicitySettings } from './QuestionPublicity'

import { buildBlocks } from './blocks'
import ChoiceResults from './ChoiceResults'
import { BLOCK_CLASS, MAX_WIDTH } from './layout'
import LikertAnswerTable from './LikertAnswerTable'
import LikertTable from './LikertTable'
import OpenAnswers from './OpenAnswers'
import QuestionBlock from './QuestionBlock'
import TextSection from './TextSection'

type OrderedQuestionResultsProps = {
  questions: Question[]
  questionOrder?: number[]
  feedbacks: Parameters<typeof buildBlocks>[0]['feedbacks']
  publicQuestionIds: number[]
  publicityConfigurableQuestionIds?: number[]
  isResponsibleTeacher: boolean
  isOrganisationUser: boolean
  isOpen: boolean
  feedbackCount: number
  setQuestionPublicity: (questionId: number, isPublic: boolean) => Promise<unknown>
  openAnswerActions?: OpenAnswerActions
  showTable: boolean
  baseHeadingLevel?: number
}

const OrderedQuestionResults = ({
  questions,
  questionOrder,
  feedbacks,
  publicQuestionIds,
  publicityConfigurableQuestionIds,
  isResponsibleTeacher,
  isOrganisationUser,
  isOpen,
  feedbackCount,
  setQuestionPublicity,
  openAnswerActions,
  showTable,
  baseHeadingLevel = 2,
}: OrderedQuestionResultsProps) => {
  const canSeeAll = isResponsibleTeacher || isOrganisationUser

  const blocks = useMemo(
    () =>
      buildBlocks({
        questions,
        questionOrder,
        feedbacks,
        isVisible: question => canSeeAll || publicQuestionIds.includes(question.id),
      }),
    [questions, questionOrder, feedbacks, canSeeAll, publicQuestionIds]
  )

  const publicity: PublicitySettings | undefined = isResponsibleTeacher
    ? { publicQuestionIds, configurableQuestionIds: publicityConfigurableQuestionIds, isOpen, setQuestionPublicity }
    : undefined

  return (
    <Box
      data-cy="ordered-question-results"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 3,
        mt: 3,
        maxWidth: MAX_WIDTH,
        // A text section keeps no line above it, so that it stays with the questions under it
        [`& > .${BLOCK_CLASS} + *`]: { borderTop: '1px solid', borderColor: 'divider', pt: 3 },
      }}
    >
      {blocks.map(block => {
        if (block.type === 'TEXT') {
          return <TextSection key={block.key} question={block.question} />
        }

        if (block.type === 'LIKERT' && showTable) {
          return block.questions.map(question => (
            <QuestionBlock
              key={question.id}
              question={question}
              headingLevel={baseHeadingLevel}
              feedbackCount={feedbackCount}
              isPublic={publicQuestionIds.includes(question.id)}
              publicity={publicity}
            >
              <LikertAnswerTable question={question} feedbackCount={feedbackCount} />
            </QuestionBlock>
          ))
        }

        if (block.type === 'LIKERT') {
          return (
            <LikertTable
              key={block.key}
              questions={block.questions}
              headingLevel={baseHeadingLevel}
              feedbackCount={feedbackCount}
              publicQuestionIds={publicQuestionIds}
              publicity={publicity}
            />
          )
        }

        const { question } = block

        return (
          <QuestionBlock
            key={block.key}
            question={question}
            headingLevel={baseHeadingLevel}
            feedbackCount={feedbackCount}
            isPublic={publicQuestionIds.includes(question.id)}
            publicity={publicity}
          >
            {block.type === 'OPEN' ? (
              <OpenAnswers question={question} openAnswerActions={openAnswerActions} peek={!showTable} />
            ) : (
              <ChoiceResults question={question} feedbackCount={feedbackCount} showTable={showTable} />
            )}
          </QuestionBlock>
        )
      })}
    </Box>
  )
}

export default OrderedQuestionResults
