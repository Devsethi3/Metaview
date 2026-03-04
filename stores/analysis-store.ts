// stores/analysis-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AnalysisResult, HistoryItem } from "@/types";

interface AnalysisState {
  // Current analysis
  currentUrl: string | null;
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;

  // History
  history: HistoryItem[];

  // Actions
  setUrl: (url: string) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setResult: (result: AnalysisResult) => void;
  setError: (error: string | null) => void;
  clearResult: () => void;

  // History actions
  addToHistory: (item: HistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUrl: null,
      isAnalyzing: false,
      result: null,
      error: null,
      history: [],

      // Actions
      setUrl: (url) => set({ currentUrl: url }),
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setResult: (result) => {
        const historyItem: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: result.url,
          analyzedAt: result.analyzedAt,
          score: result.score.total,
          grade: result.score.grade,
          passCount: result.score.passCount,
          warningCount: result.score.warningCount,
          failCount: result.score.failCount,
        };

        const currentHistory = get().history;
        // Remove duplicate URL if exists, keep only latest
        const filteredHistory = currentHistory.filter(
          (h) => h.url !== result.url,
        );

        set({
          result,
          error: null,
          history: [historyItem, ...filteredHistory].slice(0, 50), // Keep last 50
        });
      },
      setError: (error) => set({ error, isAnalyzing: false }),
      clearResult: () => set({ result: null, error: null, currentUrl: null }),

      // History actions
      addToHistory: (item) =>
        set((state) => ({
          history: [
            item,
            ...state.history.filter((h) => h.url !== item.url),
          ].slice(0, 50),
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "metaview-storage",
      storage: createJSONStorage(() => {
        // Handle SSR by checking if window is defined
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({ history: state.history }),
    },
  ),
);
