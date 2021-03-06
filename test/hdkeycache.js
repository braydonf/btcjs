'use strict';

var _ = require('lodash');
var expect = require('chai').expect;
var btc = require('..');
var HDPrivateKey = btc.HDPrivateKey;

var xprivkey = 'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi';

describe('HDKey cache', function() {
  this.timeout(10000);

  /* jshint unused: false */
  var cache = btc._HDKeyCache;
  var master = new HDPrivateKey(xprivkey);

  beforeEach(function() {
    cache._cache = {};
    cache._count = 0;
    cache._eraseIndex = 0;
    cache._usedIndex = {};
    cache._usedList = {};
    cache._CACHE_SIZE = 3; // Reduce for quick testing
  });

  it('saves a derived key', function() {
    var child = master.deriveChild(0);
    expect(cache._cache['0' + master.xprivkey + '/0/false'].xprivkey).to.equal(child.xprivkey);
  });
  it('starts erasing unused keys', function() {
    var child1 = master.deriveChild(0);
    var child2 = child1.deriveChild(0);
    var child3 = child2.deriveChild(0);
    expect(cache._cache['0' + master.xprivkey + '/0/false'].xprivkey).to.equal(child1.xprivkey);
    var child4 = child3.deriveChild(0);
    expect(cache._cache['0' + master.xprivkey + '/0/false']).to.equal(undefined);
  });
  it('avoids erasing keys that get cache hits ("hot keys")', function() {
    var child1 = master.deriveChild(0);
    var child2 = master.deriveChild(0).deriveChild(0);
    expect(cache._cache['0' + master.xprivkey + '/0/false'].xprivkey).to.equal(child1.xprivkey);
    var child1_copy = master.deriveChild(0);
    expect(cache._cache['0' + master.xprivkey + '/0/false'].xprivkey).to.equal(child1.xprivkey);
  });
  it('keeps the size of the cache small', function() {
    var child1 = master.deriveChild(0);
    var child2 = child1.deriveChild(0);
    var child3 = child2.deriveChild(0);
    var child4 = child3.deriveChild(0);
    expect(_.size(cache._cache)).to.equal(3);
  });
});
