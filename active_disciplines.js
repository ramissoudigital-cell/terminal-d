  const activeDisciplines = useMemo(() => {
    let list = [...disciplines];
    if (isTech) {
      const allemand = list.find(d => d.name === "Allemand");
      const espagnol = list.find(d => d.name === "Espagnol");
      if (allemand && espagnol) {
        const hasAllemand = allemand.t1 !== null || allemand.t2 !== null || allemand.t3 !== null;
        const hasEspagnol = espagnol.t1 !== null || espagnol.t2 !== null || espagnol.t3 !== null;
        
        list = list.map(d => {
          if (hasAllemand && !hasEspagnol && d.name === "Espagnol") {
            return { ...d, inactive: true };
          } else if (hasEspagnol && !hasAllemand && d.name === "Allemand") {
            return { ...d, inactive: true };
          } else if (hasAllemand && hasEspagnol && d.name === "Espagnol") {
            return { ...d, inactive: true };
          }
          return d;
        });
      }
    }
    return list;
  }, [disciplines, isTech]);
