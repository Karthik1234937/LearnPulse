
export interface User {
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  occupation?: string;
  learningGoal?: string;
  preferredLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  viewedCourses?: Course[]; // Renamed from savedCourses
  enrolledCourseIds?: string[]; 
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SkillScore {
  subject: string;
  score: number; // 0-100
  fullMark: number;
}

export interface Course {
  id: string;
  title: string;
  provider: string; 
  rating: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  imageUrl: string;
  url: string; 
  price: string; 
  isFree: boolean;
  duration: string; 
  durationHours: number; 
  tags: string[];
  recommendationType: 'CONTENT_MATCH' | 'NEURAL_PREDICT';
  matchReason: string;
  matchScore: number;
}

export interface MistakeAnalysis {
  explanation: string;
  contrastReasoning: string;
  resources: { title: string, url: string }[];
}

export interface AssessmentResult {
  id?: string;
  domain: string;
  scores: SkillScore[];
  weakAreas: string[];
  strengths: string[];
  recommendations: Course[];
  date: string;
  overallScore: number;
  learningPersona: string;
  userAnswers?: Record<string, number>;
  questions?: Question[];
}

export interface QuizHistory {
  id?: string;
  date: string;
  score: number;
  domain: string;
  metadata?: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FeedbackSubmission {
  rating: number;
  category: string;
  comment: string;
  context?: {
    lastDomain?: string;
    lastScore?: number;
  };
  aiAnalysis?: string;
}

export type AppState = 'LOGIN' | 'VERIFY_CODE' | 'DASHBOARD' | 'QUIZ_CONFIG' | 'TAKING_QUIZ' | 'RESULTS' | 'PROFILE' | 'HISTORY_LIST' | 'SAVED_COURSES' | 'FEEDBACK' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';
