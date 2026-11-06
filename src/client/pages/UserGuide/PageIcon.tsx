import AccountBalanceOutlined from '@mui/icons-material/AccountBalanceOutlined'
import ArticleOutlined from '@mui/icons-material/ArticleOutlined'
import HelpOutline from '@mui/icons-material/HelpOutline'
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined'
import OndemandVideoOutlined from '@mui/icons-material/OndemandVideoOutlined'
import SchoolOutlined from '@mui/icons-material/SchoolOutlined'

const ICONS: Record<string, typeof ArticleOutlined> = {
  basics: LightbulbOutlined,
  teachers: SchoolOutlined,
  programmes: AccountBalanceOutlined,
  help: HelpOutline,
  videos: OndemandVideoOutlined,
}

// The icon of a group's landing page or of a page outside the groups
const PageIcon = ({ slug, fontSize = 'small' }: { slug: string; fontSize?: 'small' | 'large' }) => {
  const Icon = ICONS[slug] ?? ArticleOutlined
  return <Icon fontSize={fontSize} sx={{ color: 'text.secondary' }} />
}

export default PageIcon
