# node-matrix-assets

A DSL for creating Squiz Matrix asset trees in JavaScript!

Inspiration for this module is weighted heavily around the excellent work by [Dominic Tarr] with [hyperscript].

[![Build Status](https://travis-ci.org/joshgillies/node-matrix-assets.svg)](https://travis-ci.org/joshgillies/node-matrix-assets)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Install

`npm install node-matrix-assets`

## Example

```js
var asset = require('node-matrix-assets')
var getAssetById = asset.getAssetById

var tree = asset('folder', { name: 'Sites', link: 'type_2' },
  asset('site', { id: 'site', name: 'My Site' },
    asset('page_standard', { name: 'Home', link: { index: getAssetById('site') } },
      asset('bodycopy', { link: 'type_2', dependant: '1', exclusive: '1' },
        asset('bodycopy_div', { link: 'type_2', dependant: '1' },
          asset('content_type_wysiwyg', { link: 'type_2', dependant: '1', exclusive: '1' })
        )
      )
    )
  )
)
```

## API

### asset

`node-matrix-assets` provides an API for generating structured asset trees via `require('node-matrix-assets')`.

#### asset(type, properties={}, children...)

The `type` argument is _required_ and accepts a string representing a valid Squiz Matrix asset type.

The `properties` argument accepts an object used to configure the returned asset definition.

With the exception of a few optional special cases for the `properties` objects
keys/values will change depending on the type of asset you're creating.

#### properties.id

Assigns a unique identifier to an asset. Typically used in conjunction with [asset.getAssetById].

#### properties.link

Default: `'type_1'`. Either a string representing a valid link type (eg. `'type_2'`),
an Array containing String or Object key/value pairs `['type_2', { notice: 'value' }]`,
or an Object of key/value pairs `{ type_2: true, notice: 'value' }`.

Defining `children` is accomplished through one of the following:

  * As an array containing assets `asset('type_code', [asset(...), asset(...), asset(...)])`,
  * or as arguments `asset('type_code', asset(...), asset(...), asset(...))`.

#### asset.getAssetById(id)
[asset.getAssetById]: #assetgetassetbyidid

The `id` argument accepts a string representing a previously defined asset `property.id`:

```js
var myThing = asset('type_code', { id: 'myThing' })

asset.getAssetById('myThing')
```

or a `key` representing a valid asset key:

```js
var myThing = asset('type_code')

asset.getAssetById(myThing.key)
```

## License

MIT

[Dominic Tarr]: https://github.com/dominictarr
[hyperscript]: https://github.com/dominictarr/hyperscript
