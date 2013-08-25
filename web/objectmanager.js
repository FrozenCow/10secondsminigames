define(['intrusivelist','dintrusivelist'],function(IntrusiveList,DIntrusiveList) {
	function ObjectManager() {
		var me = this;
		this.lists = {};
		this.objects = new DIntrusiveList('object');
		this.named = {};
		this.pendingAdd = new IntrusiveList('pendingAdd');
		this.pendingRemove = new IntrusiveList('pendingRemove');
	}
	var p = ObjectManager.prototype;
	p.add = function(o) {
		this.pendingAdd.push(o);
	};
	p.createIndexList = function(property) {
		var list = new DIntrusiveList(property);
		list.property = property;
		return list;
	};
	p.remove = function(o) {
		this.pendingRemove.push(o);
	};
	p.clear = function(o) {
		var me = this;
		me.handlePending();
		me.objects.each(function(o) {
			console.log(o);
			me.remove(o);
		});
		me.handlePending();
	};
	p.handlePending = function() {
		var me = this;
		me.pendingAdd.each(function(o,_,DELETE) {
			me.objects.push(o);
			for(var n in me.lists) {
				if (o[me.lists[n].property]) {
					me.lists[n].push(o);
				}
			}
			if (o.name) {
				if (me.named[o.name]) {
					throw "Another object with the same name was already added.";
				}
				me.named[o.name] = o;
			}
			return DELETE;
		});
		me.pendingRemove.each(function(o,_,DELETE) {
			delete o.__pendingRemove;
			me.objects.remove(o);
			for(var n in me.lists) {
				if (o[me.lists[n].property]) {
					me.lists[n].remove(o);
				}
			}
			if (o.name) {
				delete me.named[o.name];
			}
			return DELETE;
		});
	};
	return ObjectManager;
});
