"use client";

import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setFormattedDate(d.toLocaleDateString("id-ID", options));
  }, []);

  return (
    <header className="sticky top-0 z-30 glass-header px-4 py-3 sm:px-6">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-600/20 flex items-center justify-center shadow-sm shrink-0 overflow-hidden p-1">
            {/* eslint-disable-next-ok-line @next/next/no-img-element */}
            <img
              src="/icons/Logo KKN Mentos.png"
              alt="Logo KKN 10 Mentaos"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              KKN 10 Mentaos 2026
            </h1>
            <p className="text-xs font-medium text-emerald-800">
              Tematik Lingkungan Hidup
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </header>
  );
}
