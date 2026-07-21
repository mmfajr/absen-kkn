"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="mb-4 rounded-3xl p-5 border border-emerald-500/30 bg-gradient-to-br from-[#113614] via-[#1b5e20] to-[#2E7D32] text-white shadow-xl relative overflow-hidden">
      <button
        onClick={() => setShowBanner(false)}
        className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-white/70 hover:text-white bg-black/20 hover:bg-black/40 transition"
        aria-label="Tutup Banner PWA"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3.5 pr-8">
        <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-lg border border-white/20">
          {/* eslint-disable-next-ok-line @next/next/no-img-element */}
          <img
            src="/icons/Logo KKN Mentos.png"
            alt="Logo KKN Mentaos"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h4 className="text-base font-extrabold text-white leading-snug">
            Pasang Aplikasi Absensi KKN
          </h4>
          <p className="text-xs text-emerald-100 font-medium mt-0.5 leading-tight">
            Akses lebih cepat &amp; dapat digunakan secara offline di HP
          </p>
        </div>
      </div>

      <button
        onClick={handleInstallClick}
        className="mt-4 w-full py-3 rounded-2xl bg-white text-[#2E7D32] hover:bg-emerald-50 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition"
      >
        <Download className="w-4 h-4" />
        Tambahkan ke Layar Utama (Install PWA)
      </button>
    </div>
  );
}
