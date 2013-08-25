define(function() {
	var BREAK = {};
	var DELETE = {};
	function IntrusiveList(name) {
		this.root = null;
		this._nextProp = '_next'+name;
	}
	var p = IntrusiveList.prototype;
	p.push = function(o) {
		if (this._nextProp in o) { throw "Already in list"; }
		o[this._nextProp] = this.root;
		this.root = o;
	};
	p.pop = function() {
		if (!(this._nextProp in o)) { throw "Not in list"; }
		var o = this.root;
		this.root = o[this._nextProp];
		return o;
	};
	p.each = function(f) {
		var o = this.root;
		if (!o) { return; }
		var prev = null;
		var next;
		while(o) {
			next = o[this._nextProp];
			var r = f(o,BREAK,DELETE);
			if (r === DELETE) {
				if(prev) {
					prev[this._nextProp] = next;
				} else {
					this.root = next;
				}
				delete o[this._nextProp];
				o = next;
				continue;
			} else if (r === BREAK) {
				break;
			}
			prev = o;
			o = next;
		}
	};
	return IntrusiveList;
});
