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
  createdByName: string;
  updatedByName?: string | null;
  questions: QuestionDto[];
}

export interface Question {
  id: string
  content: string
  type: string
  orderNumber: number
  options: Option[]
}

export interface Option {
  id: string
  content: string
  orderNumber: number
}


export interface QuestionDto {
  id: string;
  content: string;
  type: 'SingleChoice' | 'MultiChoice' | 'Essay';
  orderNumber?: number;
  options: Option[]
}

