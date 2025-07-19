export interface QuestionOption {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  title: string;
  type: 'multiple' | 'single' | 'text' | 'rating';
  options: QuestionOption[];
  collapsed: boolean;
}

export type QuestionType = 'multiple' | 'single' | 'text' | 'rating';