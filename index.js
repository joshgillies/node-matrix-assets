var extend = require('xtend')

function context () {
  var _assets = []
  var _ids = {}

  function asset (type, opts, children) {
    var asset = {}

    if (!type) {
      throw new Error('Asset type must be defined')
    }

    asset.type = type

    asset.key = _assets.length

    asset = extend(opts, asset)

    if (asset.id) {
      _ids[asset.id] = asset.key
    }

    _assets.push(asset)

    if (children && children.length && Array.isArray(children)) {
      return extend(asset, {
        children: children.map(function getChild (child) {
          if (typeof child === 'function') {
            child = child()
          }
          return child
        })
      })
    }

    return asset
  }

  asset.getAssetById = function getAssetById (id) {
    return _assets[_ids[id]]
  }

  return asset
}

var asset = module.exports = context()
asset.context = context
