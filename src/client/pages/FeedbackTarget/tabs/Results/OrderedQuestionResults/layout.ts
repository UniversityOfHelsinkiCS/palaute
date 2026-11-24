export const MAX_WIDTH = 980

const QUESTION_SHARE = 0.32
const QUESTION_MAX = '22rem'
export const COLUMN_GAP = 2
// Between the question and its answers
export const SECTION_GAP = 3

// Shared by the question blocks and the Likert table so that their columns line up
export const QUESTION_ROW_SX = {
  display: 'grid',
  alignItems: 'start',
  columnGap: SECTION_GAP,
  rowGap: 1.5,
  gridTemplateColumns: {
    xs: 'minmax(0, 1fr)',
    md: `minmax(0, min(${QUESTION_SHARE * 100}%, ${QUESTION_MAX})) minmax(0, 1fr)`,
  },
}
// As wide as beside the question at MAX_WIDTH, also when under it on narrow screens
const ANSWER_MAX_WIDTH = `calc(${MAX_WIDTH}px - min(${MAX_WIDTH * QUESTION_SHARE}px, ${QUESTION_MAX}) - ${SECTION_GAP * 8}px)`
export const ANSWER_SX = { minWidth: 0, maxWidth: ANSWER_MAX_WIDTH }

const COUNT_COLUMN_WIDTHS = ['2.5rem', '3rem']
export const COUNT_COLUMNS = COUNT_COLUMN_WIDTHS.join(' ')
// COLUMN_GAP is in theme spacing units of 8px
export const NUMBERS_WIDTH = `calc(${COUNT_COLUMN_WIDTHS.join(' + ')} + ${COLUMN_GAP * 8}px)`

// Ends a chart where the option bars of choice questions do
export const CHART_END = `calc(${NUMBERS_WIDTH} + ${COLUMN_GAP * 8}px)`
// On narrow screens the chart has no room beside it, but stays as wide as it is with it
export const CHART_SX = {
  pr: { md: CHART_END },
  maxWidth: { xs: `calc(${ANSWER_MAX_WIDTH} - ${CHART_END})`, md: 'none' },
}

export const BLOCK_CLASS = 'result-block'
