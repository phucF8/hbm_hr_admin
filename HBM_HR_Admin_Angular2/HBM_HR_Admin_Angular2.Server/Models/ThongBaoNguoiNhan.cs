using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HBM_HR_Admin_Angular2.Server.Models
{

    [Table("NS_ADTB_NotificationRecipients")]
    public class ThongBaoNguoiNhan
    {
        [Key]
        [StringLength(36)]
        public string ID { get; set; }

        [Required]
        [StringLength(36)]
        public string IDThongBao { get; set; }

        [Required]
        [StringLength(36)]
        public string NguoiNhan { get; set; }

        [Required]
        public byte Status { get; set; }

        [Required]
        public DateTime NgayTao { get; set; }

        [Required]
        public DateTime NgaySua { get; set; }

        [Required]
        [StringLength(36)]
        public string NguoiTao { get; set; }

        [StringLength(36)]
        public string NguoiSua { get; set; }
    }
}

