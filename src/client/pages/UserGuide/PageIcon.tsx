import { ArticleOutlined, HelpOutline, OndemandVideoOutlined } from '@mui/icons-material'

const ICONS: Record<string, typeof ArticleOutlined> = { help: HelpOutline, videos: OndemandVideoOutlined }

// The icon of a page outside the groups
const PageIcon = ({ slug }: { slug: string }) => {
  const Icon = ICONS[slug] ?? ArticleOutlined
  return <Icon fontSize="small" />
}

export default PageIcon
