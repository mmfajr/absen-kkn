import { create } from "zustand";
import { MemberStats } from "@/types";
import { fetchMembersWithStats } from "./db";

interface AppState {
  members: MemberStats[];
  searchQuery: string;
  roleFilter: string;
  statusFilter: "ALL" | "HADIR" | "BELUM";
  isLoading: boolean;
  toastMessage: { text: string; type: "success" | "error" | "info" } | null;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: string) => void;
  setStatusFilter: (filter: "ALL" | "HADIR" | "BELUM") => void;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
  loadMembers: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  members: [],
  searchQuery: "",
  roleFilter: "ALL",
  statusFilter: "ALL",
  isLoading: true,
  toastMessage: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setRoleFilter: (role) => set({ roleFilter: role }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  showToast: (text, type = "success") => {
    set({ toastMessage: { text, type } });
    setTimeout(() => {
      if (get().toastMessage?.text === text) {
        set({ toastMessage: null });
      }
    }, 4000);
  },

  clearToast: () => set({ toastMessage: null }),

  loadMembers: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchMembersWithStats();
      set({ members: data, isLoading: false });
    } catch (err) {
      console.error("Failed to load members:", err);
      set({ isLoading: false });
    }
  },
}));
