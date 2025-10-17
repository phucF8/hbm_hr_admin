﻿using HBM_HR_Admin_Angular2.Server.Data;
using HBM_HR_Admin_Angular2.Server.Models;
using System;

namespace HBM_HR_Admin_Angular2.Server.Services {
    public class NotificationService {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context) {
            _context = context;
        }

        public async Task CreateThongBaoAsync(Guid IDNotify,bool isAnDanh, string tieuDe, string noiDung, string idNguoiGui, List<string> danhSachNguoiNhan) {
            var thongBaoId = Guid.NewGuid();
            var thongBao = new AD_ThongBao {
                ID = thongBaoId,
                IDNguoiGui = idNguoiGui,
                NgayGui = DateTime.Now,
                NoiDung = noiDung,
                NgayTao = DateTime.Now,
                NguoiTao = idNguoiGui,
                BusinessId = "GY", // hoặc tùy theo loại nghiệp vụ
                TrangThai = "MoiTao",
                TieuDe = tieuDe,
                NhomThongBao = "GopY",
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
    }

}
