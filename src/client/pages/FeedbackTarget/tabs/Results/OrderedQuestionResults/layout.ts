export const MAX_WIDTH = 980

// Shared by the question blocks and the Likert table so that their columns line up
export const QUESTION_COLUMN = 'minmax(0, min(32%, 22rem))'
export const COLUMN_GAP = 2
// Between the question and its answers
export const SECTION_GAP = 3

const COUNT_COLUMN_WIDTHS = ['2.5rem', '3rem']
export const COUNT_COLUMNS = COUNT_COLUMN_WIDTHS.join(' ')
// COLUMN_GAP is in theme spacing units of 8px
export const NUMBERS_WIDTH = `calc(${COUNT_COLUMN_WIDTHS.join(' + ')} + ${COLUMN_GAP * 8}px)`

// Ends a chart where the option bars of choice questions do
export const CHART_SX = { pr: { md: `calc(${NUMBERS_WIDTH} + ${COLUMN_GAP * 8}px)` } }

export const BLOCK_CLASS = 'result-block'
