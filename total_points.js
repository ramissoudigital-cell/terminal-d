  const totalPoints = augmentedSubjects.reduce((acc, sub) => {
      if (sub.inactive) return acc;
      const coef = getSubjectCoef(currentStudent?.class, sub.name);
      if (coef === 0) {
          const g = Number(sub.average || 0);
          return acc + (g > 10 ? g - 10 : 0);
      }
      return acc + (sub.average || 0) * coef;
  }, 0);

  const totalCoef = augmentedSubjects.reduce((acc, sub) => acc + (sub.inactive ? 0 : getSubjectCoef(currentStudent?.class, sub.name)), 0);
