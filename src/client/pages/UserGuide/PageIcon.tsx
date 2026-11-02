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
const PageIcon = ({ slug }: { slug: string }) => {
  const Icon = ICONS[slug] ?? ArticleOutlined
  return <Icon fontSize="small" />
}

export default PageIcon
