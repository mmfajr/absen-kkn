"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Camera, Image as ImageIcon, AlertTriangle, CheckCircle, RefreshCw, Upload } from "lucide-react";
import { extractGeotagFromImage, compressImage, GeotagResult } from "@/lib/imageUtils";

interface PhotoUploaderProps {
  onPhotoSelected: (data: {
    compressedFile: File;
    dataUrl: string;
    geotag: GeotagResult;
  }) => void;
}

export function PhotoUploader({ onPhotoSelected }: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [geotagResult, setGeotagResult] = useState<GeotagResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 1. Extract Geotag metadata
      const geotag = await extractGeotagFromImage(file);
      setGeotagResult(geotag);

      // 2. Compress Image
      const compressed = await compressImage(file, 1200, 0.75);
      setPreviewUrl(compressed.dataUrl);

      // 3. Callback parent
      onPhotoSelected({
        compressedFile: compressed.file,
        dataUrl: compressed.dataUrl,
        geotag,
      });
    } catch (err) {
      console.error("Error processing photo:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setGeotagResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Geotag Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Catatan:</strong> Pastikan foto masih memiliki geotag GPS. Jika metadata GPS tidak ditemukan, absensi tetap dapat dikirim namun akan muncul peringatan.
        </p>
      </div>

      {/* File Input allowing gallery photo selection with EXIF geotags */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-emerald-600/30 hover:border-emerald-600/60 rounded-3xl p-6 text-center cursor-pointer transition-all bg-emerald-50/40 hover:bg-emerald-50/70 flex flex-col items-center justify-center min-h-[200px]"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-emerald-800">
                Memproses & Memeriksa Metadata Foto...
              </p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3 shadow-sm">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-gray-900">
                Ambil Foto atau Pilih Gambar
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Ketuk untuk membuka kamera langsung di ponsel atau pilih foto dari galeri
              </p>
              <button
                type="button"
                className="mt-4 px-5 py-2 rounded-full bg-[#2E7D32] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Foto Absensi
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Photo Preview Container */}
          <div className="relative rounded-3xl overflow-hidden border border-emerald-900/10 shadow-md aspect-[4/3] bg-black">
            {/* eslint-disable-next-ok-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview Absensi"
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              onClick={handleReset}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1 hover:bg-black/80 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ganti Foto
            </button>
          </div>

          {/* GPS Geotag Status Result Badge */}
          {geotagResult && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${
                geotagResult.hasGeotag
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-900"
              }`}
            >
              {geotagResult.hasGeotag ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">GPS Terdeteksi: </span>
                    <span>{geotagResult.locationName}</span>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">⚠️ GPS Tidak Ditemukan: </span>
                    <span>Metadata lokasi tidak ada, namun absensi tetap dapat dikirim.</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
