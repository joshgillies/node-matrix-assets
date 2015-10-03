var test = require('tape')

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

  for (test in tests) {
    asset = require('./').context()
    assert.deepEqual(asset('folder', tests[test]), expected, test)
  }
})

test('create children assets', function (assert) {
  var asset = require('./').context()

  assert.plan(1)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { name: 'My Site' }
  }
  var expected = {
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
  var test = asset('folder', assets['folder'], [
    asset('site', assets['site'])
  ])

  assert.deepEqual(test, expected, 'processed children')
})

test('getAssetById returns selected asset', function (assert) {
  var asset = require('./').context()
  var getAssetById = asset.getAssetById

  assert.plan(2)

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

  asset('folder', assets['folder'], [
    asset('site', assets['site'], [
      asset('page_standard', assets['page_standard'])
    ])
  ])

  var test = getAssetById('site')

  assert.deepEqual(test, expected, 'returns correct object')
  assert.notOk(test.children, 'children should be undefined')
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
  asset.finalize()

  assert.deepEqual(test, expected, 'processed children')
})
