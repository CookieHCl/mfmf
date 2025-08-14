import { format } from 'date-fns';

// Format date instance in UTC
export function formatUTC(date: Date, formatStr: string): string {
  // Add offset to "look like" UTC time
  const newDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);

  return format(newDate, formatStr, {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });
}

// Format every date instance in the object
export function formatAllDates(obj: any, dateFormatStr: string): any {
  if (obj instanceof Date) {
    // yaml is parsed as UTC, but format prints in local time...
    return formatUTC(obj, dateFormatStr);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => formatAllDates(item, dateFormatStr));
  }

  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = formatAllDates(value, dateFormatStr);
    }
    return result;
  }

  return obj;
}