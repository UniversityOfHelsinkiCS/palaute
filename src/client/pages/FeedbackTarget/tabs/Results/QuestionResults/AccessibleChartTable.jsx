import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { getLanguageValue } from '../../../../../util/languageUtils'

const ariaKeyByType = {
  LIKERT: 'feedbackTargetResults:likertQuestionAriaDescription',
  MULTIPLE_CHOICE: 'feedbackTargetResults:multipleChoiceQuestionAriaDescription',
  SINGLE_CHOICE: 'feedbackTargetResults:singleChoiceQuestionAriaDescription',
}

const AccessibleChartTable = ({ labels, data, totalFeedbacks, question }) => {
  const { t, i18n } = useTranslation()

  const questionLabel = getLanguageValue(question?.data?.label, i18n.language)

  return (
    <TableContainer sx={{ my: 2 }}>
      <Table
        size="small"
        sx={{
          '& thead': {
            backgroundColor: 'action.hover',
          },
        }}
        aria-description={t(ariaKeyByType[question?.type] ?? 'feedbackTargetResults:questionAriaDescription', {
          question: questionLabel,
        })}
      >
        <caption
          style={{ captionSide: 'top', textAlign: 'left', fontSize: '1rem', fontWeight: 'bold', padding: '0.5rem 0' }}
        >
          {t('feedbackView:dataTableCaption')}
        </caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col" sx={{ fontWeight: 'bold' }}>
              {t('feedbackView:option')}
            </TableCell>
            <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
              {t('feedbackView:count')}
            </TableCell>
            <TableCell component="th" scope="col" align="right" sx={{ fontWeight: 'bold' }}>
              {t('feedbackView:percentage')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {labels.map((label, index) => {
            const count = data[index] ?? 0
            const percentage = totalFeedbacks > 0 ? ((count / totalFeedbacks) * 100).toFixed(1) : 0
            const displayLabel = Array.isArray(label) ? label.join(' ') : label
            return (
              <TableRow key={index} hover>
                <TableCell component="th" scope="row">
                  {displayLabel}
                </TableCell>
                <TableCell align="right">{count}</TableCell>
                <TableCell align="right">{percentage} %</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AccessibleChartTable
