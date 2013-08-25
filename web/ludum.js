define(['utils','ludum-updater','ludum-drawer','ludum-constants'],function(utils,updater,drawer,constants) {

	function init() {
		return {
			frame: 0,
			players: [],
			state: { type: 'touchtheball' }
		};
	}

	var eventTypePriority = {
		'connect': 1,
		'up': 2,
		'down': 3,
		'disconnect': 5
	};
	function compare(va,vb) {
		if (va === undefined) {
			if (vb === undefined) { return 0; }
			return 1;
		} else if (vb === undefined) {
			return -1;
		}
		return (va > vb) ? 1 : (vb > va ? -1 : 0);
	}
	function compareEvents(ea,eb) {
		utils.assert(eventTypePriority[ea.type]);
		utils.assert(eventTypePriority[eb.type]);
		return compare(eventTypePriority[ea.type],eventTypePriority[eb.type]) || compare(ea.clientid,eb.clientid) || compare(ea.key,eb.key) || compare(ea.name,eb.name);
	}
	return {
		init: updater.init,
		update: updater.update,
		draw: drawer,
		compareEvents: compareEvents,
		constants: constants
	};
});