import DownIcon from '@mui/icons-material/KeyboardArrowDown'
import UpIcon from '@mui/icons-material/KeyboardArrowUp'
import { IconButton, Tooltip, Box } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

const OrderButtons = ({ onMoveUp, onMoveDown, moveUpDisabled, moveDownDisabled }) => {
  const { t } = useTranslation()

  return (
    <Box display="inline-flex">
      <Tooltip title={t('questionEditor:moveUp')}>
        <div>
          <IconButton disabled={moveUpDisabled} onClick={onMoveUp} size="large">
            <UpIcon />
          </IconButton>
        </div>
      </Tooltip>

      <Tooltip title={t('questionEditor:moveDown')}>
        <div>
          <IconButton disabled={moveDownDisabled} onClick={onMoveDown} size="large">
            <DownIcon />
          </IconButton>
        </div>
      </Tooltip>
    </Box>
  )
}

export default OrderButtons
