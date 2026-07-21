"use client";

import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function Toast() {
  const { toastMessage, clearToast } = useAppStore();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto pointer-events-auto"
        >
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl shadow-xl backdrop-blur-xl border ${
              toastMessage.type === "success"
                ? "bg-emerald-900/90 text-white border-emerald-500/30"
                : toastMessage.type === "error"
                ? "bg-rose-900/90 text-white border-rose-500/30"
                : "bg-gray-900/90 text-white border-gray-700/50"
            }`}
          >
            {toastMessage.type === "success" && (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            )}
            {toastMessage.type === "error" && (
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            {toastMessage.type === "info" && (
              <Info className="w-6 h-6 text-blue-400 shrink-0" />
            )}

            <p className="text-sm font-medium flex-1">{toastMessage.text}</p>

            <button
              onClick={clearToast}
              className="p-1 text-white/70 hover:text-white rounded-full transition"
              aria-label="Close Toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
