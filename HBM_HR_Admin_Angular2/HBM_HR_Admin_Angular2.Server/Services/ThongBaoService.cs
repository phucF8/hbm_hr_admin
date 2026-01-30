using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using System;

namespace HBM_HR_Admin_Angular2.Server.Services {

    public static class ThongBaoNhom {
        public const string GopY = "GopY";
        public const string DwhLog = "DWH_log";
    }

    public class NotificationService {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context) {
            _context = context;
        }

        public async Task CreateThongBaoAsync(Guid IDNotify,bool isAnDanh, string tieuDe, string idNguoiGui, List<string> danhSachNguoiNhan) {
            var thongBaoId = Guid.NewGuid();
            var thongBao = new AD_ThongBao {
                ID = thongBaoId,
                IDNguoiGui = idNguoiGui,
                NgayGui = DateTime.Now,
                NoiDung = "",
                NgayTao = DateTime.Now,
                NguoiTao = idNguoiGui,
                BusinessId = "GY", // hoặc tùy theo loại nghiệp vụ
                TrangThai = "MoiTao",
                TieuDe = tieuDe,
                NhomThongBao = ThongBaoNhom.GopY,
                AnDanh =  isAnDanh,
                IDNotify = IDNotify.ToString(),
            };
            _context.AD_ThongBao.Add(thongBao);
            foreach (var nhan in danhSachNguoiNhan) {
                var nguoiNhan = new AD_ThongBao_NguoiNhan {
                    ID = Guid.NewGuid(),
                    IDThongBao = thongBaoId,
                    IDNhanSu = nhan,
                    TrangThai = 0,
                    NgayDoc = null
                };
                _context.AD_ThongBao_NguoiNhan.Add(nguoiNhan);
            }
            try {
                await _context.SaveChangesAsync();
            } catch (Exception ex) {
                Console.WriteLine($"❌ Lỗi khi lưu: {ex.InnerException?.Message ?? ex.Message}");
                throw;
            }
        }

        public async Task CreateThongBaoDwhLogAsync(
            Guid IDNotify,
            string tieuDe,
            string idNguoiGui,
            List<string> danhSachNguoiNhan
        ) {
            var thongBaoId = Guid.NewGuid();

            var thongBao = new AD_ThongBao {
                ID = thongBaoId,
                IDNguoiGui = idNguoiGui,
                NgayGui = DateTime.Now,
                NoiDung = "",
                NgayTao = DateTime.Now,
                NguoiTao = idNguoiGui,
                BusinessId = ThongBaoNhom.DwhLog,
                TrangThai = "MoiTao",
                TieuDe = tieuDe,
                NhomThongBao = ThongBaoNhom.DwhLog,   // ✅ khác GopY
                AnDanh = false,            // DWH không cần ẩn danh
                IDNotify = IDNotify.ToString(),
            };

            _context.AD_ThongBao.Add(thongBao);

            foreach (var nhan in danhSachNguoiNhan) {
                _context.AD_ThongBao_NguoiNhan.Add(new AD_ThongBao_NguoiNhan {
                    ID = Guid.NewGuid(),
                    IDThongBao = thongBaoId,
                    IDNhanSu = nhan,
                    TrangThai = 0,
                    NgayDoc = null
                });
            }

            try {
                await _context.SaveChangesAsync();
            } catch (Exception ex) {
                Console.WriteLine(
                    $"❌ Lỗi lưu thông báo DWH: {ex.InnerException?.Message ?? ex.Message}"
                );
                throw;
            }
        }


    }

}
