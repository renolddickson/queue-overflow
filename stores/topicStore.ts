import { create } from 'zustand'
import { Topics, SubTopic } from '@/types/api'
import { fetchTopics } from '@/actions/document'

interface TopicStore {
  topics: Topics[]
  loader: boolean
  error: string | null
  lastDocId: string | null
  setTopics: (topics: Topics[]) => void
  setLoader: (loader: boolean) => void
  fetchAllTopics: (docId: string, force?: boolean) => Promise<void>
  addTopicOptimistic: (tempTopic: Topics) => void
  updateTopicOptimistic: (topicId: string, updatedFields: Partial<Topics>) => void
  removeTopicOptimistic: (topicId: string) => void
  addSubTopicOptimistic: (topicId: string, tempSubTopic: SubTopic) => void
  updateSubTopicOptimistic: (topicId: string, subTopicId: string, updatedFields: Partial<SubTopic>) => void
  removeSubTopicOptimistic: (topicId: string, subTopicId: string) => void
  isDirty: boolean
  setIsDirty: (isDirty: boolean) => void
}

export const useTopicStore = create<TopicStore>((set, get) => ({
  topics: [],
  loader: false,
  error: null,
  lastDocId: null,
  isDirty: false,
  setTopics: (topics) => set({ topics }),
  setLoader: (loader) => set({ loader }),
  setIsDirty: (isDirty) => set({ isDirty }),
  fetchAllTopics: async (docId, force = false) => {
    if (!force && get().lastDocId === docId && get().topics.length > 0) return
    
    set({ loader: true, error: null, lastDocId: docId })
    try {
      const res = await fetchTopics(docId)
      set({ topics: res.data || [], loader: false })
    } catch (error: any) {
      set({ error: error.message, loader: false })
    }
  },
  addTopicOptimistic: (tempTopic) => 
    set((state) => ({ topics: [...state.topics, tempTopic] })),
  updateTopicOptimistic: (topicId, updatedFields) =>
    set((state) => ({
      topics: state.topics.map((t) => (t.id === topicId ? { ...t, ...updatedFields } : t)),
    })),
  removeTopicOptimistic: (topicId) =>
    set((state) => ({ topics: state.topics.filter((t) => t.id !== topicId) })),
  addSubTopicOptimistic: (topicId, tempSubTopic) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId ? { ...t, subTopics: [...t.subTopics, tempSubTopic] } : t
      ),
    })),
  updateSubTopicOptimistic: (topicId, subTopicId, updatedFields) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subTopics: t.subTopics.map((s) => (s.id === subTopicId ? { ...s, ...updatedFields } : s)),
            }
          : t
      ),
    })),
  removeSubTopicOptimistic: (topicId, subTopicId) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId
          ? { ...t, subTopics: t.subTopics.filter((s) => s.id !== subTopicId) }
          : t
      ),
    })),
}))
