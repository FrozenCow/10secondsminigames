define(function() {
	return function(g) {
		g.state = null;
		g.changeState = function(state) {
			if (this.state) { this.state.disable(); }
			this.state = state;
			if (this.state) { this.state.enable(); }
		};
		return {
			create: function(obj) {
				
			}
		};
	};
});