using HBM_HR_Admin_Angular2.Server.Data;
using Microsoft.EntityFrameworkCore;
using System;

public class ReminderJob {
    private readonly ApplicationDbContext _db;
    private readonly FirebaseNotificationService _firebase;

    public ReminderJob(ApplicationDbContext db, FirebaseNotificationService firebase) {
        _db = db;
        _firebase = firebase;
    }

    public async Task CheckAndSendReminders() {
        var now = DateTime.Now;
        var nextMinute = now.AddMinutes(1);
        // Lấy danh sách nhắc việc sắp đến hạn
        var dueReminders = await _db.NV_NhacViec
            .Where(nv => !nv.IsSent  && !nv.DaXoa && nv.NgayGioNhac <= nextMinute)
            .ToListAsync();
        if (!dueReminders.Any())
            return;
        foreach (var reminder in dueReminders) {
            var tokens = await _db.NS_NhanVien_DeviceTokens
                .Where(u => u.IDNhanVien == reminder.UserID)
                .Select(u => u.DeviceToken)
                .ToListAsync();
            foreach (var token in tokens) {
                await _firebase.SendNotificationAsync(
                    token,
                    reminder.TieuDe,
                    reminder.GhiChu
                );
            }
            reminder.IsSent = true; // Đánh dấu đã gửi
        }
        await _db.SaveChangesAsync();
    }
}
