export function normalizeIotTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;

  let milliseconds: number;
  if (typeof value === 'number') milliseconds = value < 10_000_000_000 ? value * 1000 : value;
  else if (/^\d+(?:\.\d+)?$/.test(value.trim())) {
    const numeric = Number(value);
    milliseconds = numeric < 10_000_000_000 ? numeric * 1000 : numeric;
  } else {
    const dateParts = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?)?/);
    if (dateParts) {
      const [, yearText, monthText, dayText, hourText = '0', minuteText = '0', secondText = '0'] = dateParts;
      const year = Number(yearText); const month = Number(monthText); const day = Number(dayText);
      const hour = Number(hourText); const minute = Number(minuteText); const second = Number(secondText);
      const daysInMonth = month >= 1 && month <= 12 ? new Date(Date.UTC(year, month, 0)).getUTCDate() : 0;
      if (day < 1 || day > daysInMonth || hour > 23 || minute > 59 || second > 59) return null;
    } else if (/^\d{4}-/.test(value)) return null;
    milliseconds = Date.parse(value);
  }

  if (!Number.isFinite(milliseconds) || milliseconds <= 0 || milliseconds >= Date.UTC(2101, 0, 1)) return null;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
