// This utility simulates an advanced AI document enhancement pipeline
// using HTML5 Canvas filters to achieve a "scanned" professional look.

export const enhanceDocument = (dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Limit resolution slightly for performance if the image is massive,
      // but keep it high enough for "pro" quality.
      const MAX_DIM = 3000;
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context'));

      // Apply a combination of filters to simulate document enhancement:
      // - contrast(160%): Makes text pop and background closer to white
      // - brightness(115%): Brightens up dark/shadowy phone photos
      // - saturate(60%): Reduces color noise often found in low-light photos
      // - unsharp mask (approximated via crisp-edges/rendering if applicable, though filter covers a lot)
      ctx.filter = 'contrast(160%) brightness(115%) saturate(60%)';
      
      // We draw the image with the filter applied
      ctx.drawImage(img, 0, 0, width, height);

      // Output as high-quality JPEG
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    
    img.onerror = () => reject(new Error('Failed to load image for processing'));
    img.src = dataUrl;
  });
};
