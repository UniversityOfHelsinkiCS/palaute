import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'

import { inStaging } from '../config'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: !inStaging ? '#107eab' : '#77dcbb',
    },
  },
})

export default responsiveFontSizes(theme)
