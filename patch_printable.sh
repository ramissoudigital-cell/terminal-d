cat << 'INNER_EOF' > compute_bilans.js
  const calcCatBilan = (subs: typeof augmentedSubjects) => {
    let pts = 0;
    let cfs = 0;
    subs.forEach(s => {
      if (s.inactive) return;
      const coef = getSubjectCoef(student.class, s.name);
      pts += (s.average || 0) * coef;
      cfs += coef;
    });
    return cfs > 0 ? (pts / cfs) : 0;
  };

  // Compute category averages and total points/coefs
  let lettresTotalCoef = 0;
  let lettresTotalPoints = 0;
  lettresSubjects.forEach(s => {
    if (s.inactive) return;
    const coef = getSubjectCoef(student.class, s.name);
    lettresTotalCoef += coef;
    lettresTotalPoints += (s.average || 0) * coef;
  });
  const bilanLettres = lettresTotalCoef > 0 ? (lettresTotalPoints / lettresTotalCoef) : 0;

  let sciencesTotalCoef = 0;
  let sciencesTotalPoints = 0;
  sciencesSubjects.forEach(s => {
    if (s.inactive) return;
    const coef = getSubjectCoef(student.class, s.name);
    sciencesTotalCoef += coef;
    sciencesTotalPoints += (s.average || 0) * coef;
  });
  const bilanSciences = sciencesTotalCoef > 0 ? (sciencesTotalPoints / sciencesTotalCoef) : 0;
INNER_EOF
awk 'NR>=167 && NR<=195{next} NR==166{system("cat compute_bilans.js"); next} 1' components/PrintableBulletin.tsx > temp.tsx && mv temp.tsx components/PrintableBulletin.tsx

sed -i 's/<tr key={sub.name} className="border-b border-black">/<tr key={sub.name} className={`border-b border-black ${sub.inactive ? "opacity-40 grayscale" : ""}`}>/g' components/PrintableBulletin.tsx
