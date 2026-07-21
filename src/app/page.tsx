"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ProgressBanner } from "@/components/ProgressBanner";
import { MemberCard } from "@/components/MemberCard";
import { PwaInstaller } from "@/components/PwaInstaller";
import { Toast } from "@/components/Toast";
import { useAppStore } from "@/lib/store";
import { Search, Filter, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const {
    members,
    searchQuery,
    statusFilter,
    isLoading,
    setSearchQuery,
    setStatusFilter,
    loadMembers,
  } = useAppStore();

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Compute metrics
  const totalCount = members.length;
  const attendedCount = members.filter((m) => m.attendedToday).length;

  // Filter members by search query & status filter
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "HADIR") return matchesSearch && m.attendedToday;
    if (statusFilter === "BELUM") return matchesSearch && !m.attendedToday;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-28">
      <Header />
      <Toast />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <PwaInstaller />

        {/* Today's Attendance Progress Widget */}
        <ProgressBanner attendedCount={attendedCount} totalCount={totalCount} />

        {/* Search Bar & Filter Tabs */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama anggota atau jabatan..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-card text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700 bg-gray-200/60 rounded-full w-5 h-5 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                statusFilter === "ALL"
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-emerald-900/10 hover:bg-emerald-50"
              }`}
            >
              Semua ({totalCount})
            </button>

            <button
              onClick={() => setStatusFilter("HADIR")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                statusFilter === "HADIR"
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-emerald-900/10 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Sudah Hadir ({attendedCount})
            </button>

            <button
              onClick={() => setStatusFilter("BELUM")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                statusFilter === "BELUM"
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-emerald-900/10 hover:bg-emerald-50"
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              Belum Hadir ({totalCount - attendedCount})
            </button>
          </div>
        </div>

        {/* Member Cards List Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
            Daftar Anggota Kelompok 10
          </h2>

          <button
            onClick={() => loadMembers()}
            className="p-1.5 rounded-full text-emerald-800 hover:bg-emerald-100 transition"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Member Cards List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-emerald-900/5 animate-pulse border border-emerald-900/5"
              />
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center space-y-2">
            <p className="text-base font-bold text-gray-700">
              Tidak ada anggota ditemukan
            </p>
            <p className="text-xs text-gray-500">
              Coba kata kunci pencarian lain atau sesuaikan filter status.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
