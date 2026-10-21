cat << 'INNER_EOF' > dash_replace.js
      if (allemand && espagnol) {
        const hasAllemand = getDisciplineMarkFromStudent(currentStudent, trimKey, "Allemand") !== null;
        const hasEspagnol = getDisciplineMarkFromStudent(currentStudent, trimKey, "Espagnol") !== null;
        if (hasAllemand && !hasEspagnol) {
          subjects = subjects.map(s => isSubjectMatch(s.name, "Espagnol") ? { ...s, inactive: true } : s);
        } else if (hasEspagnol && !hasAllemand) {
          subjects = subjects.map(s => isSubjectMatch(s.name, "Allemand") ? { ...s, inactive: true } : s);
        } else if (hasAllemand && hasEspagnol) {
          subjects = subjects.map(s => isSubjectMatch(s.name, "Espagnol") ? { ...s, inactive: true } : s);
        }
      }
INNER_EOF
awk 'NR>=808 && NR<=818{next} NR==807{system("cat dash_replace.js"); next} 1' components/Dashboard.tsx > temp.tsx && mv temp.tsx components/Dashboard.tsx
