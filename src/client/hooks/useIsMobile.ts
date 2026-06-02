import { useMediaQuery } from '@mui/material'

const useIsMobile = (): boolean => {
  const isMobile = useMediaQuery('(max-width:1000px)')
  return isMobile
}

export default useIsMobile
