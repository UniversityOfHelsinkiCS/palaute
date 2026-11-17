// Wider, the questions drift too far from their answers
export const MAX_WIDTH = 980

// Shared by the question blocks and the Likert table so that their columns line up
export const QUESTION_COLUMN = 'minmax(0, min(32%, 22rem))'
export const COLUMN_GAP = 2
// Between the question and its answers
export const SECTION_GAP = 3

// The count and share of each option
const COUNT_COLUMN_WIDTHS = ['2.75rem', '3.25rem']
export const COUNT_COLUMNS = COUNT_COLUMN_WIDTHS.join(' ')
// From the end of an option's bar to the right edge, COLUMN_GAP being in theme spacing units of 8px
export const NUMBERS_WIDTH = `calc(${COUNT_COLUMN_WIDTHS.join(' + ')} + ${COLUMN_GAP * 8}px)`

// Marks the question blocks, so that the list can draw a line after each of them
export const BLOCK_CLASS = 'result-block'
