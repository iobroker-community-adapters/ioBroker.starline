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
	createWidgetStatus: function (widgetID, view, data, style) {
		var $div = $('#' + widgetID);
		// if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.starline.createWidgetStatus(widgetID, view, data, style);
            }, 100);
        }

		var date = vis.states[data.oid + '.alias.ts'];
		
				var theDate = new Date(date * 1000);
				theDate = theDate.toGMTString();	
		
		var ctemp = vis.states[data.oid + '.ctemp.val'];
		var gsm_lvl = vis.states[data.oid + '.gsm_lvl.val'];
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
		var hijack;
		var tilt;
		var hammer1;
		var hammer2;
		var trunk;
		var trunk_r;
		var doors;
		var doors_r;
		var ign;
		var run;
		var run_r;
		var hood;
		var hood_r;
		var parking;
		var parking_r;
		var key;
		var key_r;
		var neutral;
		var hfree;

        var text = '';
//text +=	arr2;
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
text += '                    <span>Данные на '+theDate+'</span>';
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
		if (hijack == 1){
			$('.hijack-border').attr('style', 'display: block'); // 
		}
		if (arm == 1){
			$('.car-arm > .s1').attr('style', 'opacity: 1');
			$('.car-arm > .s2').attr('style', 'opacity: 1');
			$('.car-arm > .s3').attr('style', 'opacity: 1');
			$('.car-arm > .s4').attr('style', 'opacity: 1');
			$('.car-arm > .s5').attr('style', 'opacity: 1');
			if (hammer1 == 1){$('.car-hammer1-red').attr('style', 'opacity: 1');}
			if (hammer2 == 1){$('.car-hammer2-red').attr('style', 'opacity: 1');}
			if (trunk_r == 1){$('.car-trunk-red').attr('style', 'opacity: 1');}
			if (doors_r == 1){$('.car-doors-red').attr('style', 'opacity: 1');}
			if (run_r == 1){$('.car-run-red').attr('style', 'opacity: 1');}
			if (hood_r == 1){$('.car-hood-red').attr('style', 'opacity: 1');}
			if (parking_r == 1){$('.car-parking-red').attr('style', 'opacity: 1');}
			if (key_r == 1){$('.car-key-red').attr('style', 'opacity: 1');}
		}
		if (arm !=1){
			if (trunk == 1){$('.car-trunk').attr('style', 'opacity: 1');}
			if (doors == 1){$('.car-doors').attr('style', 'opacity: 1');}
			if (run == 1){$('.car-run').attr('style', 'opacity: 1');}
			if (hood == 1){$('.car-hood').attr('style', 'opacity: 1');}
			if (parking == 1){$('.car-parking').attr('style', 'opacity: 1');}
			if (key == 1){$('.car-key').attr('style', 'opacity: 1');}
		}
		
		if (neutral == 1){$('.car-neutral').attr('style', 'opacity: 1');}
		if (hfree == 1){$('.car-hfree').attr('style', 'opacity: 1');}
		if (ign == 1){
			$('.car-ign > .light').attr('style', 'opacity: 1');
			$('.car-ign > .s1').attr('style', 'opacity: 1');
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
    },
	
	createWidgetControl: function (widgetID, view, data, style) {
		var $div = $('#' + widgetID);
		// if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.starline.createWidgetControl(widgetID, view, data, style);
            }, 100);
        }
		
		var valet = vis.states[data.oid + '.car_state.valet.val'];
		var arm = vis.states[data.oid + '.car_state.arm.val'];
		var ign = vis.states[data.oid + '.car_state.ign.val'];
		var hijack = vis.states[data.oid + '.car_state.hijack.val'];
		var webasto = vis.states[data.oid + '.car_state.webasto.val'];
		var shock_bpass = vis.states[data.oid + '.car_state.shock_bpass.val'];
		var tilt_bpass = vis.states[data.oid + '.car_state.tilt_bpass.val'];
		

        var text = '';
