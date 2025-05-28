export interface Root {
  items: Item[]
  totalCount: number
}

export interface Item {
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
  tenNguoiNhan: string
  anhNguoiNhan: string
  status: number
  ngayTao: string
  ngaySua: string
}
