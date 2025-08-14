import { writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse, stringify } from 'yaml';
import { formatAllDates } from './utils.js';

type Frontmatter = Record<string, any>;
type Instruction = (oldFrontmatter: Frontmatter) => Frontmatter;

export function transformFrontmatter(oldFrontmatter: Frontmatter, instruction: Instruction): Frontmatter {
  return instruction(oldFrontmatter);
}

export async function transformMarkdownFile(filepath: string, instruction: Instruction, dateFormatStr?: string) {
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

  await writeFile(filepath, newFile);
}
