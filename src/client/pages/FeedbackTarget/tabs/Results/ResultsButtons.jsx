import { Box } from '@mui/material'

import { mergeSx } from '../../../../util/sx'

/**
 * Row of results actions, such as the chart and table toggle and the export menu.
 * On narrow screens the buttons stack and take the full width.
 */
const ResultsButtons = ({ children, sx }) => (
  <Box
    sx={mergeSx(
      {
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'flex-end',
        gap: 1,
        width: { xs: '100%', sm: 'auto' },
        '& button': { width: { xs: '100%', sm: 'auto' } },
      },
      sx
    )}
  >
    {children}
  </Box>
)

export default ResultsButtons
