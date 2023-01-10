import React from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { Check, ClearAll, Visibility, VisibilityOff } from '@mui/icons-material'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import useSummaryCustomisation from './useSummaryCustomisation'
import useOrganisations from '../../hooks/useOrganisations'
import { getLanguageValue } from '../../util/languageUtils'
import { TooltipButton } from '../../components/common/TooltipButton'

const HidingModeButton = ({ value, onClick, count }) => {
  const { t } = useTranslation()

  return (
    <Box mt="12rem">
      <Tooltip title={t('courseSummary:showHiddenOrganisations', { count })} placement="top">
        <ToggleButton value={value} onChange={onClick} color="primary">
          <Visibility />
        </ToggleButton>
      </Tooltip>
    </Box>
  )
}

const HiddenRows = () => {
  const [isHidingMode, setIsHidingMode] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [hiddenRows, setHiddenRows] = React.useState([])
  const { customisation, mutation, isLoading } = useSummaryCustomisation()
  const { organisations, isLoading: isOrganisationsLoading } = useOrganisations()
  const { t, i18n } = useTranslation()

  React.useEffect(() => {
    if (Array.isArray(customisation?.hiddenRows)) {
      setHiddenRows(customisation.hiddenRows)
    }
  }, [customisation?.hiddenRows, isHidingMode])

  const sortedOrganisations = React.useMemo(
    () =>
      !isOrganisationsLoading
        ? _.orderBy(
            organisations.map(org => ({
              ...org,
              isHidden: hiddenRows.includes(org.code),
            })),
            ['code']
          )
        : [],
    [organisations, hiddenRows]
  )

  if (isLoading || isOrganisationsLoading) return <Box />

  const count = hiddenRows?.length || 0

  const handleOpen = target => {
    setAnchorEl(target)
    setIsHidingMode(true)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setIsHidingMode(false)
  }

  const handleClick = event => {
    if (isHidingMode) {
      handleClose()
    } else {
      handleOpen(event.currentTarget)
    }
  }

  const handleSubmit = () => {
    handleClose()
    mutation.mutateAsync({
      ...customisation,
      hiddenRows,
    })
  }

  const handleClear = () => {
    setHiddenRows([])
  }

  const toggleHidden = code => {
    if (hiddenRows.includes(code)) {
      setHiddenRows(hiddenRows.filter(c => c !== code))
    } else {
      setHiddenRows(hiddenRows.concat(code))
    }
  }

  const isChanged =
    _.difference(hiddenRows, customisation?.hiddenRows).length +
      _.difference(customisation?.hiddenRows, hiddenRows).length >
    0

  return (
    <>
      <HidingModeButton value={isHidingMode} onClick={handleClick} count={count} />
      <Popover
        id={isHidingMode ? 'hidden-rows-popover' : undefined}
        open={isHidingMode}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box py="1rem">
          <Box
            px="1rem"
            display="flex"
            alignItems="center"
            position="sticky"
            top="0"
            py="0.5rem"
            zIndex={10}
            bgcolor="#ffffff"
          >
            <Typography fontWeight={500}>{t('courseSummary:showHiddenOrganisations', { count })}</Typography>
            <Box mr="auto" />
            <TooltipButton onClick={handleClear} variant="outlined" tooltip={t('common:clearSelection')} always>
              <ClearAll fontSize="small" />
            </TooltipButton>
            <Box mr="1rem" />
            <TooltipButton
              tooltip={t('common:accept')}
              color="primary"
              variant="contained"
              onClick={handleSubmit}
              disabled={!isChanged}
              always
            >
              <Check fontSize="small" />
            </TooltipButton>
          </Box>
          <Box px="1rem">
            <Typography variant="subtitle1" color="textSecondary" textAlign="left">
              {t('courseSummary:hidingInfo')}
            </Typography>
          </Box>
          <Box>
            <List>
              {sortedOrganisations.map(org => (
                <ListItem disablePadding key={org.code}>
                  <ListItemButton onClick={() => toggleHidden(org.code)}>
                    <ListItemText
                      primaryTypographyProps={{
                        color: org.isHidden ? 'textSecondary' : 'textPrimary',
                      }}
                      primary={getLanguageValue(org.name, i18n.language)}
                    />
                    <ListItemIcon>{org.isHidden ? <VisibilityOff color="disabled" /> : <Visibility />}</ListItemIcon>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Popover>
    </>
  )
}

export default HiddenRows
