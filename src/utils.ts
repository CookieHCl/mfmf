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
export function formatAllDates(obj: any, dateFormatStr?: string): any {
  if (typeof obj === 'string') {
    // check if string is in date time string format
    // https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
    //
    // Supports:
    // YYYY-MM-DD
    // YYYY-MM-DDTHH:mm(Z)
    // YYYY-MM-DDTHH:mm:ss(Z)
    // YYYY-MM-DDTHH:mm:ss.sss(Z)
    const isoRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?Z?)?$/;

    if (isoRegex.test(obj)) {
      // check if string is valid date
      const date = new Date(obj);
      if (!isNaN(date.getTime())) {
        obj = date;
      }
    }
  }

  if (obj instanceof Date) {
    // yaml is parsed as UTC, but format prints in local time...
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