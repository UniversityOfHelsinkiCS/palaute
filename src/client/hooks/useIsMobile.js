import { useMediaQuery } from '@mui/material'

const useIsMobile = () => {
  const isMobile = useMediaQuery('(max-width:1000px)')

  return isMobile
}

export default useIsMobile
