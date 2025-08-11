import * as matter from 'gray-matter';

type Frontmatter = Record<string, any>;
type Instruction = (oldFrontmatter: Frontmatter) => Frontmatter;

export function transformFrontmatter(oldFrontmatter: Frontmatter, instruction: Instruction): Frontmatter {
  return instruction(oldFrontmatter);
}

export function transformMarkdownFile(filepath: string, instruction: Instruction) {
  const file = matter.read(filepath);

  const oldFrontmatter = file.data;
  const newFrontmatter = transformFrontmatter(structuredClone(oldFrontmatter), instruction);
  file.data = newFrontmatter;
  console.log('[transformMarkdown]', { language: file.language, oldFrontmatter, newFrontmatter });

  const newfile = file.stringify(file.language);
  console.log('[transformMarkdown]', newfile);
}
