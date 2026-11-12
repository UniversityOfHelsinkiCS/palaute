import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
/** @jsxImportSource @emotion/react */
import merge from 'lodash/merge'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import hyLogo from '../../assets/hy_logo.svg'
import { focusIndicatorStyle, focusPageStart } from '../../util/accessibility'
import { useUiConfig } from '../CustomUiConfigProvider'

const styles = {
  focusTarget: {
    display: 'block',
    padding: '7px 12px',
    paddingLeft: '4px',
    marginRight: 4,
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    transition: 'background-color 0.1s',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
    },
    ...focusIndicatorStyle({ color: 'white' }),
  },
  link: {
    alignItems: 'end',
    display: 'inline-flex',
    textDecoration: 'none',
    color: 'white',
  },
  image: {
    width: '2.5rem',
    height: 'auto',
  },
  text: {
    fontSize: '18px',
    fontWeight: '700',
    marginLeft: '1rem',
    paddingBottom: '0.2rem',
    textTransform: 'uppercase',
  },
}

// reloadHome: load the front page through the browser so that Shibboleth can start a new login
const Logo = ({ guest = false, reloadHome = false }) => {
  const { t } = useTranslation()
  const customUiConfig = useUiConfig()
  const customStyles = customUiConfig?.styles?.logo ?? {}
  const logoStyles = merge(styles, customStyles)
  const customLogo = customUiConfig?.images?.logo

  return (
    <ButtonBase
      component={Link}
      to={guest && !reloadHome ? '/noad' : '/'}
      reloadDocument={reloadHome}
      aria-label={t('navBar:norppa')}
      disableRipple
      onClick={focusPageStart}
      sx={styles.focusTarget}
    >
      <Box sx={logoStyles.link}>
        <img src={customLogo || hyLogo} alt="" aria-hidden="true" style={logoStyles.image} />
        <span style={logoStyles.text}>Norppa</span>
      </Box>
    </ButtonBase>
  )
}

export default Logo
