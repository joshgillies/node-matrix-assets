var test = require('tape')
var isFn = require('is-fn')

test('simple', function (assert) {
  var asset = require('./').context()

  assert.plan(1)

  assert.deepEqual(asset('folder'), { key: 0, type: 'folder' })
})

test('error if type is undefined', function (assert) {
  var asset = require('./').context()

  assert.plan(1)

  try {
    asset()
  } catch (error) {
    assert.ok(error, 'got an error')
  }
})

test('set asset properties', function (assert) {
  assert.plan(3)

  var expected = { key: 0, type: 'folder', name: 'Sites', link: 'type_2' }
  var tests = {
    'pass opts object': { name: 'Sites', link: 'type_2' },
    'cannot override asset type with opts.type': { type: 'nope', name: 'Sites', link: 'type_2' },
    'cannot override asset key with opts.key': { key: 10, name: 'Sites', link: 'type_2' }
  }
  var asset

  for (var test in tests) {
    asset = require('./').context()
    assert.deepEqual(asset('folder', tests[test]), expected, test)
  }
})

test('create children assets', function (assert) {
  assert.plan(3)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { name: 'My Site' }
  }

  var tests = {
    'processed children': {
      test: function (asset) {
        return asset('folder', assets['folder'], asset('site', assets['site']))
      },
      expected: {
        key: 1,
        type: 'folder',
        name: 'Sites',
        link: 'type_2',
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site'
          }
        ]
      }
    },
    'processed children as multiple arguments': {
      test: function (asset) {
        return asset('folder', assets['folder'], asset('site', assets['site']), asset('site', assets['site']))
      },
      expected: {
        key: 2,
        type: 'folder',
        name: 'Sites',
        link: 'type_2',
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site'
          },
          {
            key: 1,
            type: 'site',
            name: 'My Site'
          }
        ]
      }
    },
    'processed children as array': {
      test: function (asset) {
        return asset('folder', assets['folder'], [
          asset('site', assets['site'])
        ])
      },
      expected: {
        key: 1,
        type: 'folder',
        name: 'Sites',
        link: 'type_2',
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site'
          }
        ]
      }
    }
  }
  var asset

  for (var test in tests) {
    asset = require('./').context()
    assert.deepEqual(tests[test].test(asset), tests[test].expected, test)
  }
})

test('getAssetById returns selected asset', function (assert) {
  var asset = require('./').context()
  var getAssetById = asset.getAssetById

  assert.plan(16)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { id: 'site', name: 'My Site' },
    'page_standard': { name: 'Home' }
  }
  var expected = {
    key: 1,
    id: 'site',
    type: 'site',
    name: 'My Site'
  }

  var testCallbackId = getAssetById('site')
  var testCallbackKey = getAssetById(1)

  assert.ok(isFn(testCallbackId), 'returns function if object not found via id')
  assert.notOk(testCallbackId(), 'undefined if object not found via id')

  assert.ok(isFn(testCallbackKey), 'returns function if object not found via key')
  assert.notOk(testCallbackKey(), 'undefined if object not found via key')

  asset('folder', assets['folder'], [
    asset('site', assets['site'], [
      asset('page_standard', assets['page_standard'])
    ])
  ])

  var testId = getAssetById('site')
  var testKey = getAssetById(1)

  assert.deepEqual(testCallbackId(), expected, 'callable returns correct object via id')
  assert.notOk(testCallbackId().children, 'children should be undefined')
  assert.notOk(testCallbackId().link, 'link should be undefined')

  assert.deepEqual(testCallbackKey(), expected, 'callable returns correct object via key')
  assert.notOk(testCallbackKey().children, 'children should be undefined')
  assert.notOk(testCallbackKey().link, 'link should be undefined')

  assert.deepEqual(testId, expected, 'returns correct object via id')
  assert.notOk(testId.children, 'children should be undefined')
  assert.notOk(testId.link, 'link should be undefined')

  assert.deepEqual(testKey, expected, 'returns correct object via key')
  assert.notOk(testKey.children, 'children should be undefined')
  assert.notOk(testKey.link, 'link should be undefined')
})

test('getAssetById inline asset definition', function (assert) {
  var asset = require('./').context()
  var getAssetById = asset.getAssetById

  assert.plan(1)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { id: 'site', name: 'My Site' },
    'page_standard': { name: 'Home', link: { notice: { index: getAssetById('site') } } }
  }
  var expected = {
    key: 2,
    type: 'folder',
    name: 'Sites',
    link: 'type_2',
    children: [
      {
        key: 1,
        id: 'site',
        type: 'site',
        name: 'My Site',
        children: [
          {
            key: 0,
            type: 'page_standard',
            name: 'Home',
            link: {
              notice: {
                index: {
                  id: 'site',
                  name: 'My Site',
                  type: 'site',
                  key: 1
                }
              }
            }
          }
        ]
      }
    ]
  }
  var test = asset('folder', assets['folder'], [
    asset('site', assets['site'], [
      asset('page_standard', assets['page_standard'])
    ])
  ])

  assert.deepEqual(test, expected, 'processed children')
})

test('multiple getAssetById inline definitions', function (assert) {
  var asset = require('./').context()
  var getAssetById = asset.getAssetById

  assert.plan(1)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { id: 'site', name: 'My Site', link: { notice: { 'some-reverse-link': getAssetById('home') } } },
    'page_standard': { id: 'home', name: 'Home', link: { notice: { index: getAssetById('site') } } }
  }
  var expected = {
    key: 2,
    type: 'folder',
    name: 'Sites',
    link: 'type_2',
    children: [
      {
        key: 1,
        id: 'site',
        type: 'site',
        name: 'My Site',
        link: {
          notice: {
            'some-reverse-link': {
              id: 'home',
              name: 'Home',
              type: 'page_standard',
              key: 0
            }
          }
        },
        children: [
          {
            key: 0,
            id: 'home',
            type: 'page_standard',
            name: 'Home',
            link: {
              notice: {
                index: {
                  id: 'site',
                  name: 'My Site',
                  type: 'site',
                  key: 1
                }
              }
            }
          }
        ]
      }
    ]
  }
  var test = asset('folder', assets['folder'], [
    asset('site', assets['site'], [
      asset('page_standard', assets['page_standard'])
    ])
  ])

  assert.deepEqual(test, expected, 'processed children')
})

test('issue #1, getAssetById inline on asset with children', function (assert) {
  var asset = require('./').context()
  var getAssetById = asset.getAssetById

  assert.plan(1)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { id: 'site', name: 'My Site' },
    'page_standard': { id: 'home', name: 'Home', link: { notice: { index: getAssetById('site') } } },
    'bodycopy': { link: 'type_2', dependant: '1', exclusive: '1' },
    'bodycopy_div': { link: 'type_2', dependant: '1' },
    'content_type_wysiwyg': { id: 'test', dependant: '1', exclusive: '1' }
  }
  var expected = {
    notice: {
      index: {
        id: 'site',
        name: 'My Site',
        type: 'site',
        key: 4
      }
    }
  }
  var test = asset('folder', assets['folder'], [
    asset('site', assets['site'], [
      asset('page_standard', assets['page_standard'], [
        asset('bodycopy', assets['bodycopy'], [
          asset('bodycopy_div', assets['bodycopy_div'], [
            asset('content_type_wysiwyg', assets['content_type_wysiwyg'])
          ])
        ])
      ])
    ])
  ])

  assert.deepEqual(test.children[0].children[0].link, expected, 'correct link value')
})
