"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Camera, MapPin, Smartphone } from "lucide-react";

export default function PanduanPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-28">
      <Header />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
            Panduan & Informasi
          </h2>
          <p className="text-xs font-semibold text-emerald-800">
            KKN Tematik Lingkungan Hidup 2026 - Kelompok 10 Mentaos
          </p>
        </div>

        {/* PWA & Mobile Guide Card */}
        <div className="glass-card rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-[#2E7D32]">
            <Smartphone className="w-5 h-5" />
            <h3 className="text-sm font-extrabold text-gray-900">
              Penggunaan Aplikasi Lapangan (PWA)
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Aplikasi ini dirancang khusus untuk kenyamanan penggunaan satu tangan saat bertugas di lapangan Mentaos. Anda dapat memasangnya ke Layar Utama (Home Screen) HP Anda.
          </p>
        </div>

        {/* How to submit attendance step by step */}
        <div className="glass-card rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#2E7D32]" />
            <span>Alur Pengisian Absensi</span>
          </h3>

          <div className="space-y-3 text-xs text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#2E7D32] font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <p>
                Pilih nama Anda di halaman <strong>Beranda</strong> untuk membuka profil anggota.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#2E7D32] font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <p>
                Ketuk tombol <strong>Attendance Today</strong>. Jam absensi akan otomatis terisi waktu lokal terkini.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#2E7D32] font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <p>
                Ketuk <strong>Upload Foto Absensi</strong> untuk mengambil foto langsung dari kamera HP Anda. Sistem akan memeriksa metadata GPS dan mengompres foto secara otomatis.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#2E7D32] font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </div>
              <p>
                Ketuk <strong>Simpan Absensi Hari Ini</strong>. Absensi hanya dapat dikirim 1 kali per hari (atau via fitur Absensi Susulan 13-21 Juli).
              </p>
            </div>
          </div>
        </div>

        {/* Geotag GPS Information */}
        <div className="glass-card rounded-3xl p-5 space-y-2 border-emerald-500/20 bg-emerald-50/40">
          <div className="flex items-center gap-2 text-[#2E7D32]">
            <MapPin className="w-4 h-4" />
            <h4 className="text-xs font-extrabold text-gray-900">
              Pemeriksaan Geotag GPS Foto
            </h4>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed">
            Pastikan aplikasi kamera HP Anda telah mengaktifkan izin <strong>Lokasi/Tag GPS</strong>. Jika foto tidak mengandung koordinat GPS, absensi tetap dapat dikirim namun akan diberi catatan peringatan.
          </p>
        </div>

        {/* KKN 10 Mentaos Identity Card */}
        <div className="glass-card rounded-3xl p-6 text-center space-y-3 bg-gradient-to-br from-emerald-900 to-[#113614] text-white">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg">
            {/* eslint-disable-next-ok-line @next/next/no-img-element */}
            <img
              src="/icons/Logo KKN Mentos.png"
              alt="Logo KKN 10 Mentaos"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-base font-extrabold">
              KKN Tematik Lingkungan Hidup 2026
            </h3>
            <p className="text-xs text-emerald-200 font-medium mt-0.5">
              Kelompok 10 Mentaos — 16 Anggota
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
