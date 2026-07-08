const TIME_24H_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const TIME_12H_PATTERN = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

export function isTime24Hour(time: string): boolean {
  return TIME_24H_PATTERN.test(time.trim());
}

export function formatTime24To12(time24: string): string {
  const match = time24.trim().match(TIME_24H_PATTERN);
  if (!match) return time24;

  const hour24 = parseInt(match[1], 10);
  const minute = match[2];
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const hourStr = hour12.toString().padStart(2, '0');

  return `${hourStr}:${minute} ${period}`;
}

export function normalizeTimeTo12Hour(time: string): string {
  if (!time || !time.trim()) return '';
  const trimmed = time.trim();

  const match12 = trimmed.match(TIME_12H_PATTERN);
  if (match12) {
    const hour = match12[1].padStart(2, '0');
    const minute = match12[2];
    const period = match12[3].toUpperCase();
    return `${hour}:${minute} ${period}`;
  }

  if (isTime24Hour(trimmed)) {
    return formatTime24To12(trimmed);
  }

  return trimmed;
}

export function buildTime12HourOptions(
  intervalMinutes = 15
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += intervalMinutes) {
      const h = hour.toString().padStart(2, '0');
      const m = min.toString().padStart(2, '0');
      const time24 = `${h}:${m}`;
      const time12 = formatTime24To12(time24);
      options.push({ value: time12, label: time12 });
    }
  }

  return options;
}

export const TIME_12H_SELECT_OPTIONS = [
  { value: '', label: 'Select time' },
  ...buildTime12HourOptions(),
];
