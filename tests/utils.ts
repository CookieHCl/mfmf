import { readFile } from 'node:fs/promises';
import { expect } from 'vitest';

const normalizeEOL = (s: string) => s.replace(/\r\n/g, '\n');

export async function expectTwoFileEqual(filepath1: string, filepath2: string) {
  const file1 = normalizeEOL(await readFile(filepath1, 'utf-8'));
  const file2 = normalizeEOL(await readFile(filepath2, 'utf-8'));
  expect(file1).toStrictEqual(file2);
}