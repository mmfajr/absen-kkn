"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { PhotoUploader } from "@/components/PhotoUploader";
import {
  fetchMemberById,
  fetchAttendanceForDate,
  getCurrentTimeString,
  getTodayDateString,
  uploadAttendancePhoto,
  submitAttendanceRecord,
} from "@/lib/db";
import { Member, Attendance } from "@/types";
import { GeotagResult } from "@/lib/imageUtils";
import { useAppStore } from "@/lib/store";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  TableProperties,
  History,
} from "lucide-react";
import { motion } from "framer-motion";

function AttendanceFormContent({ memberId }: { memberId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAppStore();

  const queryDate = searchParams.get("date");

  const [member, setMember] = useState<Member | null>(null);
  const [existingAttendance, setExistingAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Allowed dates for attendance (13 Juli 2026 - 21 Juli 2026)
  const allowedDates = [
    { value: "2026-07-13", label: "Senin, 13 Juli 2026" },
    { value: "2026-07-14", label: "Selasa, 14 Juli 2026" },
    { value: "2026-07-15", label: "Rabu, 15 Juli 2026" },
    { value: "2026-07-16", label: "Kamis, 16 Juli 2026" },
    { value: "2026-07-17", label: "Jumat, 17 Juli 2026" },
    { value: "2026-07-18", label: "Sabtu, 18 Juli 2026" },
    { value: "2026-07-19", label: "Minggu, 19 Juli 2026" },
    { value: "2026-07-20", label: "Senin, 20 Juli 2026" },
    { value: "2026-07-21", label: "Selasa, 21 Juli 2026 (Hari Ini)" },
  ];

  const defaultDate = queryDate && allowedDates.some((d) => d.value === queryDate)
    ? queryDate
    : getTodayDateString();

  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [photoData, setPhotoData] = useState<{
    compressedFile: File;
    dataUrl: string;
    geotag: GeotagResult;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setCurrentTime(getCurrentTimeString());

    async function loadData() {
      setIsLoading(true);
      const m = await fetchMemberById(memberId);
      if (m) {
        setMember(m);
        const log = await fetchAttendanceForDate(memberId, selectedDate);
        setExistingAttendance(log);
      }
      setIsLoading(false);
    }

    loadData();
  }, [memberId, selectedDate]);

  // Handle Date Dropdown change
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setIsLoading(true);
    const log = await fetchAttendanceForDate(memberId, newDate);
    setExistingAttendance(log);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    if (!photoData) {
      showToast("Silakan ambil atau unggah foto absensi terlebih dahulu", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload compressed photo
      const photoUrl = await uploadAttendancePhoto(photoData.compressedFile);

      // 2. Submit attendance record
      const record = await submitAttendanceRecord({
        member_id: member.id,
        date: selectedDate,
        time: currentTime || getCurrentTimeString(),
        photo_url: photoUrl,
        hours: 8, // Default 8 hours, can be customized in calendar detail modal
        has_geotag: photoData.geotag.hasGeotag,
        lat: photoData.geotag.lat,
        lng: photoData.geotag.lng,
        location_name: photoData.geotag.locationName || "Mentaos",
      });

      setExistingAttendance(record);
      setIsSuccess(true);

      // Fire confetti celebration animation
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2E7D32", "#81C784", "#4CAF50", "#FFD700"],
      });

      showToast("Absensi berhasil disimpan!", "success");
    } catch (err) {
      console.error("Submit attendance error:", err);
      showToast("Gagal menyimpan absensi. Silakan coba lagi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !member) {
    return (
      <div className="space-y-4">
        <div className="h-40 rounded-3xl bg-emerald-900/5 animate-pulse" />
        <div className="h-64 rounded-3xl bg-emerald-900/5 animate-pulse" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center pt-12">
        <p className="text-base font-bold text-gray-700">Anggota tidak ditemukan</p>
      </div>
    );
  }

  const isToday = selectedDate === getTodayDateString();
  const selectedDateLabel =
    allowedDates.find((d) => d.value === selectedDate)?.label || selectedDate;

  return (
    <div className="space-y-5">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/member/${member.id}`)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
            isToday
              ? "text-emerald-800 bg-emerald-100/60"
              : "text-amber-900 bg-amber-100 border border-amber-300"
          }`}
        >
          {!isToday && <History className="w-3.5 h-3.5 text-amber-700" />}
          {isToday ? "Absensi Hari Ini" : "Absensi Susulan (13-21 Juli)"}
        </span>
      </div>

      {/* Member Title Banner */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#2E7D32] text-white font-bold text-sm flex items-center justify-center shrink-0">
          {member.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-gray-900">{member.name}</h2>
          <p className="text-xs font-semibold text-emerald-800">{member.role}</p>
        </div>
      </div>

      {/* CASE A: Success Animation State */}
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-8 text-center space-y-6 shadow-xl border-emerald-500/30"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-[#2E7D32] flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">
              Absensi Berhasil Disimpan!
            </h3>
            <p className="text-sm text-emerald-900 font-medium mt-1">
              Absensi untuk <strong className="font-bold">{selectedDateLabel}</strong> telah dicatat.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <Link href={`/member/${member.id}/history`} className="block">
              <button className="w-full py-3.5 rounded-2xl bg-[#2E7D32] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Lihat Riwayat &amp; Tambah Jam Kerja
              </button>
            </Link>

            <Link href="/rekap" className="block">
              <button className="w-full py-3.5 rounded-2xl bg-white border border-emerald-900/15 text-gray-800 font-bold text-sm hover:bg-emerald-50 transition flex items-center justify-center gap-2">
                <TableProperties className="w-4 h-4" />
                Lihat Rekap Kelompok
              </button>
            </Link>
          </div>
        </motion.div>
      ) : existingAttendance ? (
        /* CASE B: Attendance already submitted for selected date */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 text-center space-y-5 border-emerald-500/20"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Anda sudah melakukan absensi pada tanggal ini.
            </h3>
            <p className="text-xs text-emerald-800 mt-1 font-semibold">
              {selectedDateLabel} — Pukul {existingAttendance.time} WITA
            </p>
          </div>

          {/* Show submitted photo preview */}
          {existingAttendance.photo_url && (
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-black max-w-xs mx-auto border border-emerald-900/10">
              {/* eslint-disable-next-ok-line @next/next/no-img-element */}
              <img
                src={existingAttendance.photo_url}
                alt="Foto Absensi"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <Link href={`/member/${member.id}/history`} className="block">
              <button className="w-full py-3.5 rounded-2xl bg-[#2E7D32] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Lihat Riwayat &amp; Input Jam Kerja
              </button>
            </Link>
          </div>
        </motion.div>
      ) : (
        /* CASE C: Submission Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date & Time Picker Container */}
          <div className="glass-card rounded-3xl p-5 space-y-4">
            {/* Date Selection Dropdown */}
            <div className="space-y-1.5 pb-3 border-b border-emerald-900/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2E7D32]" />
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Pilih Tanggal Absensi
                </label>
              </div>

              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-emerald-900/20 text-sm font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40"
              >
                {allowedDates.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Picker */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2E7D32]" />
                <span className="text-xs font-bold text-gray-500 uppercase">Jam Masuk Absensi</span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(e.target.value)}
                  required
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-900/20 text-sm font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40"
                />
                <span className="text-xs font-bold text-emerald-800">WITA</span>
              </div>
            </div>
          </div>

          {/* Photo Camera Capture & Compressor */}
          <div className="glass-card rounded-3xl p-5 space-y-3">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <span>Foto Kehadiran Lapangan</span>
            </h3>

            <PhotoUploader onPhotoSelected={(data) => setPhotoData(data)} />
          </div>

          {/* Large Submit Button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={isSubmitting || !photoData}
            className={`w-full py-4 rounded-2xl font-extrabold text-base shadow-lg flex items-center justify-center gap-2.5 transition ${
              photoData && !isSubmitting
                ? "bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white shadow-emerald-900/20 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mengompres &amp; Menyimpan...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Simpan Absensi</span>
              </>
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
}

export default function AttendanceTodayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-28">
      <Header />

      <main className="max-w-md mx-auto px-4 pt-4">
        <Suspense fallback={<div className="h-64 rounded-3xl bg-emerald-900/5 animate-pulse" />}>
          <AttendanceFormContent memberId={id} />
        </Suspense>
      </main>

      <BottomNav />
    </div>
  );
}
