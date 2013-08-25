define(function() {
	function mix(target,source) {
		for(var name in source) {
			if (source.hasOwnProperty(name)) {
				if (target.hasOwnProperty(name)) {
					console.error("Could not mix field",name,"of mixin",source,"to",target,"since it already exists.");
				} else {
					target[name] = source[name];
				}
			}
		}
	}
	return function(/* prototype?, mixins..., methods */) {
		var args = Array.prototype.slice.call(arguments);

		var methods = args.pop();
		var prototype = args.shift();
		var mixins = args;

		// Make a new constructor if there isn't any defined.
		if (!methods.hasOwnProperty('constructor')) {
			methods.constructor = function UnnamedClass() { };
		}
		var constructor = methods.constructor;
		constructor.prototype = methods;

		methods.prototype = prototype;

		mixins.forEach(function(mixin) {
			mix(methods, mixin);
		});

		return constructor;
	};
});
