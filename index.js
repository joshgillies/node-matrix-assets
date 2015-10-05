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

    asset = extend(opts, asset)

    if (asset.id) {
      _ids[asset.id] = asset.key
    }

    _assets.push(asset)

    if (containsFns(opts)) {
      _getAssetFns.push(asset.key)
    }

    if (children && children.length && isArray(children)) {
      return extend(asset, {
        children: children.map(function getChild (child) {
          if (isFn(child)) {
            child = child()
          }
          return child
        })
      })
    }

    return asset
  }

  asset.getAssetById = function getAssetById (id) {
    if (_assets[id]) {
      return _assets[id]
    }

    if (_assets[_ids[id]]) {
      return _assets[_ids[id]]
    }

    return function returnAsset () {
      return _assets[_ids[id]] || _assets[id]
    }
  }

  asset.finalize = function finalize () {
    _getAssetFns.forEach(function getAssets (asset) {
      var flat = flatten(_assets[asset])
      Object.keys(flat).forEach(function (prop) {
        if (typeof flat[prop] === 'function') {
          flat[prop] = flat[prop]()
        }
      })
      mutate(_assets[asset], unflatten(flat))
    })
  }

  return asset
}

var asset = module.exports = context()
asset.context = context
