import { grey } from '@mui/material/colors'

export const boxPrintStyle = {
  // Improve printing
  '@media print': {
    boxShadow: 'none',
    backgroundColor: 'transparent',
    p: '0',
    borderBottom: `1px solid ${grey[300]}`,
    borderRadius: 0,
  },
}
