import { format } from 'date-fns';

// Format date instance as UTC time
// yaml parses as UTC, but format prints as local time...
export function formatUTC(date: Date, formatStr: string): string {
  // Add offset to "look like" UTC time
  const newDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);

  return format(newDate, formatStr, {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });
}

// Format every date instance in the object
export function formatAllDates(obj: any, dateFormatStr?: string): any {
  // Convert date time string to Date object
  // This is done because JSONata returns string instead of Date objects
  if (typeof obj === 'string') {
    // Check if string is in date time string format
    // https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
    //
    // Supported formats:
    // - YYYY-MM-DD
    // - YYYY-MM-DDTHH:mm(UTC offset)
    // - YYYY-MM-DDTHH:mm:ss(UTC offset)
    // - YYYY-MM-DDTHH:mm:ss.sss(UTC offset)
    // where (UTC offset) is either:
    // - Z (UTC time)
    // - [+-]HH:mm
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

    if (dateTimeRegex.test(obj)) {
      const date = new Date(obj);

      // Check if string is valid date
      if (!isNaN(date.getTime())) {
        obj = date;
      }
    }
  }

  if (obj instanceof Date) {
    // If dateFormat is present, format date using it
    // else, return ISO string (date time string format)
    return dateFormatStr !== undefined ? formatUTC(obj, dateFormatStr) : obj.toISOString();
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