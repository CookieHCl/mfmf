import { writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import YAML from 'yaml';
import { formatAllDates } from './utils.js';
import jsonata from 'jsonata';

type Frontmatter = Record<string, any>;
type Instruction =
  | ((oldFrontmatter: Frontmatter) => Frontmatter)
  | string
  | jsonata.Expression;
type CompiledInstruction = (oldFrontmatter: Frontmatter) => Promise<Frontmatter>;

function compileInstruction(instruction: Instruction): CompiledInstruction {
  if (typeof instruction === 'function') {
    // Wrap sync function into async function to match signature
    return async (oldFrontmatter) => instruction(oldFrontmatter);
  }

  // Get jsonata expression
  const expression = (typeof instruction === 'string') ? jsonata(instruction) : instruction;

  // Evaluate and merge with oldFrontmatter
  return async (oldFrontmatter) => {
    // Convert date to date time string format first
    // JSONata can't handle date objects directly
    const result = await expression.evaluate(formatAllDates(oldFrontmatter));

    if (result === null || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error(`JSONata expression didn't return an object, got: ${result}`);
    }

    // If key has value, overwrite current value
    // If key is null, remove it
    for (const [key, value] of Object.entries(result)) {
      if (value === null) {
        delete oldFrontmatter[key];
      } else {
        oldFrontmatter[key] = value;
      }
    }

    return oldFrontmatter;
  }
}

export async function transformFrontmatter(oldFrontmatter: Frontmatter, instruction: Instruction): Promise<Frontmatter> {
  const compiled = compileInstruction(instruction);
  return await compiled(structuredClone(oldFrontmatter));
}

export async function transformMarkdownFile(filepath: string, instruction: Instruction, dateFormatStr?: string) {
  // gray-matter caches every input; WHAT????????
  // Use empty option to disable caching
  const file = matter.read(filepath, {});

  // Transform frontmatter
  const oldFrontmatter = file.data;
  const newFrontmatter = await transformFrontmatter(oldFrontmatter, instruction);
  file.data = newFrontmatter;

  // Format date
  const newFile = matter.stringify(file, formatAllDates(newFrontmatter, dateFormatStr), {
    engines: {
      // use yaml instead of js-yaml to remove quotes
      yaml: {
        parse: YAML.parse,
        stringify: YAML.stringify
      }
    }
  });

  await writeFile(filepath, newFile);
}
