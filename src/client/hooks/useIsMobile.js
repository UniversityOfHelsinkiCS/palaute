import { useMediaQuery } from '@mui/material'

const useIsMobile = () => {
  const isMobile = useMediaQuery('(max-width:700px)')

  return isMobile
}

export default useIsMobile
