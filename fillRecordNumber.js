/*
* Licensed under the MIT License
*/
(function() {
    'use strict';
    var config = [
        {
            "action": 0000000,  // URL param: action=?
            "app": 1,           // URL param: app=?
            "tableFieldCode": "",
            "valueFieldCode": "",
            "isLookupField": true
        },
        /*
        {
            "action": 0000001,
            "app": 2,
            "tableFieldCode": "",
            "valueFieldCode": "",
            "isLookupField": true
        }
        */
    ];

    var evtTypes = ['app.record.create.show', 'mobile.app.record.create.show'];
    kintone.events.on(evtTypes, function(event) {
        var params = new URL(document.location).searchParams;
        for (var i = 0; i < config.length; i++) {
            var conf = config[i];
            if (params.get('action') == conf.action && params.get('app') == conf.app) {
                var target = event
                            .record[conf.tableFieldCode]
                            .value[0]
                            .value[conf.valueFieldCode];
                target.value = params.get('record');
                if (conf.isLookupField) {
                    target.lookup = true;
                }
                break;
            }
        }
        return event;
    });
})();
