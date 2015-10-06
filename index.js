var flat = require('flat')
var flatten = flat.flatten
var unflatten = flat.unflatten
var extend = require('xtend')
var mutate = require('xtend/mutable')
var isArray = require('isarray')
var isFn = require('is-fn')

function containsFns (obj) {
  var flat = flatten(obj)

  return Object.keys(flat).some(function testFn (prop) {
    return isFn(flat[prop])
  })
}

function context () {
  var _getAssetFns = []
  var _assets = []
  var _ids = {}

  function finalizeAssetRefs () {
    if (!_getAssetFns.length) {
      return
    }

    _getAssetFns = _getAssetFns.filter(function getAssetFromId (id, index) {
      var flat = flatten(_assets[id], { maxDepth: 3 }) // maxDepth could cause problems in the future
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

    if (children && children.length && isArray(children)) {
      asset = extend(opts, asset, {
        children: children.map(function getChild (child) {
          if (isFn(child)) {
            child = child()
          }
          return child
        })
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

  asset.getAssetById = function getAssetById (id) {
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

  asset.finalize = finalizeAssetRefs

  return asset
}

var asset = module.exports = context()
asset.context = context
