/**
 * Utility functions for automatic bulletin calculations:
 * - Appréciation du conseil de classe
 * - Mentions (Distinctions & Sanctions)
 * - Automatic Ranking
 */

export const getAutoAppreciation = (avg: number): string => {
  if (isNaN(avg) || avg < 0) return 'Mauvais';
  if (avg < 10) return 'Mauvais';
  if (avg < 12) return 'Passable';  // 10 and 11
  if (avg < 14) return 'Bien';      // 12 and 13
  if (avg < 17) return 'Très bien'; // 14, 15, 16
  return 'Excellent';              // 17 and above
};

export const getAutoDistinctions = (avg: number): string[] => {
  if (isNaN(avg) || avg < 10) return [];
  if (avg >= 17) return ["Tableau d'honneur + félicitation"];
  if (avg >= 14) return ["Tableau d'honneur + encouragement"];
  if (avg >= 12) return ["Tableau d'honneur"];
  return [];
};

export const getAutoSanctions = (avg: number): string[] => {
  if (isNaN(avg) || avg >= 10) return [];
  if (avg < 7) return ["Blâme travail"];
  if (avg < 10) return ["Avertissement travail"];
  return [];
};
