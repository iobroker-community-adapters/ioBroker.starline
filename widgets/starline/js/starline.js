/*
    ioBroker.starline Widget-Set

    version: "0.0.1"

    Copyright 10.2015-2016 instalator <vvvalt@mail.ru>

*/
"use strict";

// add translations for edit mode
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        "myColor":          {"en": "myColor",       "de": "mainColor",  "ru": "Мой цвет"},
        "myColor_tooltip":  {
            "en": "Description of\x0AmyColor",
            "de": "Beschreibung von\x0AmyColor",
            "ru": "Описание\x0AmyColor"
        },
        "htmlText":         {"en": "htmlText",      "de": "htmlText",   "ru": "htmlText"},
        "group_extraMyset": {"en": "extraMyset",    "de": "extraMyset", "ru": "extraMyset"},
        "extraAttr":        {"en": "extraAttr",     "de": "extraAttr",  "ru": "extraAttr"}
    });
}

// add translations for non-edit mode
$.extend(true, systemDictionary, {
    "Instance":  {"en": "Instance", "de": "Instanz", "ru": "Инстанция"}
});

// this code can be placed directly in template.html
vis.binds.starline = {
    version: "0.0.1",
    showVersion: function () {
        if (vis.binds.starline.version) {
            console.log('Version starline: ' + vis.binds.starline.version);
            vis.binds.starline.version = null;
        }
    },
	createWidget: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
		
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.starline.createWidget(widgetID, view, data, style);
            }, 100);
        }
		 //$this.find(".ctemp_value").append('vis.states[data.oid + '.val']');

        var text = '';
        /*text += 'OID: ' + data.oid + '</div><br>';
        text += 'OID value: <span class="myset-value">' + vis.states[data.oid + '.val'] + '</span><br>';
        text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + '</span><br>';
        text += 'extraAttr: ' + data.extraAttr + '<br>';
        text += 'Browser instance: ' + vis.instance + '<br>';
        text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || '') + '</textarea><br>';*/

       // $('#' + widgetID).html(text);

        // subscribe on updates of value
        if (vis.states[data.oid + '.balance.val']) {
            vis.states.bind(data.oid + '.balance.val', function (e, newVal, oldVal) {
                $div.find('.starline-value').html(newVal);
            });
        }
    }
};
	
vis.binds.starline.showVersion();
