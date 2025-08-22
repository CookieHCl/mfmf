import { writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { parse, stringify } from 'yaml';
import { formatAllDates } from './utils.js';
import jsonata from 'jsonata';

type Frontmatter = Record<string, any>;
type Instruction =
  | ((oldFrontmatter: Frontmatter) => Frontmatter)
  | string
  | jsonata.Expression;
type CompiledInstruction = (oldFrontmatter: Frontmatter) => Frontmatter;

function compileInstruction(instruction: Instruction): CompiledInstruction {
  if (typeof instruction === 'function') {
    return instruction;
  }

  // get jsonata expression
  let expression: jsonata.Expression;
  if (typeof instruction === 'string') {
    expression = jsonata(instruction);
  } else {
    expression = instruction;
  }

  // evaluate and merge with oldFrontmatter
  return async (oldFrontmatter) => {
    const result = await expression.evaluate(oldFrontmatter);

    if (result === null || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error(`JSONata expression didn't returned object, got: ${result}`);
    }

    // 1. if key has value, overwrite
    // 2. if key is null, remove it
    const newFrontmatter = structuredClone(oldFrontmatter);
    for (const [key, value] of Object.entries(result)) {
      if (value === null) {
        delete newFrontmatter[key];
      } else {
        newFrontmatter[key] = value;
      }
    }

    return newFrontmatter;
  }
}

export function transformFrontmatter(oldFrontmatter: Frontmatter, instruction: Instruction): Frontmatter {
  const compiled = compileInstruction(instruction);
  return compiled(oldFrontmatter);
}

export async function transformMarkdownFile(filepath: string, instruction: Instruction, dateFormatStr?: string) {
  const file = matter.read(filepath);

  // Transform frontmatter
  const oldFrontmatter = file.data;
  const newFrontmatter = transformFrontmatter(oldFrontmatter, instruction);
  file.data = newFrontmatter;

  // Format date
  let newFile: string;
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
