cat << 'INNER_EOF' > trim_avg.js
  const calculateTrimAverage = (trimKey: 't1' | 't2' | 't3') => {
    let totalScore = 0;
    let totalCoef = 0;
    activeDisciplines.forEach(d => {
      if (d.inactive) return;
      const mark = d[trimKey];
      if (mark !== null && mark !== undefined && !isNaN(mark)) {
        totalScore += mark * d.coef;
        totalCoef += d.coef;
      }
    });
    return totalCoef > 0 ? totalScore / totalCoef : 0;
  };
INNER_EOF
cat << 'INNER_EOF2' > get_category_bilan.js
  const getCategoryBilan = (cat: 'LETTRES' | 'SCIENCES') => {
    const items = activeDisciplines.filter(d => d.category === cat);
    const getBilanTrim = (trimKey: 't1' | 't2' | 't3') => {
      let score = 0, coef = 0;
      items.forEach(d => {
        if (d.inactive) return;
        const val = d[trimKey];
        if (val !== null && val !== undefined && !isNaN(val)) {
          score += val * d.coef;
          coef += d.coef;
        }
      });
      return coef > 0 ? score / coef : null;
    };
INNER_EOF2
awk 'NR>=445 && NR<=454{next} NR==444{system("cat trim_avg.js"); next} 1' components/LivretScolairePage.tsx > temp2.tsx && mv temp2.tsx components/LivretScolairePage.tsx
awk 'NR>=498 && NR<=512{next} NR==497{system("cat get_category_bilan.js"); next} 1' components/LivretScolairePage.tsx > temp3.tsx && mv temp3.tsx components/LivretScolairePage.tsx
