cat << 'INNER_EOF' > total_points.js
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
INNER_EOF
awk 'NR>=874 && NR<=883{next} NR==873{system("cat total_points.js"); next} 1' components/Dashboard.tsx > temp.tsx && mv temp.tsx components/Dashboard.tsx
