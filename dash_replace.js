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
