import { create } from 'zustand'

interface TryonHistory {
  id: string
  type: 'recommendation' | 'directTryon'
  originalProductUrl?: string
  finalTryonUrl: string
  timestamp: number
}

type PendingTask =
  | {
      type: 'onboarding'
      payload: {
        height: string
        weight: string
        file: File
      }
    }
  | {
      type: 'recommendation'
      payload: {
        query: string
      }
    }
  | {
      type: 'directTryon'
      payload: {
        file: File
      }
    }

type LastResult =
  | {
      type: 'onboarding'
      avatarUrl: string
    }
  | {
      type: 'recommendation'
      stylingSuggestion: string
      generatedProductUrl: string
      finalTryonUrl: string
    }
  | {
      type: 'directTryon'
      finalTryonUrl: string
    }

interface AppState {
  userId: string
  setUserId: (id: string) => void

  baseAvatarUrl: string | null
  setBaseAvatarUrl: (url: string | null) => void
  height: string
  setHeight: (h: string) => void
  weight: string
  setWeight: (w: string) => void

  pendingTask: PendingTask | null
  setPendingTask: (task: PendingTask | null) => void

  isLoading: boolean
  setIsLoading: (v: boolean) => void
  loadingStage: number
  setLoadingStage: (idx: number) => void

  error: string | null
  setError: (msg: string | null) => void

  lastResult: LastResult | null
  setLastResult: (r: LastResult | null) => void

  history: TryonHistory[]
  addHistory: (item: TryonHistory) => void
  clearHistory: () => void
}

export const useAppStore = create<AppState>((set) => ({
  userId: 'test_user_001',
  setUserId: (id) => set({ userId: id }),

  baseAvatarUrl: null,
  setBaseAvatarUrl: (url) => set({ baseAvatarUrl: url }),
  height: '',
  setHeight: (h) => set({ height: h }),
  weight: '',
  setWeight: (w) => set({ weight: w }),

  pendingTask: null,
  setPendingTask: (task) => set({ pendingTask: task }),

  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),
  loadingStage: 0,
  setLoadingStage: (idx) => set({ loadingStage: idx }),

  error: null,
  setError: (msg) => set({ error: msg }),

  lastResult: null,
  setLastResult: (r) => set({ lastResult: r }),

  history: [],
  addHistory: (item) => set((state) => ({ history: [item, ...state.history] })),
  clearHistory: () => set({ history: [] }),
}))
