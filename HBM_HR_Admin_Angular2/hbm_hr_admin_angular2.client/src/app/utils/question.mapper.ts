import { QuestionViewModel, QuestionDto } from "@app/voting/voting-list/responses/topic-detail.model";

export function mapToDto(questions: QuestionViewModel[]): QuestionDto[] {

    return questions.map(q => ({
      id: q.id,
      content: q.content,
      type: q.type,
      orderNumber: q.orderNumber,
      options: q.options.map(opt => ({
        id: opt.id,
        content: opt.content,
        orderNumber: opt.orderNumber
      }))
    }));
  
}
