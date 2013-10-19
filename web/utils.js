define([],function() {
	function debug(/*...*/) {
		// console.log.apply(console,arguments);
	}
	function findIndex(xs,f) {
		for(var i=0;i<xs.length;i++) {
			if (f(xs[i],i)) { return i; }
		}
		return -1;
	}
	function contains(xs,x) { return xs.indexOf(x) >= 0; }
	function remove(xs,x) {
		var i = xs.indexOf(x);
		xs.splice(i,1);
	}
	function extend(a,b) {
		for(var n in b) { a[n] = b[n]; }
	}
	function assert(b) {
		if(!b) {
			debugger;
			throw new Error('Assertion failed');
		}
	}
	function identity(v) {
		return v;
	}
	function deepClone(val) {
		if (val === null) {
			return val;
		} else if (val === undefined) {
			return val;
		} else if (val instanceof Array) {
			return val.map(deepClone);
		} else if (typeof val === 'object') {
			var r = {};
			for(var k in val) {
				if (val.hasOwnProperty(k)) {
					r[k] = deepClone(val[k]);
				}
			}
			if (val.__proto__) {
				r.__proto__ = val.__proto__;
			}
			return r;
		} else {
			return val;
		}
	}
	function merge(obja,objb) {
		var r = {};
		for(var k in obja) {
			r[k] = obja[k];
		}
		for(var k in objb) {
			if (!r[k]) {
				r[k] = objb[k];
			}
		}
		return r;
	}
	function hashCode(str) {
		var hash = 0, i, c;
		if (str.length === 0) {
			return hash;
		}
		for (i = 0, l = str.length; i < l; i++) {
			c = str.charCodeAt(i);
			hash = ((hash<<5)-hash)+c;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}

	// A JSON.stringify that always represents objects the same way (sorted
	// by key) and always represent numbers as their byte value (or else it
	// will get rounded).
	function JSONstringify(obj) {
		return JSON.stringify(obj,JSONreplacer);
	}
	function JSONreplacer(key,value) {
		if (key && key[0] === '@') { return value; }
		if (value === undefined) {
			return value;
		} else if (value === null) {
			return value;
		} else if(Object.prototype.toString.call(value) === '[object Array]') {
			return value;
		} else if (typeof value === 'object') {

			// Sort the keys of the object.
			var keys = Object.keys(value).sort();
			var r = {};
			for(var i=0;i<keys.length;i++) {
				r[keys[i]] = value[keys[i]];
			}
			return r;
		} else if (typeof value === 'string') {
			return value;
		} else if (typeof value === 'number') {
			// // We need to make sure number values are not just
			// // rounded by 'toString', we need the absolute exact value.
			// // The EMCA specifications say it should be a double, so
			// // an 8-byte float.
			// var buffer = new ArrayBuffer(8);
			// var floatView = new Float64Array(buffer);
			// floatView[0] = value;
			// var intView = new Int32Array(buffer);
			// var a = intView[0];
			// var b = intView[1];
			// return {'@t':'f','@va':i,'@vb':b};
		}
		return value;
	}

	// Parses the output of JSONstringify.
	function JSONparse(str) {
		return JSON.parse(str,JSONreviver);
	}
	function JSONreviver(key,value) {
		// if (value !== null && typeof value === 'object') {
		// 	if (value['@t'] === 'f') {
		// 		var buffer = new ArrayBuffer(8);
		// 		var intView = new Int32Array(buffer);
		// 		intView[0] = value['@va'];
		// 		intView[1] = value['@vb'];
		// 		var floatView = new Float64Array(buffer);
		// 		return floatView[0];
		// 	}
		// }
		return value;
	}


	function random(seed) {
		var s = seed*21069.85449297633;
		return (Math.cos(77916.9690067824+s*s)+1)*0.5;
	}

	function randomInt(seed,max) {
		return Math.floor(random(seed)*max);
	}

	function randomSpeed(seed,min,max) {
		var r = (random(seed)-0.5)*2*(max-min);
		return r > 0 ? r+min : r-min;
	}

	function randomElement(seed,arr) {
		console.log(seed,random(seed),arr.length,Math.floor(random(seed)*arr.length));
		return arr[Math.floor(random(seed)*arr.length)];
	}

	function repeat(fn,count) {
		var arr = new Array(count);
		for(var i=0;i<count;i++) {
			arr[i] = fn(i);
		}
		return arr;
	}

	function swap(arr,ia,ib) {
		var v = arr[ia];
		arr[ia] = arr[ib];
		arr[ib] = v;
	}

	function shuffle(arr,seed) {
		var r = arr.map(identity);
		for(var i=arr.length-1;i>=0;i--) {
			var ri = randomInt(seed+i,i);
			swap(r,ri,i);
		}
		return r;
	}

	function arrayToObject(arr,keyfn,valuefn) {
		valuefn = valuefn || identity;
		var obj = {};
		for(var i=0;i<arr.length;i++) {
			obj[keyfn(arr[i])] = valuefn(arr[i]);
		}
		return obj;
	}

	function createLookup(arr,keyfn) {
		var r = {};
		for(var i=0;i<arr.length;i++) {
			r[keyfn(arr[i])] = arr[i];
		}
		return r;
	}

	return {
		debug: debug,
		findIndex: findIndex,
		contains: contains,
		remove: remove,
		extend: extend,
		assert: assert,
		identity: identity,
		deepClone: deepClone,
		hashCode: hashCode,
		JSONstringify: JSONstringify,
		JSONparse: JSONparse,
		random: random,
		randomSpeed: randomSpeed,
		randomElement: randomElement,
		randomInt: randomInt,
		repeat: repeat,
		swap: swap,
		shuffle: shuffle,
		arrayToObject: arrayToObject,
		createLookup: createLookup
	};
});