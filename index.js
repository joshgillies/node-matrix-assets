var flat = require('flat')
var flatten = flat.flatten
var unflatten = flat.unflatten
var extend = require('xtend')
var mutate = require('xtend/mutable')
var isArray = require('isarray')
var isObject = require('isobject')
var isFn = require('is-fn')

var PUBLIC_USER = '7'

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

    if (isArray(opts)) {
      children = opts
      opts = {}
    }

    if (Object.keys(opts).filter(function (key) {
      // if both are set assume it's a child asset.
      return key === 'key' || key === 'type'
    }).length === 2) {
      children = [].slice.call(arguments, 1)
      opts = {}
    }

    asset.type = type

    asset.key = _assets.length

    asset.link = {}

    asset.permissions = {}

    if (opts.paths) {
      asset.paths = []
    }

    if (isString(opts.paths)) {
      asset.paths.push(opts.paths)
    } else if (isArray(opts.paths)) {
      mutate(asset.paths, opts.paths)
    }

    if (isString(opts.link)) {
      asset.link[opts.link] = true
    } else if (isArray(opts.link)) {
      for (var i = 0; i < opts.link.length; i++) {
        if (isString(opts.link[i])) {
          asset.link[opts.link[i]] = true
        } else if (isObject(opts.link[i])) {
          mutate(asset.link, opts.link[i])
        }
      }
    } else if (isObject(opts.link)) {
      mutate(asset.link, opts.link)
    }

    if (!(asset.link.type_1 || asset.link.type_2 || asset.link.type_3)) {
      asset.link['type_1'] = true
    }

    if (isObject(opts.permissions)) {
      Object.keys(opts.permissions).forEach(function setPermission (permission) {
        if (isArray(opts.permissions[permission])) {
          asset.permissions[permission] = {
            allow: opts.permissions[permission].slice().map(String)
          }
        } else if (isObject(opts.permissions[permission])) {
          asset.permissions[permission] = {}
          if (opts.permissions[permission].allow) {
            asset.permissions[permission].allow = isString(opts.permissions[permission].allow)
              ? [opts.permissions[permission].allow]
              : opts.permissions[permission].allow.slice().map(String)
          }
          if (opts.permissions[permission].deny) {
            asset.permissions[permission].deny = isString(opts.permissions[permission].deny)
              ? [opts.permissions[permission].deny]
              : opts.permissions[permission].deny.slice().map(String)
          }
        } else {
          asset.permissions[permission] = {
            allow: [String(opts.permissions[permission])]
          }
        }

        if (permission === 'read' &&
            !asset.permissions[permission].allow) {
          asset.permissions[permission].allow = [PUBLIC_USER]
        }

        if ((asset.permissions[permission].allow &&
            ~asset.permissions[permission].allow.indexOf(PUBLIC_USER)) &&
            (asset.permissions[permission].deny &&
            ~asset.permissions[permission].deny.indexOf(PUBLIC_USER))) {
          asset.permissions[permission].allow.splice(
            asset.permissions[permission].allow.indexOf(PUBLIC_USER), 1)

          if (!asset.permissions[permission].allow.length) {
            delete asset.permissions[permission].allow
          }
        }
      })
    }

    if (!asset.permissions.read) {
      asset.permissions.read = {
        allow: [PUBLIC_USER]
      }
    }

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
          delete asset.permissions

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
  }

  function getAssetFromCollection (id) {
    var asset = _assets[id] || _assets[_ids[id]]
    if (asset) {
      asset = extend({}, asset)

      delete asset.children

      return asset
    }
  }

  function containsFns (obj) {
    var flat = flatten(obj)

    return Object.keys(flat).some(function testFn (prop) {
      return isFn(flat[prop])
    })
  }

  function isString (str) {
    return typeof str === 'string'
  }
}

var asset = module.exports = context()
asset.context = context
