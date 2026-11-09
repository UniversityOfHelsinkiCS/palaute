export const boxPrintStyle = {
  // Improve printing
  '@media print': {
    boxShadow: 'none',
    backgroundColor: 'transparent',
    p: '0',
    borderRadius: 0,
  },
}

// Outlined cards and accordions are printed without their outline
export const cardPrintStyle = {
  '@media print': {
    ...boxPrintStyle['@media print'],
    border: 'none',
  },
}
