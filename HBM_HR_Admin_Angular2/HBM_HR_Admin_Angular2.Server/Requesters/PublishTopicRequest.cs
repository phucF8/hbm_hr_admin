namespace HBM_HR_Admin_Angular2.Server.Requesters {
    public class PublishTopicRequest {
        /// <summary>
        /// Id của Topic cần phát hành
        /// </summary>
        public string TopicId { get; set; }

        /// <summary>
        /// Id người thực hiện phát hành (nếu bạn muốn lưu log)
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Ghi chú hoặc lý do phát hành (tuỳ nhu cầu)
        /// </summary>
        public string? Note { get; set; }
    }
}
