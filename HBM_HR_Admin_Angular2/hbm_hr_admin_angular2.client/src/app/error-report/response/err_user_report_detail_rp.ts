export interface ErrorUserReportDetailRP {
  status: string
  message: string
  report: ErrUserReportDtail
}

export interface ErrUserReportDtail {
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
}
