import DownIcon from '@mui/icons-material/KeyboardArrowDown'
import UpIcon from '@mui/icons-material/KeyboardArrowUp'
import { IconButton, Tooltip, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { focusIndicatorStyle } from '../../util/accessibility'

const OrderButtons = ({ onMoveUp, onMoveDown, moveUpDisabled, moveDownDisabled }) => {
  const { t } = useTranslation()

  return (
    <Box display="inline-flex">
      {!moveUpDisabled && (
        <Tooltip title={t('questionEditor:moveUp')}>
          <IconButton onClick={onMoveUp} size="large" sx={focusIndicatorStyle()} disableFocusRipple>
            <UpIcon />
          </IconButton>
        </Tooltip>
      )}

      {!moveDownDisabled && (
        <Tooltip title={t('questionEditor:moveDown')}>
          <IconButton onClick={onMoveDown} size="large" sx={focusIndicatorStyle()} disableFocusRipple>
            <DownIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

export default OrderButtons
