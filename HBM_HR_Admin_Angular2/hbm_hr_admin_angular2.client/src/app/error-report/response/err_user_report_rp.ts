export type ErrorUserReportRP = ErrUserReportItem[]

export interface ErrUserReportItem {

  id: number
  username: string
  tenNhanVien: string
  apiUrl: string
  requestJson: string
  responseJson: string
  versionApp: string
  device: string
  createdAt: string
  notes: string
  selected?: boolean
  status: number
}
