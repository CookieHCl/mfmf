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
      old.date = '2023-01-01 12:00:00'
      delete old.categories
      old.tags.push('2017')
      return old;
    })

    expect(newFrontmatter).toEqual({
      title: 'Updated Title',
      tags: ['LLM', 'Google', '2017'],
      date: '2023-01-01 12:00:00'
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

    expect(newFrontmatter).toEqual({
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
      old.date = '2023-01-01 12:00:00'
      delete old.categories
      old.tags.push('2017')
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
})
