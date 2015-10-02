var test = require('tape')

test('simple', function (assert) {
  var asset = require('./').context()

  assert.plan(1)
  assert.deepEqual(asset('folder'), { type: 'folder' })
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
  assert.plan(2)

  var expected = { type: 'folder', name: 'Sites', link: 'type_2' }
  var tests = {
    'pass opts object': { name: 'Sites', link: 'type_2' },
    'cannot override asset type with opts.type': { type: 'nope', name: 'Sites', link: 'type_2' }
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
  var expected = { type: 'folder', name: 'Sites', link: 'type_2', children: [{ type: 'site', name: 'My Site' }] }
  var test = asset('folder', assets['folder'], [
    asset('site', assets['site'])
  ])

  assert.deepEqual(test, expected, 'processed children')
})
