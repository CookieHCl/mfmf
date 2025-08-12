import { readFileSync } from 'node:fs';
import { expect } from 'vitest';

const normalizeEOL = (s: string) => s.replace(/\r\n/g, '\n');

export function expectTwoFileEqual(filepath1: string, filepath2: string) {
  const file1 = normalizeEOL(readFileSync(filepath1, 'utf-8'));
  const file2 = normalizeEOL(readFileSync(filepath2, 'utf-8'));
  expect(file1).toEqual(file2);
}