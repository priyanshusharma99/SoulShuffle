import api from './api';

// ─── Types ───────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  option_text: string;
  order_index: number;
}

export interface QuestionDependency {
  parent_question_id: string;
  required_option_id: string;
}

export interface Question {
  id: string;
  text: string;
  input_type: string; // 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TEXT' | 'SLIDER'
  order_index: number;
  question_options: QuestionOption[];
  question_dependencies: QuestionDependency[];
}

export interface AnswerPayload {
  question_id: string;
  selected_option_id?: string | null;
  text_value?: string | null;
}

// ─── FETCH QUESTIONNAIRE ─────────────────────────────────
export const fetchQuestionnaire = async (): Promise<Question[]> => {
  const response = await api.get('/questionnaire');
  return response.data.data.questions;
};

// ─── SUBMIT ANSWERS ──────────────────────────────────────
export const submitAnswers = async (answers: AnswerPayload[]) => {
  const response = await api.post('/questionnaire/answers', { answers });
  return response.data.data.answers;
};

// ─── GET MY ANSWERS ──────────────────────────────────────
export const getMyAnswers = async () => {
  const response = await api.get('/questionnaire/my-answers');
  return response.data.data.answers;
};
