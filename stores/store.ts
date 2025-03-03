/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchUserData } from "@/actions/document"
import type { User } from "@/types/api"
import { create } from "zustand"

interface UserStore {
  user: User | null
  loading: boolean
  error: string | null
  fetchUser: (id: string) => Promise<void>
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetchUserData(id)
      set({ user: response.data, loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },
}))

export { useUserStore }

