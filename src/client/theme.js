import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#107eab',
    },
  },
})

export default responsiveFontSizes(theme)
