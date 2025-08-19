/**
 * Resize ảnh trước khi upload
 * @param file File ảnh gốc
 * @param maxWidth Chiều rộng tối đa
 * @param maxHeight Chiều cao tối đa
 * @param quality Chất lượng ảnh (0-1)
 * @returns Promise<File> File ảnh đã resize
 */
export const resizeImage = (
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw image trên canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert canvas về blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate file ảnh
 * @param file File cần validate
 * @returns object chứa isValid và error message
 */
export const validateImageFile = (file: File) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG, WEBP',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File ảnh không được vượt quá 5MB',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
