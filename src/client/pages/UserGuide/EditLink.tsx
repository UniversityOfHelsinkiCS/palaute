import EditOutlined from '@mui/icons-material/EditOutlined'
import { IconButton, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'

const EditLink = ({ href }: { href: string }) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={t('userGuide:editOnGitHub')}>
      <IconButton component="a" href={href} target="_blank" rel="noopener noreferrer" size="small" sx={{ mt: 0.75 }}>
        <EditOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  )
}

export default EditLink
