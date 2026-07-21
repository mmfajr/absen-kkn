"use client";

import { useState, useEffect } from "react";
import { Attendance } from "@/types";
import { updateAttendanceHours } from "@/lib/db";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Edit2,
  Save,
  Check,
} from "lucide-react";

interface HistoryModalProps {
  attendance: Attendance | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export function HistoryModal({ attendance, onClose, onUpdated }: HistoryModalProps) {
  const { showToast } = useAppStore();
  const [hoursVal, setHoursVal] = useState<number>(8);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (attendance) {
      setHoursVal(attendance.hours || 8);
      setIsEditingHours(false);
    }
  }, [attendance]);

  if (!attendance) return null;

  // Format Date (e.g. "Selasa, 21 Juli 2026")
  const formattedDate = new Date(attendance.date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSaveHours = async () => {
    setIsSaving(true);
    try {
      const success = await updateAttendanceHours(attendance.id, Number(hoursVal) || 8);
      if (success) {
        attendance.hours = Number(hoursVal) || 8;
        showToast("Jam kerja berhasil diperbarui!", "success");
        setIsEditingHours(false);
        if (onUpdated) onUpdated();
      } else {
        showToast("Gagal memperbarui jam kerja.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyimpan jam kerja.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Floating Modal Box with Scale & Fade animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative z-10 w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl bg-white/95 overflow-hidden space-y-4"
        >
          {/* Top header bar */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-[#2E7D32]" />
              <span>Detail Absensi</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Preview */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-emerald-900/10 shadow-sm">
            {/* eslint-disable-next-ok-line @next/next/no-img-element */}
            <img
              src={attendance.photo_url}
              alt="Foto Absensi"
              className="w-full h-full object-cover"
            />

            {/* GPS Tag Badge on top of image */}
            <div className="absolute bottom-2 left-2 right-2">
              <div
                className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-semibold flex items-center gap-1.5 text-white ${
                  attendance.has_geotag ? "bg-emerald-900/80" : "bg-amber-900/80"
                }`}
              >
                {attendance.has_geotag ? (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">GPS Verified ({attendance.location_name || "Mentaos"})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tanpa Metadata GPS</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Information Details */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-emerald-800 uppercase">Tanggal</p>
                <p className="font-bold text-gray-900">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-emerald-800 uppercase">Jam Masuk Absensi</p>
                <p className="font-bold text-gray-900">{attendance.time} WITA</p>
              </div>
            </div>

            {/* Section: Total Jam Kerja (Editable) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#2E7D32]" />
                  <span className="text-xs font-extrabold text-emerald-950 uppercase">
                    Total Jam Kerja
                  </span>
                </div>

                {!isEditingHours ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingHours(true)}
                    className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Jam</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700">Input Jam</span>
                )}
              </div>

              {!isEditingHours ? (
                <div className="flex items-baseline justify-between pt-1">
                  <p className="text-xl font-extrabold text-gray-900">
                    {attendance.hours || 8} <span className="text-xs text-gray-500">Jam</span>
                  </p>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    (Ketuk "Edit Jam" untuk mengubah)
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={hoursVal}
                      onChange={(e) => setHoursVal(Number(e.target.value))}
                      className="w-20 px-3 py-1.5 rounded-xl bg-white border border-emerald-900/30 text-sm font-extrabold text-gray-900 text-center"
                    />
                    <span className="text-xs font-bold text-gray-700">Jam Kerja</span>
                  </div>

                  {/* Quick Select Presets */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[4, 6, 8, 10].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHoursVal(h)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          hoursVal === h
                            ? "bg-[#2E7D32] text-white"
                            : "bg-white text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {h} Jam
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSaveHours}
                      disabled={isSaving}
                      className="flex-1 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Jam Kerja</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingHours(false)}
                      className="px-3 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold text-xs"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-bold text-sm shadow-md transition"
          >
            Tutup
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
