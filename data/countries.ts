export interface CountryConfig {
  code: string;
  countryName: string;
  nationality: string;
  motto?: string;
  flagEmoji: string;
  colors: {
    stripe1: string;
    stripe2: string;
    stripe3: string;
    accent: string;
  };
}

export const COUNTRIES_DATA: Record<string, CountryConfig> = {
  "Côte d'Ivoire": {
    code: "CI",
    countryName: "Côte d'Ivoire",
    nationality: "Ivoirienne",
    motto: "Union - Discipline - Travail",
    flagEmoji: "🇨🇮",
    colors: {
      stripe1: "#f97316", // Orange
      stripe2: "#ffffff", // White
      stripe3: "#16a34a", // Green
      accent: "#ea580c"
    }
  },
  "Bénin": {
    code: "BJ",
    countryName: "Bénin",
    nationality: "Béninoise",
    motto: "Fraternité - Justice - Travail",
    flagEmoji: "🇧🇯",
    colors: {
      stripe1: "#15803d", // Green
      stripe2: "#eab308", // Yellow
      stripe3: "#dc2626", // Red
      accent: "#15803d"
    }
  },
  "Sénégal": {
    code: "SN",
    countryName: "Sénégal",
    nationality: "Sénégalaise",
    motto: "Un Peuple - Un But - Une Foi",
    flagEmoji: "🇸🇳",
    colors: {
      stripe1: "#16a34a", // Green
      stripe2: "#facc15", // Yellow
      stripe3: "#dc2626", // Red
      accent: "#15803d"
    }
  },
  "Mali": {
    code: "ML",
    countryName: "Mali",
    nationality: "Malienne",
    motto: "Un Peuple - Un But - Une Foi",
    flagEmoji: "🇲🇱",
    colors: {
      stripe1: "#16a34a",
      stripe2: "#facc15",
      stripe3: "#dc2626",
      accent: "#15803d"
    }
  },
  "Togo": {
    code: "TG",
    countryName: "Togo",
    nationality: "Togolaise",
    motto: "Travail - Liberté - Patrie",
    flagEmoji: "🇹🇬",
    colors: {
      stripe1: "#16a34a",
      stripe2: "#facc15",
      stripe3: "#dc2626",
      accent: "#15803d"
    }
  },
  "Cameroun": {
    code: "CM",
    countryName: "Cameroun",
    nationality: "Camerounaise",
    motto: "Paix - Travail - Patrie",
    flagEmoji: "🇨🇲",
    colors: {
      stripe1: "#16a34a",
      stripe2: "#dc2626",
      stripe3: "#facc15",
      accent: "#dc2626"
    }
  },
  "Burkina Faso": {
    code: "BF",
    countryName: "Burkina Faso",
    nationality: "Burkinabè",
    motto: "Unité - Progrès - Justice",
    flagEmoji: "🇧🇫",
    colors: {
      stripe1: "#dc2626",
      stripe2: "#facc15",
      stripe3: "#16a34a",
      accent: "#dc2626"
    }
  },
  "France": {
    code: "FR",
    countryName: "France",
    nationality: "Française",
    motto: "Liberté - Égalité - Fraternité",
    flagEmoji: "🇫🇷",
    colors: {
      stripe1: "#1d4ed8",
      stripe2: "#ffffff",
      stripe3: "#dc2626",
      accent: "#1d4ed8"
    }
  },
  "Guinée": {
    code: "GN",
    countryName: "Guinée",
    nationality: "Guinéenne",
    motto: "Travail - Justice - Solidarité",
    flagEmoji: "🇬🇳",
    colors: {
      stripe1: "#dc2626",
      stripe2: "#facc15",
      stripe3: "#16a34a",
      accent: "#dc2626"
    }
  },
  "Gabon": {
    code: "GA",
    countryName: "Gabon",
    nationality: "Gabonaise",
    motto: "Union - Travail - Justice",
    flagEmoji: "🇬🇦",
    colors: {
      stripe1: "#16a34a",
      stripe2: "#facc15",
      stripe3: "#2563eb",
      accent: "#2563eb"
    }
  }
};

export function getCountryConfig(countryOrNationality?: string): CountryConfig {
  if (!countryOrNationality) return COUNTRIES_DATA["Côte d'Ivoire"];
  const search = countryOrNationality.trim().toLowerCase();
  for (const key in COUNTRIES_DATA) {
    const config = COUNTRIES_DATA[key];
    if (
      config.countryName.toLowerCase().includes(search) ||
      config.nationality.toLowerCase().includes(search) ||
      config.code.toLowerCase() === search
    ) {
      return config;
    }
  }
  return COUNTRIES_DATA["Côte d'Ivoire"];
}
