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
