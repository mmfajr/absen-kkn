"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Users } from "lucide-react";

interface ProgressBannerProps {
  attendedCount: number;
  totalCount: number;
}

export function ProgressBanner({ attendedCount, totalCount }: ProgressBannerProps) {
  const percentage = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  return (
    <div className="glass-card rounded-3xl p-5 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-emerald-900">
              Progres Absensi Hari Ini
            </h3>
            <p className="text-lg font-extrabold text-gray-900 leading-none mt-0.5">
              {attendedCount} <span className="text-sm font-normal text-gray-500">/ {totalCount} Hadir</span>
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#2E7D32] text-white text-xs font-bold shadow-sm">
          {percentage}%
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full h-3 bg-emerald-950/10 rounded-full overflow-hidden p-0.5 border border-emerald-900/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#2E7D32] to-[#81C784] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-700">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>{totalCount - attendedCount} anggota belum absensi</span>
        </div>
        <span className="font-medium text-emerald-800">Kelompok 10</span>
      </div>
    </div>
  );
}
