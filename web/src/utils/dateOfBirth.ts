export function parseDateOfBirth(value: string | Date | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return undefined;
    }

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);

    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }

    return parsed;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function calculateAge(dateOfBirth: string | Date | null | undefined, today: Date = new Date()): number | null {
  const birthDate = parseDateOfBirth(dateOfBirth);
  if (!birthDate) {
    return null;
  }

  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = currentDate.getMonth() - birthDate.getMonth();
  const dayDiff = currentDate.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return Math.max(0, age);
}
