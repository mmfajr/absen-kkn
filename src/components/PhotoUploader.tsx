"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Camera, CheckCircle, RefreshCw, Upload, Crop } from "lucide-react";
import { extractGeotagFromImage, compressImage, GeotagResult } from "@/lib/imageUtils";
import { ImageCropModal } from "@/components/ImageCropModal";

interface PhotoUploaderProps {
  onPhotoSelected: (data: {
    compressedFile: File;
    dataUrl: string;
    geotag: GeotagResult;
  }) => void;
}

export function PhotoUploader({ onPhotoSelected }: PhotoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [geotagResult, setGeotagResult] = useState<GeotagResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 1. Extract Geotag metadata
      const geotag = await extractGeotagFromImage(file);
      setGeotagResult(geotag);

      // 2. Compress Image with higher resolution (1600px, 0.85 quality)
      const compressed = await compressImage(file, 1600, 0.85);
      setPreviewUrl(compressed.dataUrl);
      setOriginalDataUrl(compressed.dataUrl);

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
    setOriginalDataUrl(null);
    setGeotagResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async (croppedDataUrl: string, croppedFile: File) => {
    setPreviewUrl(croppedDataUrl);

    // Re-compress cropped file if needed and update parent
    onPhotoSelected({
      compressedFile: croppedFile,
      dataUrl: croppedDataUrl,
      geotag: geotagResult || { hasGeotag: false },
    });
  };

  return (
    <div className="space-y-4">
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
          className="border-2 border-dashed border-emerald-600/30 hover:border-emerald-600/60 rounded-3xl p-6 text-center cursor-pointer transition-all bg-emerald-50/40 hover:bg-emerald-50/70 flex flex-col items-center justify-center min-h-[220px]"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-emerald-800">
                Memproses & Memeriksa Foto...
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
                Ketuk untuk mengambil foto langsung dari kamera atau galeri ponsel Anda
              </p>
              <button
                type="button"
                className="mt-4 px-5 py-2 rounded-full bg-[#2E7D32] text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-[#1b5e20] transition"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Foto Absensi
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Photo Preview Container with expanded display size */}
          <div className="relative rounded-3xl overflow-hidden border border-emerald-900/10 shadow-md bg-slate-950 flex items-center justify-center max-h-[380px] min-h-[220px]">
            {/* eslint-disable-next-ok-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview Absensi"
              className="w-full h-auto max-h-[380px] object-contain"
            />
          </div>

          {/* Action Buttons: Ganti Foto & Edit / Crop Foto */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white border border-emerald-900/15 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-emerald-50 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Ganti Foto</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCropModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm hover:bg-emerald-100 transition"
            >
              <Crop className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Edit / Crop Foto</span>
            </button>
          </div>

          {/* GPS Geotag Status Result Badge (Only show GREEN if GPS detected) */}
          {geotagResult?.hasGeotag && (
            <div className="p-3 rounded-2xl text-xs flex items-center gap-2 border bg-emerald-500/10 border-emerald-500/30 text-emerald-900">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">GPS Terdeteksi: </span>
                <span>{geotagResult.locationName}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Crop Modal */}
      {previewUrl && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageSrc={originalDataUrl || previewUrl}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
