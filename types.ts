
export enum QuestionCategory {
  SINGLE = 'SINGLE',
  MULTI = 'MULTI',
  BOOLEAN = 'BOOLEAN',
  COLLECTION_SINGLE = 'COLLECTION_SINGLE',
  COLLECTION_MULTI = 'COLLECTION_MULTI',
  COLLECTION_BOOLEAN = 'COLLECTION_BOOLEAN',
  MOCK = 'MOCK'
}

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  options?: string[]; // For single/multi choice
  correctAnswers: string[]; // Array of correct option indices (as strings "0", "1") or boolean values represented as strings "true"/"false"
  explanation?: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: Record<string, string[]>; // questionId -> selected option indices
  isFinished: boolean;
}

export interface AppState {
  view: 'HOME' | 'QUIZ' | 'COLLECTION_MENU';
  activeCategory: QuestionCategory | null;
}
