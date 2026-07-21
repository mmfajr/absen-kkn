import ExifReader from "exifreader";

export interface GeotagResult {
  hasGeotag: boolean;
  lat?: number;
  lng?: number;
  locationName?: string;
  errorMessage?: string;
}

/**
 * Extracts GPS metadata from image file using ExifReader.
 */
export async function extractGeotagFromImage(file: File): Promise<GeotagResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer);

    if (tags.GPSLatitude && tags.GPSLongitude) {
      let lat = tags.GPSLatitude.description;
      let lng = tags.GPSLongitude.description;

      const numericLat = typeof lat === "number" ? lat : parseFloat(String(lat));
      const numericLng = typeof lng === "number" ? lng : parseFloat(String(lng));

      // Handle GPS ref (N/S, E/W)
      const latRefStr = tags.GPSLatitudeRef ? String(tags.GPSLatitudeRef.value) : "N";
      const lngRefStr = tags.GPSLongitudeRef ? String(tags.GPSLongitudeRef.value) : "E";
      const latRef = latRefStr.charAt(0);
      const lngRef = lngRefStr.charAt(0);

      let finalLat = numericLat;
      let finalLng = numericLng;

      if (!isNaN(numericLat) && latRef.toUpperCase() === "S") {
        finalLat = -Math.abs(numericLat);
      }
      if (!isNaN(numericLng) && lngRef.toUpperCase() === "W") {
        finalLng = -Math.abs(numericLng);
      }

      if (!isNaN(finalLat) && !isNaN(finalLng)) {
        return {
          hasGeotag: true,
          lat: Number(finalLat.toFixed(6)),
          lng: Number(finalLng.toFixed(6)),
          locationName: `Mentaos (${finalLat.toFixed(4)}, ${finalLng.toFixed(4)})`,
        };
      }
    }

    return {
      hasGeotag: false,
      errorMessage: "Metadata GPS tidak ditemukan pada file foto ini.",
    };
  } catch (error) {
    console.warn("Exif parsing error:", error);
    return {
      hasGeotag: false,
      errorMessage: "Tidak dapat membaca EXIF header foto.",
    };
  }
}

/**
 * Compresses image file client-side using Canvas API to max width/height of 1200px and JPEG quality 0.7.
 * Returns a Data URL string and a compressed File blob.
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.75
): Promise<{ dataUrl: string; file: File }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context creation failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Blob creation failed"));
              return;
            }
            const compressedFile = new File([blob], `absen_${Date.now()}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve({ dataUrl, file: compressedFile });
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
