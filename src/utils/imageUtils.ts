/**
 * Removes black/dark background from an uploaded image (e.g. JPEG)
 * and converts it into a transparent PNG so that the letters and graphic
 * merge 100% seamlessly into the interface background.
 */
export function removeBlackBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner pixels to determine dark background values
        const samplePoints = [
          0,
          (canvas.width - 1) * 4,
          ((canvas.height - 1) * canvas.width) * 4,
          ((canvas.height - 1) * canvas.width + canvas.width - 1) * 4,
        ];

        let bgR = 0;
        let bgG = 0;
        let bgB = 0;
        samplePoints.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR /= 4;
        bgG /= 4;
        bgB /= 4;

        const avgBrightness = (bgR + bgG + bgB) / 3;

        // If corners are black or dark (JPEG compression usually has noise < 65)
        if (avgBrightness < 65) {
          const threshold = Math.max(38, avgBrightness + 16);
          const feather = 20;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

            if (dist < threshold) {
              data[i + 3] = 0; // Make pure black 100% transparent
            } else if (dist < threshold + feather) {
              // Smooth antialiased blend on edges
              const factor = (dist - threshold) / feather;
              data[i + 3] = Math.round(data[i + 3] * factor);
            }
          }
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(dataUrl);
        }
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
