# node-matrix-assets

A DSL for creating Squiz Matrix asset trees in JavaScript!

[![Build Status](https://travis-ci.org/joshgillies/node-matrix-assets.svg)](https://travis-ci.org/joshgillies/node-matrix-assets)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Install

`npm install node-matrix-assets`

## Example

```js
var asset = require('node-matrix-assets')

var tree = asset('folder', { name: 'Sites', link: 'type_2' }, [
  asset('site', { name: 'My Site' }, [
    asset('page_standard', { name: 'Home' }, [
      asset('bodycopy', { link: 'type_2', dependant: '1', exclusive: '1' }, [
        asset('bodycopy_div', { link: 'type_2', dependant: '1' }, [
          asset('content_type_wysiwyg', { link: 'type_2', dependant: '1', exclusive: '1' })
        ])
      ])
    ])
  ])
])
```

## License

MIT
