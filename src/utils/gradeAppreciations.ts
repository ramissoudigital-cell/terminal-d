export interface AppreciationOption {
  defaultAppreciation: string;
  suggestions: string[];
  color: string;
}

export const getGradeAppreciations = (scoreNum: number, maxScoreNum: number = 20): AppreciationOption => {
  if (isNaN(scoreNum) || scoreNum === null || scoreNum === undefined) {
    return {
      defaultAppreciation: '',
      suggestions: [],
      color: 'slate'
    };
  }

  // Normalize to scale of 20
  const normScore = maxScoreNum > 0 ? (scoreNum / maxScoreNum) * 20 : scoreNum;

  if (normScore >= 18) {
    return {
      defaultAppreciation: "Parfait ! Excellent travail",
      suggestions: ["Parfait !", "Excellent travail", "Félicitations !", "Très grande maîtrise"],
      color: "emerald"
    };
  } else if (normScore >= 16) {
    return {
      defaultAppreciation: "Très bon travail !",
      suggestions: ["Très bon travail !", "Très bien", "Très satisfaisant", "Bravo !"],
      color: "emerald"
    };
  } else if (normScore >= 14) {
    return {
      defaultAppreciation: "Bon travail",
      suggestions: ["Bon travail", "Bien", "Bon niveau", "Travail sérieux"],
      color: "sky"
    };
  } else if (normScore >= 12) {
    return {
      defaultAppreciation: "Assez bien",
      suggestions: ["Assez bien", "Encourageant", "Travail satisfaisant", "Bons efforts"],
      color: "blue"
    };
  } else if (normScore >= 10) {
    return {
      defaultAppreciation: "Passable",
      suggestions: ["Passable", "Moyen", "Peut mieux faire", "Ensemble juste"],
      color: "amber"
    };
  } else if (normScore >= 8) {
    return {
      defaultAppreciation: "Insuffisant",
      suggestions: ["Insuffisant", "Des efforts à fournir", "Résultats fragiles", "Doit réviser"],
      color: "orange"
    };
  } else {
    return {
      defaultAppreciation: "Très insuffisant",
      suggestions: ["Très insuffisant", "Avertissement", "Travail insuffisant", "Aide requise"],
      color: "red"
    };
  }
};
