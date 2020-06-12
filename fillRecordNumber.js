/*
* Licensed under the MIT License
*/
(function() {
    'use strict';
    var config = {
        "tableFieldCode": "",
        "valueFieldCode": "",
        "isLookupField": true
    };
    
    var evtTypes = ['app.record.create.show', 'mobile.app.record.create.show'];
    kintone.events.on(evtTypes, function(event) {
        var params = new URL(document.location).searchParams;
        if (params.get('action')) {
            var target = event
                        .record[config.tableFieldCode]
                        .value[0]
                        .value[config.valueFieldCode];
            target.value = params.get('record');
            if (config.isLookupField) {
                target.lookup = true;
            }
        }
        return event;
    });
})();
