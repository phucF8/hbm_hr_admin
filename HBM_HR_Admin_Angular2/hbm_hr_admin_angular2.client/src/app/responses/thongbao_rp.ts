export interface ThongBaoRP {
  items: ThongBaoItem[]
  totalCount: number
}

export interface ThongBaoItem {
  id: string
  title: string
  content: string
  notificationType: number
  nguonUngDung: string
  loaiThongBao: string
  idThamChieu: string
  status: number
  platform: string
  ngayTao: string
  ngaySua: string
  nguoiTao: string
  nguoiSua: string
  tenNguoiTao: string
  anhNguoiTao: string
  selected: boolean
  danhSachNguoiNhan: DanhSachNguoiNhan[]
}

export interface DanhSachNguoiNhan {
  id: string
  idThongBao: string
  nguoiNhan: string
  maNhanVien: string
  tenNguoiNhan: string
  anhNguoiNhan: string
  tenChucDanh: string
  tenPhongBan: string
  status: number
  ngayTao: string
  ngaySua: string
}



