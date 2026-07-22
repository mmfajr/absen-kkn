"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCw, Crop, Check, Move } from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string, croppedFile: File) => void;
}

type AspectRatioOption = {
  label: string;
  value: number; // width / height ratio
};

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: "4:3 (Standar)", value: 4 / 3 },
  { label: "1:1 (Persegi)", value: 1 / 1 },
  { label: "16:9 (Wide)", value: 16 / 9 },
  { label: "3:4 (Potret)", value: 3 / 4 },
];

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load image element
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Reset offset on zoom or aspect change
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(1, Math.min(3, newZoom)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Dragging handlers for mouse & touch
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;
      setOffset({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, handlePointerMove]);

  // Perform canvas crop & export
  const handleSaveCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    setIsSaving(true);
    try {
      // Create output canvas with max resolution 1600px
      const targetWidth = 1600;
      const targetHeight = Math.round(targetWidth / aspectRatio);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Fill background (white for transparency fallback)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();

      // Move context to canvas center
      ctx.translate(targetWidth / 2, targetHeight / 2);

      // Apply user scale and rotation
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Normalize offset relative to container viewport size
      const container = containerRef.current;
      const containerWidth = container ? container.clientWidth : 300;
      const scaleFactor = targetWidth / containerWidth;

      ctx.translate((offset.x * scaleFactor) / zoom, (offset.y * scaleFactor) / zoom);

      // Draw original image centered
      const imgAspect = img.width / img.height;
      let drawW = targetWidth;
      let drawH = targetWidth / imgAspect;

      if (rotation % 180 !== 0) {
        // Swap dimensions if rotated 90 or 270 deg
        drawW = targetHeight;
        drawH = targetHeight * imgAspect;
      }

      if (drawH < targetHeight) {
        drawH = targetHeight;
        drawW = targetHeight * imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.restore();

      const quality = 0.85;
      const dataUrl = canvas.toDataURL("image/jpeg", quality);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File(
              [blob],
              `absen_crop_${Date.now()}.jpg`,
              { type: "image/jpeg", lastModified: Date.now() }
            );
            onCropComplete(dataUrl, croppedFile);
            onClose();
          }
          setIsSaving(false);
        },
        "image/jpeg",
        quality
      );
    } catch (err) {
      console.error("Error cropping image:", err);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <Crop className="w-5 h-5" />
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Edit &amp; Crop Foto
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Crop Viewport Box */}
          <div className="p-4 bg-gray-950 flex-1 flex flex-col items-center justify-center select-none overflow-hidden relative min-h-[260px]">
            <p className="text-[11px] font-medium text-gray-400 mb-2 flex items-center gap-1">
              <Move className="w-3 h-3 text-emerald-400" /> Geser foto untuk menyesuaikan posisi
            </p>

            <div
              ref={containerRef}
              style={{ aspectRatio: `${aspectRatio}` }}
              className="w-full max-w-sm max-h-[300px] relative overflow-hidden rounded-2xl border-2 border-emerald-500/80 shadow-2xl bg-black cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
              onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
            >
              {/* Overlay Grid lines for rule-of-thirds cropping */}
              <div className="absolute inset-0 pointer-events-none z-10 grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>

              {/* Transformed Preview Image */}
              {/* eslint-disable-next-ok-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Crop preview"
                className="max-w-none max-h-none pointer-events-none transition-transform duration-75"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          </div>

          {/* Controls Panel */}
          <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-xs">
            {/* Aspect Ratio Buttons */}
            <div>
              <span className="font-bold text-gray-500 block mb-1.5 uppercase text-[10px]">
                Rasio Foto:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {ASPECT_RATIOS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setAspectRatio(opt.value);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className={`py-1.5 px-2 rounded-xl font-bold transition text-center truncate ${
                      aspectRatio === opt.value
                        ? "bg-[#2E7D32] text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider & Rotate controls */}
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 font-bold text-[11px]">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-[#2E7D32]" /> Zoom:
                  </span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <ZoomOut
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => handleZoomChange(zoom - 0.2)}
                  />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-[#2E7D32]"
                  />
                  <ZoomIn
                    className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => handleZoomChange(zoom + 0.2)}
                  />
                </div>
              </div>

              {/* Rotate Button */}
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold flex items-center gap-1.5 shadow-sm hover:bg-gray-100 transition shrink-0"
                title="Putar 90 Derajat"
              >
                <RotateCw className="w-4 h-4 text-[#2E7D32]" />
                <span>Putar</span>
              </button>
            </div>

            {/* Action Buttons: Cancel / Save Crop */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-300 transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveCrop}
                disabled={isSaving}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Simpan Hasil Potongan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
