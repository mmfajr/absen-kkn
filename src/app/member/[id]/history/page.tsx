"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { CalendarView } from "@/components/CalendarView";
import { HistoryModal } from "@/components/HistoryModal";
import { fetchMemberById, fetchAttendanceForMember } from "@/lib/db";
import { Member, Attendance } from "@/types";
import { ArrowLeft, Calendar as CalendarIcon, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function AttendanceHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const m = await fetchMemberById(id);
      if (m) {
        setMember(m);
        const logs = await fetchAttendanceForMember(id);
        setRecords(logs);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] pb-24">
        <Header />
        <main className="max-w-md mx-auto px-4 pt-6 space-y-4">
          <div className="h-20 rounded-2xl bg-emerald-900/5 animate-pulse" />
          <div className="h-80 rounded-3xl bg-emerald-900/5 animate-pulse" />
        </main>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] pb-24">
        <Header />
        <main className="max-w-md mx-auto px-4 pt-12 text-center">
          <p className="text-base font-bold text-gray-700">Anggota tidak ditemukan</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-28">
      <Header />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/member/${member.id}`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Riwayat Absensi
          </span>
        </div>

        {/* Member Title Banner */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E7D32] text-white font-bold text-sm flex items-center justify-center shrink-0">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">{member.name}</h2>
              <p className="text-xs font-semibold text-emerald-800">{member.role}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-500 font-semibold block">Total Hadir</span>
            <span className="text-base font-extrabold text-[#2E7D32]">
              {records.length} Hari
            </span>
          </div>
        </div>

        {/* Informational Tip Banner */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <p>
            <strong className="font-bold">Info Absensi Susulan:</strong> Ketuk tanggal bertanda <span className="font-bold text-[#2E7D32] underline">+ Absen</span> (13 - 21 Juli) untuk mengisi absensi yang terlewat.
          </p>
        </div>

        {/* Calendar View Component */}
        <CalendarView
          records={records}
          onSelectAttendance={(record) => setSelectedRecord(record)}
          onSelectUnattendedDate={(dateStr) =>
            router.push(`/member/${member.id}/attend?date=${dateStr}`)
          }
        />
      </main>

      {/* Floating Detail Modal */}
      <HistoryModal
        attendance={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      <BottomNav />
    </div>
  );
}