//text +=	arr2;
text += '<div class="s2-control-container" style="padding: 0px; top: 0px; width: 317px; height:73px; overflow: hidden; padding: 0px; outline: none;">';
text += '		<div class="s2-control-button-toleft off"></div>';
text += '		<div class="s2-control-button-toright"></div>';
text += '		<div class="s2-control-scroll" style="width:267px;height:73px;overflow:hidden;position:relative;margin: 0 auto">';
text += '			<div class="s2-control-items">';
text += '				<div class="s2-control-itemA" style="width:267px;float:left;position:relative;">';
text += '					<div title="Включение режима антиограбления" data-id="hijack" data-number="0" data-command="31" class="hijack s2-control-button s2-control-left2">';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-hijack" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat 0px 0px;"></div>';
text += '						</div>';
text += '					</div>';
text += '					<div title="Снятие/постановка на охрану" data-id="arm" data-number="1" data-command="5" class="arm s2-control-button s2-control-left1">';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-arm" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -72px 0px;"></div>';
text += '						</div>';
text += '					</div>';
text += '					<div title="Включение/выключение двигателя" data-id="ign" data-number="2" data-command="7" class="ign s2-control-button s2-control-circle">	';
text += '						<div class="s2-control-push"></div>	';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-ign" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -36px 0px;"></div>';
text += '						</div>';
text += '					</div>';
text += '					<div title="Сигнал" data-id="poke" data-number="3" data-command="36" class="poke s2-control-button s2-control-right1">';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-poke" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -144px 0px;"></div>';
text += '						</div>';
text += '					</div>';
text += '					<div title="Управление предпусковым подогревом двигателя" data-id="webasto" data-number="4" data-command="81" class="webasto s2-control-button s2-control-right2">';
text += '						<div class="s2-control-push"></div>	';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-webasto" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) -108px 0px no-repeat;">	</div>';
text += '						</div>';
text += '					</div>';
text += '				</div>';
text += '				<div class="s2-control-item" style="width:267px;float:left;position:relative;">	';
text += '					<div title="Выключение датчика удара" data-id="shock_bpass" data-number="5" data-command="12" class="shock_bpass s2-control-button s2-control-left2">	';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-shock_bpass" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) -252px 0px no-repeat;">	</div>	';
text += '						</div>	';
text += '					</div>';
text += '					<div title="Отключение датчика наклона" data-id="tilt_bpass" data-number="6" data-command="15" class="tilt_bpass s2-control-button s2-control-left1">';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-tilt_bpass" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) -324px 0px no-repeat;"></div>';
text += '						</div>';
text += '					</div>';
text += '					<div title="Включить/выключить сервисный режим" data-id="valet" data-number="7" data-command="50" class="valet s2-control-button s2-control-circle">';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-valet" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) -288px 0px no-repeat;"></div>';
text += '						</div>';
text += '					</div>';
text += '					<div title="Запрос координат" data-id="update_position" data-number="8" data-command="43" class="update_position s2-control-button s2-control-right1">';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-update_position" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -360px 0px;"></div>';
text += '						</div>';
text += '					</div>	';
text += '					<div title="Активировать доп канал" data-id="add-command" data-number="9" data-command="0" class="add-command s2-control-button s2-control-right2">	';
text += '						<div class="s2-control-push"></div>';
text += '						<div class="s2-control-icon">';
text += '							<div class="s2-control-icon-out" style="background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -180px 0px;"></div>';
text += '						</div>';
text += '					</div>';
text += '				</div>';
text += '			</div>';
text += '		</div>';
text += '    </div>';

        $('#' + widgetID).html(text);
		
		$( ".s2-control-icon-hijack" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.hijack', 1);
		});
		$( ".s2-control-icon-arm" ).bind( "click", function() {
			if (arm == 0 || arm == 2){
				vis.setValue(data.oid + '.control.arm', 1);
			}
			else {
				vis.setValue(data.oid + '.control.arm', 0);
			}
		});
		$( ".s2-control-icon-ign" ).bind( "click", function() {
			if (ign == 0 || ign == 2){
				vis.setValue(data.oid + '.control.ign', 1);
			}
			else {
				vis.setValue(data.oid + '.control.ign', 0);
			}
		});
		$( ".s2-control-icon-poke" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.poke', 1);
		});		
		$( ".s2-control-icon-webasto" ).bind( "click", function() {
			if (webasto == 0 || webasto == 2){
				vis.setValue(data.oid + '.control.webasto', 1);
			}
			else {
				vis.setValue(data.oid + '.control.webasto', 0);
			}
		});
		$( ".s2-control-icon-shock_bpass" ).bind( "click", function() {
			if (shock_bpass == 0 || shock_bpass == 2){
				vis.setValue(data.oid + '.control.shock_bpass', 1);
			}
			else {
				vis.setValue(data.oid + '.control.shock_bpass', 0);
			}
		});
		$( ".s2-control-icon-tilt_bpass" ).bind( "click", function() {
			if (tilt_bpass == 0 || tilt_bpass == 2){
				vis.setValue(data.oid + '.control.tilt_bpass', 1);
			}
			else {
				vis.setValue(data.oid + '.control.tilt_bpass', 0);
			}
		});
		$( ".s2-control-icon-valet" ).bind( "click", function() {
			if (tilt_bpass == 0 || tilt_bpass == 2){
				vis.setValue(data.oid + '.control.valet', 1);
			}
			else {
				vis.setValue(data.oid + '.control.valet', 0);
			}
		});
		$( ".s2-control-icon-update_position" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.update_position', 1);
		});
		$( ".s2-control-icon-out" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.out', 1);
		});
		$( ".s2-control-button-toright" ).bind( "click", function() {
			$('.s2-control-itemA').attr('style', 'display: none'); 
			$('.s2-control-button-toleft').removeClass("off");
			$('.s2-control-button-toright').addClass("off");
		});
		$( ".s2-control-button-toleft" ).bind( "click", function() {
			$('.s2-control-itemA').attr('style', 'display: block'); 
			$('.s2-control-button-toright').removeClass("off");
			$('.s2-control-button-toleft').addClass("off");
		});
		
		if (hijack == 1){
			$('.s2-control-icon-hijack').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat 0px -35px;');
		}
		if (arm == 1){
			$('.s2-control-icon-arm').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -72px -35px;');
		}
		if (ign == 1){
			$('.s2-control-icon-ign').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -36px -35px;');
		}
		if (webasto == 1){
			$('.s2-control-icon-webasto').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -108px -35px no-repeat;');
		}
		if (shock_bpass == 1){
			$('.s2-control-icon-shock_bpass').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -252px -35px no-repeat;');
		}
		if (tilt_bpass == 1){
			$('.s2-control-icon-tilt_bpass').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -324px -35px no-repeat;');
		}
		if (valet == 1){
			$('.s2-control-icon-valet').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -288px -35px no-repeat;');
		}
		
		
        // subscribe on updates of value
        if (vis.states[data.oid + '.ctemp.val']) {
            vis.states.bind(data.oid + '.ctemp.val', function (e, newVal, oldVal) {
                $div.find('.ctemp_value').html(newVal);
            });
        }
    }
};
	
//vis.binds.starline.showVersion();
