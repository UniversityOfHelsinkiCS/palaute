import { ArticleOutlined, OndemandVideoOutlined } from '@mui/icons-material'

// The icon of a page outside the groups
const PageIcon = ({ slug }: { slug: string }) =>
  slug === 'videos' ? <OndemandVideoOutlined fontSize="small" /> : <ArticleOutlined fontSize="small" />

export default PageIcon
