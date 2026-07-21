"use client";

import { useState } from "react";
import { Attendance } from "@/types";
import { ChevronLeft, ChevronRight, Check, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CalendarViewProps {
  records: Attendance[];
  onSelectAttendance: (record: Attendance) => void;
  onSelectUnattendedDate?: (dateStr: string) => void;
}

export function CalendarView({
  records,
  onSelectAttendance,
  onSelectUnattendedDate,
}: CalendarViewProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 6, 1)); // Default July 2026

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Helper date calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Map records by YYYY-MM-DD
  const recordMap = new Map<string, Attendance>();
  records.forEach((rec) => recordMap.set(rec.date, rec));

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="glass-card rounded-3xl p-5 shadow-sm space-y-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-extrabold text-gray-900">
          {monthNames[month]} {year}
        </h3>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 transition"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 hover:bg-emerald-100 transition"
            aria-label="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {dayNames.map((d) => (
          <span key={d} className="text-xs font-bold text-gray-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {/* Empty leading cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-11 rounded-xl" />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const monthStr = String(month + 1).padStart(2, "0");
          const dayStr = String(dayNum).padStart(2, "0");
          const dateKey = `${year}-${monthStr}-${dayStr}`;

          const attendanceRecord = recordMap.get(dateKey);
          const isAttended = Boolean(attendanceRecord);

          // Allowed backdate range: 13 Juli 2026 - 21 Juli 2026
          const isAllowedBackdate =
            !isAttended && dateKey >= "2026-07-13" && dateKey <= "2026-07-21";

          const isClickable = isAttended || isAllowedBackdate;

          const handleClick = () => {
            if (isAttended && attendanceRecord) {
              onSelectAttendance(attendanceRecord);
            } else if (isAllowedBackdate && onSelectUnattendedDate) {
              onSelectUnattendedDate(dateKey);
            }
          };

          return (
            <motion.button
              key={dayNum}
              whileTap={isClickable ? { scale: 0.92 } : undefined}
              disabled={!isClickable}
              onClick={handleClick}
              className={`h-11 rounded-xl flex flex-col items-center justify-center relative text-xs font-bold transition-all ${
                isAttended
                  ? "bg-[#2E7D32] text-white shadow-sm hover:bg-[#1b5e20] cursor-pointer"
                  : isAllowedBackdate
                  ? "bg-emerald-100/70 border-2 border-dashed border-[#2E7D32] text-[#2E7D32] hover:bg-emerald-200/80 cursor-pointer shadow-xs"
                  : "bg-emerald-50/40 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              <span>{dayNum}</span>

              {isAttended && (
                <div className="absolute bottom-1 w-3.5 h-3.5 rounded-full bg-emerald-300 text-emerald-950 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {isAllowedBackdate && (
                <div className="absolute bottom-0.5 px-1 rounded-md bg-[#2E7D32] text-white text-[9px] font-extrabold flex items-center gap-0.5">
                  <Plus className="w-2 h-2 stroke-[3]" />
                  <span>Absen</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer Legend */}
      <div className="mt-3 pt-3 border-t border-emerald-900/10 space-y-2 text-xs font-medium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-md bg-[#2E7D32]" />
              <span className="text-gray-700 font-semibold">Hadir</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-md border-2 border-dashed border-[#2E7D32] bg-emerald-100 flex items-center justify-center text-[#2E7D32]">
                <Plus className="w-2.5 h-2.5" />
              </div>
              <span className="text-emerald-900 font-bold">Bisa Absen (13-21 Juli)</span>
            </div>
          </div>

          <span className="text-gray-500 font-semibold">Total: {records.length} Hari</span>
        </div>
      </div>
    </div>
  );
}
