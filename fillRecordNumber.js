/*
* Licensed under the MIT License
*/
(function() {
	'use strict';
	var config = {
		"tableFieldCode": "",
		"valueFieldCode": ""
	};

	var evtTypes = ['app.record.create.show',
					'mobile.app.record.create.show'];
	kintone.events.on(evtTypes, function(event) {
		var params = new URL(document.location).searchParams;
		if (params.get('action')) {
			event
			.record[config.tableFieldCode]
			.value[0]
			.value[config.valueFieldCode]
			.value = params.get('record');
		}
		return event;
	});
})();
