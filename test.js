var test = require('tape')
var isFn = require('is-fn')

test('simple', function (assert) {
  var asset = require('./').context()

  assert.plan(1)

  assert.deepEqual(asset('folder'), { key: 0, type: 'folder', link: { type_1: true }, permissions: { read: { allow: ['7'] } } })
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

  var expected = { key: 0, type: 'folder', name: 'Sites', link: { type_2: true }, permissions: { read: { allow: ['7'] } } }
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

test('set asset paths', function (assert) {
  var tests = {
    'string case': {
      test: function (asset) {
        return asset('folder', { name: 'Test', paths: 'test-path' })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'] } }, paths: [ 'test-path' ] }
    },
    'array case': {
      test: function (asset) {
        return asset('folder', { name: 'Test', paths: [ 'test_path', 'test-path' ] })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'] } }, paths: [ 'test_path', 'test-path' ] }
    }
  }
  var asset

  for (var test in tests) {
    asset = require('./').context()
    assert.deepEqual(tests[test].test(asset), tests[test].expected, test)
  }

  assert.end()
})

test('set asset permissions', function (assert) {
  var tests = {
    'default case': {
      test: function (asset) {
        return asset('folder', { name: 'Test' })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'] } } }
    },
    'set allow default on read permission': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: { deny: '8' } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'], deny: ['8'] } } }
    },
    'do not allow default on non-read permission': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { write: { deny: '8' } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'] }, write: { deny: ['8'] } } }
    },
    'deny public': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: { deny: '7' } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { deny: ['7'] } } }
    },
    'allow short-hand, single value': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: '7' } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'] } } }
    },
    'allow short-hand, single value as Number': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: 7 } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'] } } }
    },
    'allow short-hand, Array value': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: ['7', '8'] } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7', '8'] } } }
    },
    'allow short-hand, Array value mixed values': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: [7, '8'] } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7', '8'] } } }
    },
    'explicit allow/deny as Object, String case': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: { allow: '7', deny: '8' } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7'], deny: ['8'] } } }
    },
    'explicit allow/deny as Object, Array case': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: { allow: ['7', '8'], deny: ['9'] } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7', '8'], deny: ['9'] } } }
    },
    'explicit allow/deny as Object, mixed case': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: { allow: ['7', '8'], deny: '9' } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['7', '8'], deny: ['9'] } } }
    },
    'cannot set allow and deny on the same value': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: { allow: ['7', '8'], deny: '7' } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { allow: ['8'], deny: ['7'] } } }
    },
    'cannot set allow and deny on the same value, remove empty access value': {
      test: function (asset) {
        return asset('folder', { name: 'Test', permissions: { read: { allow: '7', deny: '7' } } })
      },
      expected: { key: 0, type: 'folder', name: 'Test', link: { type_1: true }, permissions: { read: { deny: ['7'] } } }
    }
  }
  var asset

  for (var test in tests) {
    asset = require('./').context()
    assert.deepEqual(tests[test].test(asset), tests[test].expected, test)
  }

  assert.end()
})

test('set asset link(s)', function (assert) {
  var tests = {
    'default case': {
      test: function (asset) {
        return asset('folder', { name: 'Sites' })
      },
      expected: { key: 0, type: 'folder', name: 'Sites', link: { type_1: true }, permissions: { read: { allow: ['7'] } } }
    },
    'string case': {
      test: function (asset) {
        return asset('folder', { name: 'Sites', link: 'type_2' })
      },
      expected: { key: 0, type: 'folder', name: 'Sites', link: { type_2: true }, permissions: { read: { allow: ['7'] } } }
    },
    'array case with string': {
      test: function (asset) {
        return asset('folder', { name: 'Sites', link: [ 'type_2' ] })
      },
      expected: { key: 0, type: 'folder', name: 'Sites', link: { type_2: true }, permissions: { read: { allow: ['7'] } } }
    },
    'array case with object': {
      test: function (asset) {
        return asset('folder', { name: 'sites', link: [ { type_2: true } ] })
      },
      expected: { key: 0, type: 'folder', name: 'sites', link: { type_2: true }, permissions: { read: { allow: ['7'] } } }
    },
    'array case mixed': {
      test: function (asset) {
        return asset('folder', { name: 'sites', link: [ 'type_2', { index: 'site' } ] })
      },
      expected: { key: 0, type: 'folder', name: 'sites', link: { type_2: true, index: 'site' }, permissions: { read: { allow: ['7'] } } }
    },
    'object case': {
      test: function (asset) {
        return asset('folder', { name: 'sites', link: { type_2: true, index: 'site' } })
      },
      expected: { key: 0, type: 'folder', name: 'sites', link: { type_2: true, index: 'site' }, permissions: { read: { allow: ['7'] } } }
    }
  }
  var asset

  assert.plan(6)

  for (var test in tests) {
    asset = require('./').context()
    assert.deepEqual(tests[test].test(asset), tests[test].expected, test)
  }
})

