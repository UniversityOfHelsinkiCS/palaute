import React, { useId, useState } from 'react'
import { Button, Menu, Box, MenuList } from '@mui/material'
import { Download } from '@mui/icons-material'

const styles = {
  container: {
    '@media print': {
      display: 'none',
    },
  },
  menu: {
    '& .MuiPaper-root': {
      minWidth: 180,
      color: 'rgb(55, 65, 81)',
      boxShadow:
        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      '& .MuiMenu-list': {
        padding: '4px 0',
      },
    },
  },
}

type ExportButtonProps = {
  label: string
  disabled?: boolean
  children: React.ReactNode
}

const ExportButton = ({ label, disabled = false, children }: ExportButtonProps) => {
  const menuId = useId()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box sx={styles.container}>
      <Button
        id="export-button"
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        color="primary"
        variant="outlined"
        startIcon={<Download />}
        disabled={disabled}
      >
        {label}
      </Button>
      <Menu
        id={menuId}
        aria-labelledby="export-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={styles.menu}
      >
        <MenuList dense>{children}</MenuList>
      </Menu>
    </Box>
  )
}

export default ExportButton
