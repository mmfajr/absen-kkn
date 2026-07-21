import { create } from "zustand";
import { MemberStats } from "@/types";
import { fetchMembersWithStats, sortMembersByRoleAndName } from "./db";
import { INITIAL_MEMBERS } from "./initialMembers";

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
      if (data && data.length > 0) {
        set({ members: sortMembersByRoleAndName(data), isLoading: false });
      } else {
        const fallback = sortMembersByRoleAndName(
          INITIAL_MEMBERS.map((m) => ({
            ...m,
            attendedToday: false,
            totalDays: 0,
            totalHours: 0,
          }))
        );
        set({ members: fallback as MemberStats[], isLoading: false });
      }
    } catch (err) {
      console.error("Failed to load members:", err);
      const fallback = sortMembersByRoleAndName(
        INITIAL_MEMBERS.map((m) => ({
          ...m,
          attendedToday: false,
          totalDays: 0,
          totalHours: 0,
        }))
      );
      set({ members: fallback as MemberStats[], isLoading: false });
    }
  },
}));
