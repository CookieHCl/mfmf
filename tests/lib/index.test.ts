import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { transformFrontmatter, transformMarkdownFile } from '../../src/index.js'
import { expectTwoFileEqual } from '../utils.js';
import jsonata from 'jsonata';

describe('transformFrontmatter', () => {
  test('transform frontmatter', async () => {
    const oldFrontmatter = {
      title: 'Test Title',
      categories: ['PAPER', 'AI'],
      tags: ['LLM', 'Google']
    }

    const newFrontmatter = await transformFrontmatter(oldFrontmatter, (old) => {
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

  test('transform frontmatter (jsonata string)', async () => {
    const oldFrontmatter = {
      title: 'Test Title',
      categories: ['PAPER', 'AI'],
      tags: ['LLM', 'Google']
    }

    const newFrontmatter = await transformFrontmatter(oldFrontmatter, `{
      'title': 'Updated Title',
      'abbrlink': 100,
      'categories': null,
      'tags': $append(tags, 'Transformer')
    }`)

    expect(newFrontmatter).toStrictEqual({
      title: 'Updated Title',
      tags: ['LLM', 'Google', 'Transformer'],
      abbrlink: 100
    })
  })

  test('replace frontmatter', async () => {
    const oldFrontmatter = {
      title: 'Test Title'
    }

    const newFrontmatter = await transformFrontmatter(oldFrontmatter, (old) => {
      return {
        categories: ["BLOG", "FUWARI"]
      };
    })

    expect(newFrontmatter).toStrictEqual({
      categories: ["BLOG", "FUWARI"]
    })
  })

  test('replace frontmatter (jsonata object)', async () => {
    const oldFrontmatter = {
      title: 'Test Title'
    }

    const newFrontmatter = await transformFrontmatter(oldFrontmatter, jsonata(`{
      'title': null,
      'categories': ["BLOG", "FUWARI"]
    }`))

    expect(newFrontmatter).toStrictEqual({
      categories: ["BLOG", "FUWARI"]
    })
  })
})

describe('transformMarkdownFile', () => {
  const FIXTURE_DIR = './tests/fixtures/'
  let inDir: string
  const outDir = join(FIXTURE_DIR, 'out')
  const queryDir = join(FIXTURE_DIR, 'query')

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

  test('transform frontmatter', async () => {
    await transformMarkdownFile(join(inDir, 'in1.md'), (old) => {
      old.title = 'Updated Title'
      old.abbrlink = 100
      delete old.categories
      old.tags.push('Transformer')
      return old;
    })

    await expectTwoFileEqual(join(inDir, 'in1.md'), join(outDir, 'out1.md'))
  })

  test('replace frontmatter', async () => {
    await transformMarkdownFile(join(inDir, 'in2.md'), (old) => {
      return {
        categories: ["BLOG", "FUWARI"]
      };
    })

    await expectTwoFileEqual(join(inDir, 'in2.md'), join(outDir, 'out2.md'))
  })

  test('date update', async () => {
    await transformMarkdownFile(join(inDir, 'in3.md'), (old) => {
      old.dates = old.dates.map((date: Date) => {
        date.setDate(date.getDate() + 1);
        return date;
      });
      return old;
    }, 'yyyy-MM-dd HH:mm:ss')

    await expectTwoFileEqual(join(inDir, 'in3.md'), join(outDir, 'out3.md'))
  })

  test('transform frontmatter (jsonata)', async () => {
    const query = await readFile(join(queryDir, 'query4.jsonata'), 'utf-8')
    await transformMarkdownFile(join(inDir, 'in4.md'), query)

    await expectTwoFileEqual(join(inDir, 'in4.md'), join(outDir, 'out4.md'))
  })

  test('date update (jsonata)', async () => {
    const query = await readFile(join(queryDir, 'query5.jsonata'), 'utf-8')
    await transformMarkdownFile(join(inDir, 'in5.md'), query, 'yyyy-MM-dd HH:mm:ss')

    await expectTwoFileEqual(join(inDir, 'in5.md'), join(outDir, 'out5.md'))
  })
})
