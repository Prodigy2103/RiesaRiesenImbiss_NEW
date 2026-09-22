import { safeJsonParse } from './storage.util';

describe('StorageUtil', () => {
  it('should parse valid JSON successfully', () => {
    const rawJson = JSON.stringify({ name: 'Max' });
    const parsed = safeJsonParse(rawJson, { name: 'Default' });
    expect(parsed.name).toBe('Max');
  });

  it('should return fallback value for null or empty input', () => {
    const parsed = safeJsonParse(null, { name: 'Fallback' });
    expect(parsed.name).toBe('Fallback');
  });

  it('should return fallback value for corrupted JSON without throwing error', () => {
    const invalidJson = '{"broken": json...';
    const parsed = safeJsonParse(invalidJson, ['fallbackItem']);
    expect(parsed).toEqual(['fallbackItem']);
  });
});
