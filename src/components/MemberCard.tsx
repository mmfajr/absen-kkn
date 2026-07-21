"use client";

import Link from "next/link";
import { MemberStats } from "@/types";
import { ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";

interface MemberCardProps {
  member: MemberStats;
}

export function MemberCard({ member }: MemberCardProps) {
  // Get initials for avatar
  const initials = member.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Link href={`/member/${member.id}`} className="block">
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -2 }}
        className="glass-card rounded-2xl p-4 flex items-center justify-between transition-all hover:border-emerald-600/30 hover:shadow-md"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-900 font-bold text-sm flex items-center justify-center border border-emerald-300/40 shadow-inner">
              {member.avatar_url ? (
                // eslint-disable-next-ok-line @next/next/no-img-element
                <img
                  src={member.avatar_url}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Green / Red Dot Indicator */}
            <div
              className={`absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                member.attendedToday
                  ? "bg-emerald-500 pulse-status-green"
                  : "bg-rose-500"
              }`}
              title={member.attendedToday ? "Sudah Hadir Hari Ini" : "Belum Hadir Hari Ini"}
            />
          </div>

          {/* Name & Role */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-semibold text-gray-400 shrink-0">
                {member.attendedToday ? "🟢" : "🔴"}
              </span>
              <h4 className="text-base font-bold text-gray-900 truncate leading-snug">
                {member.name}
              </h4>
            </div>

            <p className="text-xs font-semibold text-emerald-800 tracking-wide">
              {member.role}
            </p>
          </div>
        </div>

        {/* Action arrow */}
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0 ml-2">
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>
    </Link>
  );
}
