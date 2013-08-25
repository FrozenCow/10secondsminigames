define(function() {
	var DELETE = {};
	var BREAK = {};

	function DIntrusiveList(name) {
			this.root = null;
			this._nextProp = '_next'+name;
			this._prevProp = '_prev'+name;
	}
	var p = DIntrusiveList.prototype;
	p.push = function(o) {
		if (this._nextProp in o) { throw "Already in list"; }
		var next = this.root;
		if (next) {
			next[this._prevProp] = o;
		}
		o[this._nextProp] = next;
		o[this._prevProp] = null;
		this.root = o;
		this.each(function(o) {
			if (o[this._nextProp] === o) {
				throw "koek";
			}
		});
	};
	p.pop = function() {
		this.remove(this.root);
	};
	p.remove = function(o) {
		if (!(this._nextProp in o)) { throw "Not in list"; }
		var prev = o[this._prevProp];
		var next = o[this._nextProp];
		if (this.root === o) {
			this.root = next;
		} else {
			prev[this._nextProp] = next;
		}
		if (next) {
			next[this._prevProp] = prev;
		}
		delete o[this._nextProp];
		delete o[this._prevProp];
	};
	p.each = function(f) {
		var o = this.root;
		if (!o) { return; }
		var next;
		while(o) {
			next = o[this._nextProp];
			var r = f(o,BREAK,DELETE);
			if (r === DELETE) {
				this.remove(o);
				o = next;
				continue;
			} else if (r === BREAK) {
				break;
			} else {
				o = next;
			}
		}
	};
	return DIntrusiveList;
});
