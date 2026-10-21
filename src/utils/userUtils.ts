/**
 * Utility functions for User Profile, Images, and Role Formatting
 */

export const compressImage = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error("Le fichier sélectionné n'est pas une image valide."));
      return;
    }
    
    // Limit max raw file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("L'image est trop lourde (maximum 10 Mo)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Erreur de chargement de l'image."));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const getDefaultAvatar = (name?: string) => {
  const cleanName = name ? encodeURIComponent(name.trim()) : 'Utilisateur';
  return `https://ui-avatars.com/api/?name=${cleanName}&background=0284c7&color=fff&bold=true`;
};

export const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'director': return 'Prof';
    case 'educator': return 'Éducateur';
    case 'teacher': return 'Professeur';
    case 'cashier': return 'Caissier';
    case 'student': return 'Élève';
    case 'parent': return 'Parent d\'élève';
    case 'admin': return 'Administrateur';
    default: return 'Utilisateur';
  }
};
