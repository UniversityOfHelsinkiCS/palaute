import React from 'react'

import { IconButton, Tooltip, Box } from '@material-ui/core'
import UpIcon from '@material-ui/icons/KeyboardArrowUp'
import DownIcon from '@material-ui/icons/KeyboardArrowDown'
import { useTranslation } from 'react-i18next'

const OrderButtons = ({
  onMoveUp,
  onMoveDown,
  moveUpDisabled,
  moveDownDisabled,
}) => {
  const { t } = useTranslation()

  return (
    <Box display="inline-flex">
      <Tooltip title={t('questionEditor:moveUp')}>
        <div>
          <IconButton disabled={moveUpDisabled} onClick={onMoveUp}>
            <UpIcon />
          </IconButton>
        </div>
      </Tooltip>

      <Tooltip title={t('questionEditor:moveDown')}>
        <div>
          <IconButton disabled={moveDownDisabled} onClick={onMoveDown}>
            <DownIcon />
          </IconButton>
        </div>
      </Tooltip>
    </Box>
  )
}

export default OrderButtons
