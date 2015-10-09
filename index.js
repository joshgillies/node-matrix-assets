var flat = require('flat')
var flatten = flat.flatten
var unflatten = flat.unflatten
var extend = require('xtend')
var mutate = require('xtend/mutable')
var isArray = require('isarray')
var isFn = require('is-fn')

function context () {
  var _getAssetFns = []
  var _assets = []
  var _ids = {}

  function asset (type, opts, children) {
    var asset = {}

    if (!type) {
      throw new Error('Asset type must be defined')
    }

    if (!opts) {
      opts = {}
    }

    asset.type = type

    asset.key = _assets.length

    if (!isArray(children)) {
      children = [].slice.call(arguments, 2)
    }

    if (children && children.length) {
      asset = extend(opts, asset, {
        children: children
      })
    } else {
      asset = extend(opts, asset)
    }

    if (asset.id) {
      _ids[asset.id] = asset.key
    }

    _assets.push(asset)

    if (containsFns(opts)) {
      _getAssetFns.push(asset.key)
    }

    finalizeAssetRefs()

    return asset
  }

  asset.getAssetById = getAssetById

  return asset

  function finalizeAssetRefs () {
    if (!_getAssetFns.length) {
      return
    }

    _getAssetFns = _getAssetFns.filter(function getAssetFromId (id, index) {
      var asset = getAssetById(id)
      var flat = flatten(asset)
      var assetRefUpdated

      Object.keys(flat).forEach(function getRef (prop) {
        var asset

        if (isFn(flat[prop]) && (asset = flat[prop]())) {
          asset = extend({}, asset)

          // There's likely a better way to do this.
          // But basically this to prevent deeply nested links of links
          // in cases where assets link between one another.
          delete asset.link

          flat[prop] = asset

          if (!assetRefUpdated) {
            assetRefUpdated = true
          }
        }
      })

      if (assetRefUpdated) {
        mutate(_assets[id], unflatten(flat))
        return false
      }

      return true
    })
  }

  function getAssetById (id) {
    return getAssetFromCollection(id) || function futureAsset () {
      return getAssetFromCollection(id)
    }

    function getAssetFromCollection (id) {
      var asset = _assets[id] || _assets[_ids[id]]
      if (asset) {
        asset = extend({}, asset)

        delete asset.children

        return asset
      }
    }
  }

  function containsFns (obj) {
    var flat = flatten(obj)

    return Object.keys(flat).some(function testFn (prop) {
      return isFn(flat[prop])
    })
  }
}

var asset = module.exports = context()
asset.context = context
