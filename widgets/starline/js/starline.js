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
		
		var ctemp = vis.states[data.oid + '.ctemp.val'];
		
		var gsm_lvl = vis.states[data.oid + '.gsm_lvl'+'.val'];
		var gsm = 0;
			if (gsm_lvl >= 1 && gsm_lvl <=7){gsm = 1}
			if (gsm_lvl >= 7 && gsm_lvl <14){gsm = 2}
			if (gsm_lvl >= 14 && gsm_lvl <21){gsm = 3}
			if (gsm_lvl >= 21 && gsm_lvl <28){gsm = 4}
			if (gsm_lvl >= 28 && gsm_lvl <=30){gsm = 5}
		
		var gps_lvl = vis.states[data.oid + '.gps_lvl.val'];
		var gps = 0;
			if (gps_lvl >= 1 && gsm_lvl <=7){gps = 1}
			if (gps_lvl >= 7 && gsm_lvl <14){gps = 2}
			if (gps_lvl >= 14 && gsm_lvl <21){gps = 3}
		
		var alias = vis.states[data.oid + '.alias.val'];
		
		var valet = vis.states[data.oid + '.car_state.valet.val'];
		var arm = vis.states[data.oid + '.car_state.arm.val'];
		

		
		
		
		
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.starline.createWidget(widgetID, view, data, style);
            }, 100);
        }
		

        var text = '';
//text += data.oid;
text += '<div class="starline_header">';
text += '<div class="gpsgsm-cont">';
text += '				<div class="gpsgsm-status">';
text += '					<div class="clearfix">';
text += '						<div style="float:left"><div class="gsm-status" title="" data-level="'+gsm+'"></div>';
text += '							<div align="center" class="greyColor" style="color:#59626E;font-size:90%">gsm</div>';
text += '						</div>';
text += '						<div style="float:left;margin-left:10px;">';
text += '							<div title="" class="gps-status" data-level="'+gps+'"></div>';
text += '							<div class="greyColor" align="center" style="color:#59626E;font-size:90%">gps</div>';
text += '						</div>';
text += '						<div style="float:right"></div>';
text += '					</div>';
text += '				</div>';
text += '            </div>';
text += '            <div class="menu-item-title-container">';
text += '                <div class="menu-status onoff off"></div>';
text += '                    <div>'+alias+'</div>';
text += '                    <span>Данные на '+'24.06.2015, 23:29'+'</span>';
text += '            </div>';
text += '        </div>';
text += '';
text += '			<div class="starline_body">';
text += '				<div data-id="info" style="padding-top: 1px; position: relative; opacity: 1; overflow: hidden;">';
text += '					<div class="valet-border"><div class="valet-content">Сервисный<br>режим</div></div>';
text += '					<div class="hijack-border"><div class="hijack-content">Режим<br>антиограбления</div></div>';
text += '					<div class="car-status" style="height: 133px;">';
text += '						<div class="car-tiltsensor-red"></div>';
text += '						<div class="car-hammer1-red"></div>';
text += '						<div class="car-hammer2-red"></div>';
text += '						<div class="car-trunk-red" style="opacity: 0;"></div>';
text += '						<div class="car-trunk" style="opacity: 0;"></div>';
text += '						<div class="car-doors-red" style="opacity: 0;"></div>';
text += '						<div class="car-doors" style="opacity: 0;"></div>';
text += '						<div class="car-ign">';
text += '							<div class="light"></div>';
text += '							<div class="s1"></div>';
text += '							<div class="s2"></div>';
text += '							<div class="s3"></div>';
text += '						</div>';
text += '						<div class="car-arm">';
text += '							<div class="s1"></div>';
text += '							<div class="s2"></div>';
text += '							<div class="s3"></div>';
text += '							<div class="s4"></div>';
text += '							<div class="s5"></div>';
text += '						</div>';
text += '						<div class="car-run"></div>';
text += '						<div class="car-run-red"></div>';
text += '						<div class="car-hood-red" style="opacity: 0;"></div>';
text += '						<div class="car-parking" style="opacity: 0;"></div>';
text += '						<div class="car-parking-red" style="opacity: 0;"></div>';
text += '						<div class="car-hood" style="opacity: 1;"></div>';
text += '						<div class="car-key" style="opacity: 0;"></div>';
text += '						<div class="car-key-red" style="opacity: 0;"></div>';
text += '						<div class="car-neutral" title="Режим «Программная нейтраль» включен" style="opacity: 0;"></div>';
text += '						<div class="car-hfree" title="Режим «Свободные руки» включен" style="opacity: 0;"></div>';
text += '						<div class="car"></div>';
text += '					</div>';
text += '					<div class="menu-item-tab-car-controls">';
text += '					<ul class="under-buttons-panel">';
text += '					<li id="balance" class="balance" title="Баланс SIM-карты"><div class="balance_icon"></div><span class="balance_value">'+ vis.states[data.oid + '.balance.val'] +'</span></li>';
text += '					<li id="battery" class="battery" title="Напряжение аккумулятора"><div class="battery_icon"></div><span class="battery_value">'+ vis.states[data.oid + '.battery.val'] +'В</span></li>';
text += '					<li id="t1" class="ctemp" title="Температура в салоне"><div class="ctemp_icon"></div><span class="ctemp_value">'+ ctemp +'°C</span></li>';
text += '					<li id="t2" class="etemp" title="Температура двигателя"><div class="etemp_icon"></div><span class="etemp_value">'+ vis.states[data.oid + '.etemp.val'] +'°C</span></li>';
text += '					</ul></div>';
text += '				</div>';
text += '			</div>';

        $('#' + widgetID).html(text);
		
		if (valet == 1){
			$('.valet-border').attr('style', 'display: block'); // 
		}
		if (arm == 1){
			$('.car-arm > .s1').attr('style', 'opacity: 1');
			$('.car-arm > .s2').attr('style', 'opacity: 1');
			$('.car-arm > .s3').attr('style', 'opacity: 1');
			$('.car-arm > .s4').attr('style', 'opacity: 1');
			$('.car-arm > .s5').attr('style', 'opacity: 1');
		}
		
		$( "li.balance" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.checkballance', 1);
		});
		
		$( "li.ctemp, li.etemp").bind( "click", function() {
			vis.setValue(data.oid + '.control.checktemp', 1);
		});

        // subscribe on updates of value
        if (vis.states[data.oid + '.ctemp.val']) {
            vis.states.bind(data.oid + '.ctemp.val', function (e, newVal, oldVal) {
                $div.find('.ctemp_value').html(newVal);
            });
        }
    }
};
	
vis.binds.starline.showVersion();
