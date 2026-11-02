import {
  AccountBalanceOutlined,
  ArticleOutlined,
  HelpOutline,
  LightbulbOutlined,
  OndemandVideoOutlined,
  SchoolOutlined,
} from '@mui/icons-material'

const ICONS: Record<string, typeof ArticleOutlined> = {
  basics: LightbulbOutlined,
  teachers: SchoolOutlined,
  programmes: AccountBalanceOutlined,
  help: HelpOutline,
  videos: OndemandVideoOutlined,
}

// The icon of a group's landing page or of a page outside the groups
const PageIcon = ({ slug, fontSize = 'small' }: { slug: string; fontSize?: 'small' | 'medium' | 'large' }) => {
  const Icon = ICONS[slug] ?? ArticleOutlined
  return <Icon fontSize={fontSize} sx={{ color: 'text.secondary' }} />
}

export default PageIcon
