export interface Word {
  expression: string;
  meaning: string;
  microExample: string;
  microExampleTranslation: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  memoryMap: string[];
  vocabulary: Word[];
  collocations: string[];
  structures: string[];
  image: string;
}

export interface UserProgress {
  lessonId: string;
  stage: 'intro' | 'memorize' | 'test' | 'completed';
  score: number;
  lastStudied: string;
}

export interface StoreState {
  darkMode: boolean;
  language: 'es' | 'en';
  progress: Record<string, UserProgress>;
  toggleDarkMode: () => void;
  setLanguage: (lang: 'es' | 'en') => void;
  updateProgress: (lessonId: string, stage: UserProgress['stage'], score?: number) => void;
}
