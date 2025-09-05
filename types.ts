
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface SummaryData {
  title: string;
  summaryPoints: string[];
  keyConcepts: KeyConcept[];
  activityFlow: string[];
  quiz: QuizQuestion[];
}