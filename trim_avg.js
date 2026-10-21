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
