import React, { useState } from 'react'
import { Button, MenuItem, Menu, Box } from '@mui/material'
import { Download } from '@mui/icons-material'

const styles = {
  container: {
    paddingLeft: '1rem',
    textAlign: 'left',
    '@media print': {
      display: 'none',
    },
  },
  menuitem: {
    cursor: 'pointer',
  },
}

const ExportButton = ({ CsvLink, PdfLink, label }) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = e => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={styles.container}>
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        color="primary"
        onClick={handleClick}
        endIcon={<Download />}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {CsvLink && (
          <MenuItem value="csv" sx={styles.menuitem}>
            {CsvLink}
          </MenuItem>
        )}
        {PdfLink && (
          <MenuItem value="pdf" sx={styles.menuitem}>
            {PdfLink}
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}

export default ExportButton
