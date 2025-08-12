import { describe, expect, test } from 'vitest'
import { transformFrontmatter } from '../../src/index.js'

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

// transformMarkdownFile
// TODO