export type BannerData = {
  text: { fi: string; sv: string; en: string }
  color: string
}

export type BannerAccessGroup = 'STUDENT' | 'TEACHER' | 'ORG' | 'ADMIN'

export type BannerRecord = {
  id: number
  data: BannerData
  accessGroup: BannerAccessGroup
  startDate: string
  endDate: string
}
