import { Helmet } from 'react-helmet'

const Title = ({ children }: { children: string }) => (
  <Helmet>
    <title>{children}</title>
  </Helmet>
)

export default Title
