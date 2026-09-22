import { formatLocalDateIso } from './date.util';

describe('formatLocalDateIso', () => {
  it('should return empty string when date is null or undefined', () => {
    expect(formatLocalDateIso(null)).toBe('');
    expect(formatLocalDateIso(undefined)).toBe('');
  });

  it('should return empty string when date is invalid', () => {
    const invalidDate = new Date('invalid-date-string');
    expect(formatLocalDateIso(invalidDate)).toBe('');
  });

  it('should format a valid date into YYYY-MM-DD using local time', () => {
    const localDate = new Date(2026, 8, 22, 12, 0, 0);
    expect(formatLocalDateIso(localDate)).toBe('2026-09-22');
  });

  it('should pad single-digit months and days with leading zeros', () => {
    const paddedDate = new Date(2026, 0, 5, 10, 0, 0);
    expect(formatLocalDateIso(paddedDate)).toBe('2026-01-05');
  });
});
