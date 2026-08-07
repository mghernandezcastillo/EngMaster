import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { StoreState } from '../types';

// Custom storage object for idb-keyval
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      darkMode: true,
      language: 'es',
      progress: {},
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setLanguage: (lang) => set({ language: lang }),
      updateProgress: (lessonId, stage, score = 0) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: {
              lessonId,
              stage,
              score,
              lastStudied: new Date().toISOString(),
            },
          },
        })),
    }),
    {
      name: 'english-mastery-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
