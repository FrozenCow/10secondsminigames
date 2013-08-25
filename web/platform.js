// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;
    if (this === null) {
      throw new TypeError("this is null or not defined");
    }
    var O = Object(this);
    var len = O.length >>> 0; // Hack to convert O.length to a UInt32
    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError( callback + " is not a function");
    }
    if ( thisArg ) {
      T = thisArg;
    }
    k = 0;
    while( k < len ) {
      var kValue;
      if ( k in O ) {
        kValue = O[ k ];
        callback.call( T, kValue, k, O );
      }
      k++;
    }
  };
}

Array.prototype.remove = function(elem) {
	var i = this.indexOf(elem);
	if (i >= 0) {
		return this.splice(i,1);
	}
	return null;
};

Array.prototype.insertBefore = function(elem,before) {
	var i = this.indexOf(before);
	if (i < 0) { throw "insertBefore: before not found"; }
	this.splice(i,0,elem);
};

Array.prototype.insertAfter = function(elem,after) {
	var i = this.indexOf(after);
	if (i < 0) { throw "insertAfter: after not found"; }
	this.splice(i+1,0,elem);
};

Array.prototype.sample = function() {
  return this[Math.floor(this.length*Math.random())];
};

Array.prototype.max = function(){
  return Math.max.apply(Math, array);
};

Array.prototype.min = function(){
  return Math.min.apply(Math, array);
};

Array.prototype.maxF = function(compare) {
  return this.reduce(function(prev,current) {
    if (prev === undefined || compare(prev,current) < 0) { return current; }
    return prev;
  },undefined);
};

Array.prototype.minF = function(compare) {
  return this.reduce(function(prev,current) {
    if (prev === undefined || compare(prev,current) > 0) { return current; }
    return prev;
  },undefined);
};

Boolean.prototype.toNumber = function() {
  return (this ? 1 : 0);
};

// Random number between -1 and 1
Math.rnd = function() {
  return (Math.random()-0.5)*2;
};

Math.clamp = function(v,min,max) {
  return Math.max(min,Math.min(max,v));
};

Math.sign = function(v) {
  return v === 0 ? 0 :
    (v < 0 ? -1 : +1);
};

define(['eventemitter'],function(eventemitter) {
  var platform = {};
  eventemitter._inherit(platform);

  // Handle onload
  (function() {
    var loaded = false;
    function callback() {
      if (!loaded) {
        loaded=true;
        platform.emit('load');
      }
    }
    /* Mozilla, Chrome, Opera */
    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', callback, false);
    }
    /* Safari, iCab, Konqueror */
    if (/KHTML|WebKit|iCab/i.test(navigator.userAgent)) {
        var DOMLoadTimer = setInterval(function () {
            if (/loaded|complete/i.test(document.readyState)) {
                callback();
                clearInterval(DOMLoadTimer);
            }
        }, 10);
    }
    /* Other web browsers */
    window.onload = callback;
  })();

  return platform;
});