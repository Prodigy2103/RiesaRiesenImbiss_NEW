export function formatLocalDateIso(targetDate: Date | null | undefined): string {
  if (!targetDate || isNaN(targetDate.getTime())) {
    return '';
  }
  const yearNumber = targetDate.getFullYear();
  const monthNumber = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dayNumber = String(targetDate.getDate()).padStart(2, '0');
  return `${yearNumber}-${monthNumber}-${dayNumber}`;
}
