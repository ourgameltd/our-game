export const sessionCategories = [
  { value: 'Whole Part Whole', label: 'Whole Part Whole' },
  { value: 'Skills Practice', label: 'Skills Practice' },
  { value: 'Circuits', label: 'Circuits' },
  { value: 'Scenario', label: 'Scenario' },
] as const;

export type SessionCategoryValue = typeof sessionCategories[number]['value'];

export function isSessionCategory(value: string): value is SessionCategoryValue {
  return sessionCategories.some((category) => category.value === value);
}

export function normalizeSessionCategory(value?: string | null): SessionCategoryValue {
  if (!value) {
    return 'Whole Part Whole';
  }

  return isSessionCategory(value) ? value : 'Whole Part Whole';
}

export function getSessionCategoryColors(category: string): { bgColor: string; textColor: string } {
  const normalized = normalizeSessionCategory(category);

  switch (normalized) {
    case 'Whole Part Whole':
      return {
        bgColor: 'bg-sky-100 dark:bg-sky-900/30',
        textColor: 'text-sky-800 dark:text-sky-300'
      };
    case 'Skills Practice':
      return {
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-800 dark:text-emerald-300'
      };
    case 'Circuits':
      return {
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-800 dark:text-amber-300'
      };
    case 'Scenario':
      return {
        bgColor: 'bg-violet-100 dark:bg-violet-900/30',
        textColor: 'text-violet-800 dark:text-violet-300'
      };
    default:
      return {
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-800 dark:text-gray-300'
      };
  }
}
