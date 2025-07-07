export interface TopicDetail {
  id: string;
  title: string;
  description: string;
  startDate: string;   // ISO string, bạn có thể chuyển thành Date nếu cần
  endDate: string;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
