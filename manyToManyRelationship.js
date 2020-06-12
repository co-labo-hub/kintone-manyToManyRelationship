/*
* Original:
*   https://developer.cybozu.io/hc/ja/articles/360000528186-N-N-%E8%A4%87%E6%95%B0%E5%AF%BE%E8%A4%87%E6%95%B0-%E3%81%AE%E9%96%A2%E9%80%A3%E3%83%AC%E3%82%B3%E3%83%BC%E3%83%89%E4%B8%80%E8%A6%A7%E3%82%92%E8%87%AA%E4%BD%9C%E3%81%99%E3%82%8B
*   N:N（複数対複数）の関連レコード一覧を自作する
*   Copyright (c) 2018 Cybozu
*   Licensed under the MIT License
*
* Fork:
*   汎用化（設定値をconfigオブジェクトに集約）
*   TODO: プラグイン化し画面上で設定し値を保存
*/
(function() {
    'use strict';

    var config = {
        'placeFieldCode': 'placeholder',       //このアプリ内で埋め込むスペースのフィールドコード
        'relationFieldCode': 'thisAppId',       //関連付けするこのアプリ側のフィールドコード
        'relation': {                           //関連付けする別アプリ側の設定値
            'app': 'n',
            'query': 'thisAppIdInOtherApp in ("{{relationFieldCode}}")',    // 置換文字列: {{relationFieldCode}}
            'fields': ['otherAppId', 'somethingFieldCode'/*, ...*/],       //取得する列のフィールドコード
        },
        'linkFieldCode': 'otherAppId'         //リンクにする列のフィールドコード（config.relation.fields[] のどれか）
    };

    // To HTML escape
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function th(val) {
        return ''
            + '<th class="kintoneplugin-table-th">'
            +    '<span class="title" style="min-width: auto">' + val + '</span>'
            + '</th>';
    }
    function td(val, noEscape) {
        return ''
            + '<td>'
            +    '<div class="kintoneplugin-table-td-control">' + (noEscape ? val : escapeHtml(val)) + '</div>'
            + '</td>';
    }
    function a(id, text) {
        return ''
            + '<a href="/k/' + config.relation.app + '/show#record=' + escapeHtml(id) + '" target="_blank">'
            +    escapeHtml(text)
            + '</a>';
    }

    kintone.events.on(['app.record.detail.show', 'app.record.edit.show'], function(event) {

        var record = event.record;
        // 増殖バグ回避
        if (document.getElementById(config.placeFieldCode) !== null) {
            return event;
        }
        // スペースを取得
        var subtableSpace = kintone.app.record.getSpaceElement(config.placeFieldCode);

        var props = null;
        kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', {'app': config.relation.app})
        .then(function(resp) {
            props = resp.properties;
            // Rest API
            var params = JSON.parse(JSON.stringify(config.relation));
            params.query = params.query.replace('{{relationFieldCode}}', record[config.relationFieldCode].value);
            params.fields.push('$id');
            return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', params);
        }).then(function(resp) {
            var relTable = '<table class="kintoneplugin-table">';
            relTable += '<thead>';
            relTable += '<tr>';
            relTable += config.relation.fields.map(function(field) {
                            return th(props[field].label);
                        }).join('');
            relTable += '</tr>';
            relTable += '</thead>';
            relTable += '<tbody>';
            resp.records.forEach(function(record) {
                relTable += '<tr>';
                relTable += config.relation.fields.map(function(field) {
                                var val = record[field].value;
                                if (Array.isArray(val)) {
                                    val = val.map(function(elem) {return elem.name}).join(', ');
                                }
                                if(field == config.linkFieldCode) {
                                    val = a(record.$id.value, val);
                                    return td(val, true);
                                }
                                return td(val);
                            }).join('');
                relTable += '</tr>';
            });
            relTable += '</tbody>';
            relTable += '</table>';
            subtableSpace.innerHTML = relTable;
        }).catch(function(error) {
            // error:エラーの場合はメッセージを表示する
            var errmsg = 'レコード取得時にエラーが発生しました。';
            // レスポンスにエラーメッセージが含まれる場合はメッセージを表示する
            if (typeof error.message !== 'undefined') {
                errmsg += '\n' + error.message;
            }
            subtableSpace.appendChild(document.createTextNode(errmsg));
        });
        return event;
    });
})();
