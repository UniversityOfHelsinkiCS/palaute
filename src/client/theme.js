import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { lightBlue, green, grey } from '@mui/material/colors'
import { useMemo } from 'react'

const useTheme = () => {
  const prefersDarkMode = false // useMediaQuery('(prefers-color-scheme: dark)')
  const mode = prefersDarkMode ? 'dark' : 'light'

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          typography: {
            fontFamily: [
              '"Open Sans"',
              '"Helvetica"',
              '"Arial"',
              '"sans-serif"',
              '"Apple Color Emoji"',
              '"Segoe UI Emoji"',
              '"Segoe UI Symbol"',
            ].join(','),
            fontWeightLight: 400,
            fontWeightRegular: 500,
            fontWeightMedium: 700,
            fontWeightBold: 800,
          },
          palette: {
            mode,
            ...(mode === 'light'
              ? {
                  primary: {
                    light: '#5c00a8',
                    main: '#4e008e',
                    dark: '#0e0021',
                  },
                  secondary: {
                    main: '#e6c309',
                  },
                  info: {
                    main: lightBlue[700],
                    light: lightBlue[500],
                    dark: lightBlue[900],
                  },
                  success: {
                    main: green[800],
                    light: green[500],
                    dark: green[900],
                  },
                  background: {
                    default: grey[50],
                  },
                  warning: {
                    main: '#e6c309',
                    light: '#ffd700',
                  },
                }
              : {}),
          },
          shape: {
            borderRadius: 6,
          },
          components: {
            MuiCssBaseline: {
              styleOverrides: `
                body {
                  height: 100vh;
                }
                ::-webkit-scrollbar {
                  width: 10,
                }
                ::-webkit-scrollbar-track {
                  borderRadius: 10,
                }
                ::-webkit-scrollbar-thumb {
                  background: theme.palette.primary.light,
                  borderRadius: 10,
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: theme.palette.info.main,
                }
              `,
            },
            MuiPaper: {
              defaultProps: {
                elevation: 2,
              },
              styleOverrides: {
                root: {
                  borderRadius: '0.8rem',
                },
              },
            },
            MuiCard: {
              defaultProps: {
                elevation: 2,
              },
              styleOverrides: {
                root: {
                  borderRadius: '0.8rem',
                },
              },
            },
            MuiAccordion: {
              defaultProps: {
                elevation: 2,
              },
              styleOverrides: {
                rounded: {
                  borderRadius: '0.8rem',
                },
              },
            },
            MuiAlert: {
              defaultProps: {
                elevation: 0,
              },
              styleOverrides: {
                standardInfo: {
                  boxShadow: `0 2px 8px 0 ${lightBlue[100]}`,
                },
              },
            },
            MuiButton: {
              styleOverrides: {
                containedPrimary: {
                  color: 'white',
                  background: 'rgb(78,0,142)',
                  boxShadow: '0 4px 14px 0 rgb(0 118 255 / 39%)',
                  '&:hover': {
                    background: 'rgb(92,0,168)',
                    boxShadow: '0 4px 14px 0 rgb(0 118 255 / 44%)',
                  },
                },
              },
            },
          },
        })
      ),
    [mode]
  )

  return theme
}

export default useTheme
