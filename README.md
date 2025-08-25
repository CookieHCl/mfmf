# mfmf

**mfmf** - *markdown front matter fixer*

Transforms frontmatter of markdown file using [JSONata](https://docs.jsonata.org/overview.html) or JavaScript(library only).  
This package is intended to make it easy to migrate between Markdown blogs, such as [jekyll](https://jekyllrb.com/) or [hexo](https://hexo.io/docs/).\

## Usage

### Basic concept

This package uses [gray-matter](https://github.com/jonschlinkert/gray-matter) to parse/stringify markdown file, and [yaml](https://eemeli.org/yaml/) to parse/stringify frontmatter.  
If your frontmatter is not in yaml, you have to define your own engine.

For example, look at this markdown file.

```md
---
title: Test Title
categories:
  - PAPER
  - AI
---

# Test content

HI!
```

gray-matter will parse frontmatter like this,

```yaml
title: Test Title
categories:
  - PAPER
  - AI
```

and yaml will parse it into a JavaScript object.

```javascript
{
  title: 'Test Title'
  categories: [
    'PAPER',
    'AI'
  ]
}
```

Now, you can transform this object using JSONata or JavaScript.  
After that, yaml and gray-matter will stringify back to markdown file.

### Handling Date

Because JSONata can only handle dates in string format, every Date instances will be converted to [date time string format](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format) (e.g. `2000-01-23T12:34:56.789Z`) when using JSONata.  
If you're using JavaScript function, Date instances will be passed as-is.

When mfmf stringify back to markdown file, Date instances will be converted to string using given date format.  
Date format should be given as a [Unicode Tokens](https://date-fns.org/v4.1.0/docs/format). e.g. `yyyy-MM-dd HH:mm:ss.SSS`  
Note that if you want to represent year and day, you should use `yyyy`, `dd` instead of `YYYY`, `DD`.  
If no format was given, Date instances will be converted to date time string format.

## API

### transformFrontmatter

```typescript
async function transformFrontmatter(oldFrontmatter, instruction)
```

Transform frontmatter using instruction, then return new frontmatter.

- `oldFrontmatter`: Original frontmatter (can be any JavaScript object)
- `instruction`: One of the following: JavaScript function that takes object and returns object, JSONata query string, or JSONata expression object.
  - If instruction is function, object will be **replaced** with the returned object.
  - If instruction is string, instruction will be compiled to JSONata expression using `jsonata(instruction)`.  
    This function will **throw an error** when syntax error happens.
  - If instruction is JSONata expression, object will be **merged** with evaluated object.  
    If evaluated object has a key with value `null`, that key will be **removed** from original JavaScript object.  
    This function will **throw an error** when expression can't be evaluated.

For example, if we run the following code:

```javascript
import { transformFrontmatter } from 'mfmf'

const oldFrontmatter = {
  title: 'Test Title',
  categories: [
    'PAPER',
    'AI'
  ]
};

const newFrontmatter = await transformFrontmatter(oldFrontmatter, `{
  'title': title & ' 2!',
  'categories': null,
  'tags': ['LLM', 'Google']
}`);

console.log(newFrontmatter);
```

JSONata expression will be evaluated to:  
(Note that the new title is made by appending string to the original title!)

```javascript
{
  title: 'Test Title 2!',
  categories: null,
  tags: ['LLM', 'Google']
}
```

and the following new frontmatter will be returned:

```javascript
{
  title: 'Test Title 2!',
  tags: ['LLM', 'Google']
}
```

You can have same effect using JavaScript function.

```javascript
const newFrontmatter = await transformFrontmatter(oldFrontmatter, (old) => {
  return {
    title: old.title + ' 2!',
    tags: ['LLM', 'Google']
  }
})
```

### transformMarkdownFile

```typescript
async function transformMarkdownFile(filepath, instruction, dateFormatStr?)
```

Transform markdown file at the given filepath. Markdown file will be **overwritten** with new frontmatter.

- `filepath`: A string that contains file path to markdown file.
- `instruction`: Instruction that will convert frontmatter. (See [transformFrontmatter](#transformfrontmatter))
- `dateFormatStr`: Optional date format string. If provided, dates will be formatted using this format. (See [Handling Date](#handling-date))
