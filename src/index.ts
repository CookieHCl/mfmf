import { writeFileSync } from 'node:fs';
import matter from 'gray-matter';
import { format } from 'date-fns';
import { parse, stringify } from 'yaml';

type Frontmatter = Record<string, any>;
type Instruction = (oldFrontmatter: Frontmatter) => Frontmatter;

function formatUTC(date: Date, formatStr: string): string {
  const newDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
  return format(newDate, formatStr, {
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  });
}

function formatAllDates(obj: any, dateFormatStr: string): any {
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

export function transformFrontmatter(oldFrontmatter: Frontmatter, instruction: Instruction): Frontmatter {
  return instruction(oldFrontmatter);
}

export function transformMarkdownFile(filepath: string, instruction: Instruction, dateFormatStr?: string) {
  const file = matter.read(filepath);

  // Transform frontmatter
  const oldFrontmatter = file.data;
  const newFrontmatter = transformFrontmatter(oldFrontmatter, instruction);
  file.data = newFrontmatter;

  // Format date
  let newFile;
  if (dateFormatStr !== undefined) {
    if (file.language !== 'yaml') {
      throw new Error(`Unsupported file language: ${file.language}, formatting date is only supported in yaml`);
    }

    // Format using provided date format string
    // use yaml instead of js-yaml to remove quotes
    newFile = matter.stringify(file, formatAllDates(newFrontmatter, dateFormatStr), {
      engines: {
        yaml: {
          parse: parse,
          stringify: stringify
        }
      }
    });
  } else {
    // Format using default method - date time string format
    // https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
    newFile = file.stringify();
  }

  writeFileSync(filepath, newFile);
}
