# Contributing

This project uses [yarn](https://yarnpkg.com/) and [VS Code](https://code.visualstudio.com/).

Feel free to open any issues or pull requests.  
There are no contribution guidelines... yet.

## Installation

```bash
npm install -g corepack
yarn install
yarn build
yarn test
```

## Why use X instead of Y?

### Why yarn??????

Honestly, no reaason :) I just wanted to try out yarn.

### Why date-fns?

[date-fns](https://date-fns.org/) is only used for formatting dates.

date-fns was chosen because unlike other libraries (who makes their own classes),
date-fns uses javascript's built-in Date class.

### Why JSONata?

[JSONata](https://docs.jsonata.org/overview.html) supports literal values, many operators, dates, etc, so it was suitable for implementing patch.  
e.g. You can add 1 day to given date! (Check [query5.jsonata](https://github.com/CookieHCl/mfmf/blob/main/tests/fixtures/query/query5.jsonata))

Other libraries focus only on querying JSON object, which is not what we want to do.

### Why yaml?

Unlike [js-yaml](https://github.com/nodeca/js-yaml) which is used by [gray-matter](https://github.com/jonschlinkert/gray-matter),
[yaml](https://eemeli.org/yaml/) doesn't add quotes to date strings.

Therefore, `new Date('2025-08-10 18:00:00')` is stringified as `2025-08-10 18:00:00` instead of `'2025-08-10 18:00:00'`.
