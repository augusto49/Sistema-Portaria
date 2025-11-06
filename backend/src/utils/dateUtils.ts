// CONVERSÕES DE DATA UTC/LOCAL

// Converte string YYYY-MM-DD para Date (midnight local)
export const parseLocalDate = (dateString: string): Date => {
  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  const localDate = new Date(dateString + "T00:00:00");
  return localDate;
};

export const parseAndValidateDate = (dateString: string): Date => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error("Data inválida");
  }

  return date;
};

// Converte string datetime local para UTC Date (preserva horário de parede)
export const parseLocalDateTimeToUTCDate = (input: string): Date => {
  if (!input) throw new Error("Data/hora inválida");

  // Se já termina com Z, retorna como está
  if (input.endsWith("Z")) {
    return new Date(input);
  }

  // Regex para validar formato ISO local
  const m = input.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!m) {
    // Fallback para formato apenas data (YYYY-MM-DD)
    const md = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (md) {
      const [_, y, mo, d] = md;
      return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 0, 0, 0));
    }
    // Último recurso
    const d = new Date(input);
    if (isNaN(d.getTime())) throw new Error("Data/hora inválida");
    return d;
  }

  const [, y, mo, d, hh, mi, ss = "0"] = m;
  return new Date(
    Date.UTC(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(hh),
      Number(mi),
      Number(ss)
    )
  );
};
