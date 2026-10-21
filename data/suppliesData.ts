import { cleanUtf8, cleanObjectUtf8 } from '../src/utils/encodingUtils';

export interface SchoolSupply {
  id: string;
  className: string;
  subject: string;
  item: string;
  quantity: number;
  isMandatory: boolean;
  notes?: string;
  image?: string;
}

export const DEFAULT_SUPPLIES_BY_CLASS: Record<string, SchoolSupply[]> = {};

export const getSuppliesForClass = (className: string): SchoolSupply[] => {
  if (!className) return [];
  const normalizedClass = cleanUtf8(className).trim().toLowerCase();

  try {
    const saved = localStorage.getItem(`school_supplies_store`);
    if (saved) {
      const allParsed: Record<string, SchoolSupply[]> = JSON.parse(saved);
      // Case-insensitive & trimmed matching of key
      const matchedKey = Object.keys(allParsed).find(
        key => key.trim().toLowerCase() === normalizedClass
      );

      if (matchedKey && Array.isArray(allParsed[matchedKey])) {
        // Filter out legacy mock items (exact mock IDs only)
        return allParsed[matchedKey].filter(s => 
          s && s.id && 
          s.id !== 'sup-1' && 
          s.id !== 'sup-2' && 
          s.id !== 'sup-30' && 
          !s.id.startsWith('sup-gen-') && 
          !s.id.startsWith('mock-')
        );
      }
    }
  } catch (e) {
    console.error("Error reading supplies from localStorage", e);
  }

  return [];
};

export const saveSuppliesForClass = (className: string, supplies: SchoolSupply[]): void => {
  if (!className) return;
  const normalizedClass = cleanUtf8(className).trim();

  try {
    const saved = localStorage.getItem(`school_supplies_store`);
    let allParsed: Record<string, SchoolSupply[]> = saved ? JSON.parse(saved) : {};
    
    // Remove stale key with different spacing/case if present
    const existingKey = Object.keys(allParsed).find(
      key => key.trim().toLowerCase() === normalizedClass.toLowerCase()
    );
    if (existingKey && existingKey !== normalizedClass) {
      delete allParsed[existingKey];
    }

    allParsed[normalizedClass] = cleanObjectUtf8(supplies);
    localStorage.setItem(`school_supplies_store`, JSON.stringify(allParsed));
    // Trigger custom event so other components reload immediately
    window.dispatchEvent(new CustomEvent('supplies-updated', { detail: { className: normalizedClass } }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error("Error saving supplies to localStorage", e);
  }
};
