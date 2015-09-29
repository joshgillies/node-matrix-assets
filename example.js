var asset = require('./')

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

console.log(JSON.stringify(asset('site', {
  name: 'My Site',
  link: {
    'type_1': 'test',
    'type_2': 'test',
    'type_3': 'test',
    'notice': [{'index': tree}, 'one', 'two']
  }
}), true, 2))

console.log(JSON.stringify(tree, true, 2))
