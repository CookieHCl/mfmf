import { expect, test } from 'vitest'
import { transformFrontmatter } from '../../src/index.js'

// transformFrontmatter
test('transform frontmatter', () => {
  const oldFrontmatter = {
    title: 'Test Title',
    categories: ['PAPER', 'AI'],
    tags: ['LLM', 'Google']
  }

  const newFrontmatter = transformFrontmatter(oldFrontmatter, (old) => {
    old.title = 'Updated Title'
    old.date = '2023-01-01'
    delete old.categories
    old.tags.push('2017')
    return old;
  })

  expect(newFrontmatter).toEqual({
    title: 'Updated Title',
    date: '2023-01-01',
    tags: ['LLM', 'Google', '2017']
  })
})

test('replace frontmatter', () => {
  const oldFrontmatter = {
    title: 'Test Title'
  }

  const newFrontmatter = transformFrontmatter(oldFrontmatter, (old) => {
    return {
      category: "BLOG"
    };
  })

  expect(newFrontmatter).toEqual({
    category: "BLOG"
  })
})

// transformMarkdownFile
// TODO