test('create children assets', function (assert) {
  assert.plan(5)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { name: 'My Site' }
  }

  var tests = {
    'optional opts children as array': {
      test: function (asset) {
        return asset('folder', [asset('site', assets['site'])])
      },
      expected: {
        key: 1,
        type: 'folder',
        link: {
          type_1: true
        },
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site',
            link: {
              type_1: true
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          }
        ],
        permissions: {
          read: {
            allow: ['7']
          }
        }
      }
    },
    'optional opts children as arguments': {
      test: function (asset) {
        return asset('folder', asset('site', assets['site']))
      },
      expected: {
        key: 1,
        type: 'folder',
        link: {
          type_1: true
        },
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site',
            link: {
              type_1: true
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          }
        ],
        permissions: {
          read: {
            allow: ['7']
          }
        }
      }
    },
    'processed children': {
      test: function (asset) {
        return asset('folder', assets['folder'], asset('site', assets['site']))
      },
      expected: {
        key: 1,
        type: 'folder',
        name: 'Sites',
        link: {
          type_2: true
        },
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site',
            link: {
              type_1: true
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          }
        ],
        permissions: {
          read: {
            allow: ['7']
          }
        }
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
        link: {
          type_2: true
        },
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site',
            link: {
              type_1: true
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          },
          {
            key: 1,
            type: 'site',
            name: 'My Site',
            link: {
              type_1: true
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          }
        ],
        permissions: {
          read: {
            allow: ['7']
          }
        }
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
        link: {
          type_2: true
        },
        children: [
          {
            key: 0,
            type: 'site',
            name: 'My Site',
            link: {
              type_1: true
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          }
        ],
        permissions: {
          read: {
            allow: ['7']
          }
        }
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

  assert.plan(12)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { id: 'site', name: 'My Site' },
    'page_standard': { name: 'Home' }
  }
  var expected = {
    key: 1,
    id: 'site',
    type: 'site',
    name: 'My Site',
    link: {
      type_1: true
    },
    permissions: {
      read: {
        allow: ['7']
      }
    }
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

  assert.deepEqual(testCallbackKey(), expected, 'callable returns correct object via key')
  assert.notOk(testCallbackKey().children, 'children should be undefined')

  assert.deepEqual(testId, expected, 'returns correct object via id')
  assert.notOk(testId.children, 'children should be undefined')

  assert.deepEqual(testKey, expected, 'returns correct object via key')
  assert.notOk(testKey.children, 'children should be undefined')
})

test('getAssetById inline asset definition', function (assert) {
  var asset = require('./').context()
  var getAssetById = asset.getAssetById

  assert.plan(1)

  var assets = {
    'folder': { name: 'Sites', link: 'type_2' },
    'site': { id: 'site', name: 'My Site' },
    'page_standard': { name: 'Home', link: { index: getAssetById('site') } }
  }
  var expected = {
    key: 2,
    type: 'folder',
    name: 'Sites',
    link: {
      type_2: true
    },
    children: [
      {
        key: 1,
        id: 'site',
        type: 'site',
        name: 'My Site',
        link: {
          type_1: true
        },
        children: [
          {
            key: 0,
            type: 'page_standard',
            name: 'Home',
            link: {
              type_1: true,
              index: {
                id: 'site',
                name: 'My Site',
                type: 'site',
                key: 1
              }
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          }
        ],
        permissions: {
          read: {
            allow: ['7']
          }
        }
      }
    ],
    permissions: {
      read: {
        allow: ['7']
      }
    }
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
    'site': { id: 'site', name: 'My Site', link: { 'some-reverse-link': getAssetById('home') } },
    'page_standard': { id: 'home', name: 'Home', link: { index: getAssetById('site') } }
  }
  var expected = {
    key: 2,
    type: 'folder',
    name: 'Sites',
    link: {
      type_2: true
    },
    children: [
      {
        key: 1,
        id: 'site',
        type: 'site',
        name: 'My Site',
        link: {
          type_1: true,
          'some-reverse-link': {
            id: 'home',
            name: 'Home',
            type: 'page_standard',
            key: 0
          }
        },
        children: [
          {
            key: 0,
            id: 'home',
            type: 'page_standard',
            name: 'Home',
            link: {
              type_1: true,
              index: {
                id: 'site',
                name: 'My Site',
                type: 'site',
                key: 1
              }
            },
            permissions: {
              read: {
                allow: ['7']
              }
            }
          }
        ],
        permissions: {
          read: {
            allow: ['7']
          }
        }
      }
    ], permissions: {
      read: {
        allow: ['7']
      }
    }
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
    'page_standard': { id: 'home', name: 'Home', link: { index: getAssetById('site') } },
    'bodycopy': { link: 'type_2', dependant: '1', exclusive: '1' },
    'bodycopy_div': { link: 'type_2', dependant: '1' },
    'content_type_wysiwyg': { id: 'test', dependant: '1', exclusive: '1' }
  }
  var expected = {
    type_1: true,
    index: {
      id: 'site',
      name: 'My Site',
      type: 'site',
      key: 4
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
