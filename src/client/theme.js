import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'

import { inStaging } from '../config'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: !inStaging ? '#1077A1' : '#77dcbb',
    },
  },
})

export default responsiveFontSizes(theme)
