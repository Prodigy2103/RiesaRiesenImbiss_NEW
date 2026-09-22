export function safeJsonParse<T>(rawJson: string | null, fallbackValue: T): T {
  if (!rawJson) return fallbackValue;
  try {
    return JSON.parse(rawJson) as T;
  } catch {
    return fallbackValue;
  }
}
