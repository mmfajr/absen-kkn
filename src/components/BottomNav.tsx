"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TableProperties, Info } from "lucide-react";
import { motion } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Beranda", href: "/", icon: Home },
    { label: "Rekap Kelompok", href: "/rekap", icon: TableProperties },
    { label: "Panduan", href: "/panduan", icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav px-4 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center py-1 px-4 rounded-2xl transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-700/10 border border-emerald-600/20 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 z-10 transition-colors ${
                  isActive ? "text-[#2E7D32]" : "text-gray-400"
                }`}
              />
              <span
                className={`text-[11px] font-semibold mt-1 z-10 transition-colors ${
                  isActive ? "text-[#2E7D32]" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
