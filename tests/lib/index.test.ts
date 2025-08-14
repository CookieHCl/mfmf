import { cp, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { transformFrontmatter, transformMarkdownFile } from '../../src/index.js'
import { expectTwoFileEqual } from '../util.js';

describe('transformFrontmatter', () => {
  test('transform frontmatter', () => {
    const oldFrontmatter = {
      title: 'Test Title',
      categories: ['PAPER', 'AI'],
      tags: ['LLM', 'Google']
    }

    const newFrontmatter = transformFrontmatter(oldFrontmatter, (old) => {
      old.title = 'Updated Title'
      old.date = new Date('2023-01-01 12:00:00')
      delete old.categories
      old.tags.push('Transformer')
      return old;
    })

    expect(newFrontmatter).toStrictEqual({
      title: 'Updated Title',
      tags: ['LLM', 'Google', 'Transformer'],
      date: new Date('2023-01-01 12:00:00')
    })
  })

  test('replace frontmatter', () => {
    const oldFrontmatter = {
      title: 'Test Title'
    }

    const newFrontmatter = transformFrontmatter(oldFrontmatter, (old) => {
      return {
        categories: ["BLOG", "FUWARI"]
      };
    })

    expect(newFrontmatter).toStrictEqual({
      categories: ["BLOG", "FUWARI"]
    })
  })
})

describe('transformMarkdownFile', () => {
  const FIXTURE_DIR = './tests/fixtures/'
  let inDir: string
  const outDir = join(FIXTURE_DIR, 'out')

  beforeAll(async () => {
    inDir = await mkdtemp(FIXTURE_DIR)
    await cp(join(FIXTURE_DIR, 'in'), inDir, { recursive: true })
  })

  afterAll(async () => {
    const MAX_TRIES = 5
    for (let i = 1; i <= MAX_TRIES; ++i) {
      try {
        await rm(inDir, { recursive: true, force: true })
        return
      } catch (e: any) {
        if (e?.code !== 'EBUSY' || i === MAX_TRIES) throw e
        await new Promise(r => setTimeout(r, 100))
      }
    }
  })

  test('transform frontmatter', () => {
    transformMarkdownFile(join(inDir, 'in1.md'), (old) => {
      old.title = 'Updated Title'
      old.abbrlink = 100
      delete old.categories
      old.tags.push('Transformer')
      return old;
    })

    expectTwoFileEqual(join(inDir, 'in1.md'), join(outDir, 'out1.md'))
  })

  test('replace frontmatter', () => {
    transformMarkdownFile(join(inDir, 'in2.md'), (old) => {
      return {
        categories: ["BLOG", "FUWARI"]
      };
    })

    expectTwoFileEqual(join(inDir, 'in2.md'), join(outDir, 'out2.md'))
  })

  test('date update', () => {
    transformMarkdownFile(join(inDir, 'in3.md'), (old) => {
      old.dates = old.dates.map((date: Date) => {
        date.setDate(date.getDate() + 1);
        return date;
      });
      return old;
    }, 'yyyy-MM-dd HH:mm:ss')

    expectTwoFileEqual(join(inDir, 'in3.md'), join(outDir, 'out3.md'))
  })
})
