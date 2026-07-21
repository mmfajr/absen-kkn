"use client";

import { useEffect, useState, use, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Toast } from "@/components/Toast";
import {
  fetchMemberById,
  fetchAttendanceForMember,
  getTodayDateString,
  updateMemberAvatar,
  uploadAttendancePhoto,
} from "@/lib/db";
import { compressImage } from "@/lib/imageUtils";
import { useAppStore } from "@/lib/store";
import { Member, Attendance } from "@/types";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Camera,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useAppStore();

  const [member, setMember] = useState<Member | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const m = await fetchMemberById(id);
      if (m) {
        setMember(m);
        const logs = await fetchAttendanceForMember(id);
        setAttendanceLogs(logs);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;

    setIsUploadingAvatar(true);
    try {
      // 1. Compress Image
      const compressed = await compressImage(file, 800, 0.8);

      // 2. Upload photo
      const photoUrl = await uploadAttendancePhoto(compressed.file);

      // 3. Update DB & LocalStorage
      const success = await updateMemberAvatar(member.id, photoUrl);

      if (success) {
        setMember({ ...member, avatar_url: photoUrl });
        showToast("Foto profil berhasil diperbarui!", "success");
      } else {
        showToast("Gagal memperbarui foto profil", "error");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      showToast("Gagal mengunggah foto profil", "error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] pb-24">
        <Header />
        <main className="max-w-md mx-auto px-4 pt-6 space-y-4">
          <div className="h-64 rounded-3xl bg-emerald-900/5 animate-pulse" />
          <div className="h-20 rounded-2xl bg-emerald-900/5 animate-pulse" />
          <div className="h-20 rounded-2xl bg-emerald-900/5 animate-pulse" />
        </main>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] pb-24">
        <Header />
        <main className="max-w-md mx-auto px-4 pt-12 text-center space-y-4">
          <p className="text-base font-bold text-gray-700">Anggota tidak ditemukan</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-full bg-[#2E7D32] text-white text-xs font-bold"
          >
            Kembali ke Beranda
          </Link>
        </main>
      </div>
    );
  }

  const todayStr = getTodayDateString();
  const todayLog = attendanceLogs.find((l) => l.date === todayStr);
  const attendedToday = Boolean(todayLog);

  const totalDays = new Set(attendanceLogs.map((l) => l.date)).size;
  const totalHours = attendanceLogs.reduce((sum, l) => sum + (l.hours || 8), 0);

  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-28">
      <Header />
      <Toast />

      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full">
            Profil Anggota
          </span>
        </div>

        {/* Member Profile Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 text-center space-y-4 relative overflow-hidden"
        >
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                attendedToday
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              {attendedToday ? "Sudah Hadir Hari Ini" : "Belum Hadir"}
            </span>
          </div>

          {/* Photo / Avatar with Edit Camera Button */}
          <div className="relative w-28 h-28 mx-auto">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 text-emerald-900 font-extrabold text-3xl flex items-center justify-center border-2 border-white shadow-lg overflow-hidden relative">
              {isUploadingAvatar ? (
                <div className="flex flex-col items-center gap-1">
                  <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
                  <span className="text-[10px] font-bold text-emerald-900">Mengunggah...</span>
                </div>
              ) : member.avatar_url ? (
                // eslint-disable-next-ok-line @next/next/no-img-element
                <img
                  src={member.avatar_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Camera Overlay Icon Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-[#2E7D32] text-white shadow-lg hover:bg-[#1b5e20] active:scale-95 transition border-2 border-white"
              title="Ubah Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Explicit Change Photo Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="text-xs font-extrabold text-[#2E7D32] hover:text-[#1b5e20] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition inline-flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{member.avatar_url ? "Ubah Foto Profil" : "Tambah Foto Profil"}</span>
            </button>
          </div>

          {/* Name & Role */}
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
              {member.name}
            </h2>
            <p className="text-sm font-bold text-[#2E7D32] mt-1 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              {member.role}
            </p>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <div className="flex items-center justify-center gap-1 text-[#2E7D32] mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Total Hadir
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 leading-none">
                {totalDays}{" "}
                <span className="text-xs font-semibold text-gray-500">Hari</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <div className="flex items-center justify-center gap-1 text-[#2E7D32] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Jam Kerja
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 leading-none">
                {totalHours}{" "}
                <span className="text-xs font-semibold text-gray-500">Jam</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Large Touch Target Buttons */}
        <div className="space-y-3 pt-2">
          <Link href={`/member/${member.id}/attend`} className="block">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white font-extrabold text-base shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2.5 transition"
            >
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              <span>✅ Attendance Today</span>
            </motion.button>
          </Link>

          <Link href={`/member/${member.id}/history`} className="block">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-white hover:bg-emerald-50 border-2 border-emerald-600/30 text-emerald-950 font-extrabold text-base shadow-sm flex items-center justify-center gap-2.5 transition"
            >
              <Calendar className="w-6 h-6 text-[#2E7D32]" />
              <span>📅 Attendance History</span>
            </motion.button>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
