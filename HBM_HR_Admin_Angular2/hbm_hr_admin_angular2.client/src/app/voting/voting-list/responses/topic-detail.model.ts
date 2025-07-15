export interface TopicDetail {
  id: string;
  title: string;
  description: string;
  startDate: string | null;   // ISO string, bạn có thể chuyển thành Date nếu cần
  endDate: string;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
