"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Toast } from "@/components/Toast";
import { fetchMembersWithStats } from "@/lib/db";
import { MemberStats, GroupSummaryRow } from "@/types";
import { exportGroupSummaryToExcel } from "@/lib/excelExport";
import { useAppStore } from "@/lib/store";
import {
  Download,
  ArrowUpDown,
  Search,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { motion } from "framer-motion";

type SortKey = "NAME" | "ATTENDANCE" | "HOURS";

export default function RekapPage() {
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("NAME");
  const [sortAsc, setSortAsc] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useAppStore();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchMembersWithStats();
      setMembers(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "NAME"); // default A-Z for name, high-low for numbers
    }
  };

  // Convert to summary rows
  const summaryRows: GroupSummaryRow[] = members.map((m) => ({
    member: m,
    attendedToday: m.attendedToday,
    totalDays: m.totalDays,
    totalHours: m.totalHours,
  }));

  // Filter & Sort
  const filteredRows = summaryRows.filter(
    (r) =>
      r.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredRows.sort((a, b) => {
    if (sortKey === "NAME") {
      return sortAsc
        ? a.member.name.localeCompare(b.member.name)
        : b.member.name.localeCompare(a.member.name);
    }
    if (sortKey === "ATTENDANCE") {
      return sortAsc ? a.totalDays - b.totalDays : b.totalDays - a.totalDays;
    }
    if (sortKey === "HOURS") {
      return sortAsc ? a.totalHours - b.totalHours : b.totalHours - a.totalHours;
    }
    return 0;
  });

  const handleExportExcel = () => {
    try {
      exportGroupSummaryToExcel(filteredRows);
      showToast("File Excel Rekap Kelompok berhasil diunduh!", "success");
    } catch (err) {
      console.error("Export excel error:", err);
      showToast("Gagal mengunduh file Excel.", "error");
    }
  };

  // Metrics
  const totalMembers = members.length;
  const totalDaysGroup = members.reduce((sum, m) => sum + m.totalDays, 0);
  const totalHoursGroup = members.reduce((sum, m) => sum + m.totalHours, 0);

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-28">
      <Header />
      <Toast />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Page Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
              Rekap Kelompok
            </h2>
            <p className="text-xs font-semibold text-emerald-800">
              Absensi KKN 10 Mentaos 2026
            </p>
          </div>

          {/* Export to Excel Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-2xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold shadow-md flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </motion.button>
        </div>

        {/* Group Totals Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="glass-card rounded-2xl p-3 text-center">
            <Users className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Anggota</p>
            <p className="text-lg font-extrabold text-gray-900 leading-none mt-0.5">
              {totalMembers}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-3 text-center">
            <Calendar className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Hari</p>
            <p className="text-lg font-extrabold text-gray-900 leading-none mt-0.5">
              {totalDaysGroup}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-3 text-center">
            <Clock className="w-4 h-4 text-[#2E7D32] mx-auto mb-1" />
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Jam</p>
            <p className="text-lg font-extrabold text-gray-900 leading-none mt-0.5">
              {totalHoursGroup}
            </p>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam rekap..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-card text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40"
            />
          </div>

          {/* Sorting Buttons Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-gray-500 shrink-0 mr-1">
              Urutkan:
            </span>

            <button
              onClick={() => handleSortChange("NAME")}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shrink-0 transition ${
                sortKey === "NAME"
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-emerald-900/10"
              }`}
            >
              <span>Nama</span>
              <ArrowUpDown className="w-3 h-3 opacity-80" />
            </button>

            <button
              onClick={() => handleSortChange("ATTENDANCE")}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shrink-0 transition ${
                sortKey === "ATTENDANCE"
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-emerald-900/10"
              }`}
            >
              <span>Hari Hadir</span>
              <ArrowUpDown className="w-3 h-3 opacity-80" />
            </button>

            <button
              onClick={() => handleSortChange("HOURS")}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shrink-0 transition ${
                sortKey === "HOURS"
                  ? "bg-[#2E7D32] text-white shadow-sm"
                  : "bg-white text-gray-700 border border-emerald-900/10"
              }`}
            >
              <span>Total Jam</span>
              <ArrowUpDown className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>

        {/* Data List / Table */}
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-emerald-900/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredRows.map((row) => (
              <motion.div
                key={row.member.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-3.5 flex items-center justify-between hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                    {row.member.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-extrabold text-gray-900 truncate">
                      {row.member.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-emerald-800 truncate">
                      {row.member.role}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-extrabold text-gray-900">
                      {row.totalDays} Hari
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs font-extrabold text-[#2E7D32]">
                      {row.totalHours} Jam
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-bold">
                    {row.attendedToday ? (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Hadir Hari Ini
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-0.5">
                        <XCircle className="w-3 h-3 text-rose-500" />
                        Belum Hadir
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
