/*
    ioBroker.starline Widget-Set
    version: "0.1.0"
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
    version: "0.1.0",
    showVersion: function () {
        if (vis.binds.starline.version) {
            console.log('Version starline: ' + vis.binds.starline.version);
            vis.binds.starline.version = null;
        }
    },
	states: {
		oid_alias: 					{val: undefined, selector: '.alias_value', 	    	blink: false, objName: 'alias'},
		oid_ctemp: 					{val: undefined, selector: '', 				    	blink: false, objName: 'ctemp'},
		oid_gsm_lvl: 				{val: undefined, selector: '.gsm-status', 		    blink: false},
		oid_gps_lvl: 				{val: undefined, selector: '.gps-status',	    	blink: false},
		oid_car_state_valet: 		{val: undefined, selector: '.valet-border', 	    blink: false},
		oid_status: 				{val: undefined, selector: 'menu-status', 		    blink: false},
		oid_car_state_arm:			{val: undefined, selector: '.car-arm > .s1, .car-arm > .s2, .car-arm > .s3, .car-arm > .s4, .car-arm > .s5', blink: false},
		oid_control_checkballance:  {val: undefined, selector: '', 					    blink: false, objName: 'balance'},
		oid_control_checktemp: 		{val: undefined, selector: '', 				    	blink: false, objName: 'battery'},
		oid_hijack:                 {val: undefined, selector: '.hijack-border', 	    blink: false},
		oid_tilt:                 	{val: undefined, selector: '.car-tiltsensor-red', 	blink: false},
		oid_hammer1:                {val: undefined, selector: '.car-hammer1-red',  	blink: true},
		oid_hammer2:                {val: undefined, selector: '.car-hammer2-red', 	    blink: true},
		oid_trunk:                  {val: undefined, selector: '.car-trunk', 			blink: false},
		oid_trunk_r:                {val: undefined, selector: '.car-trunk-red', 	    blink: true},
		oid_doors:                  {val: undefined, selector: '.car-doors', 			blink: false},
		oid_doors_r:                {val: undefined, selector: '.car-doors-red', 		blink: false},
		oid_ign:                    {val: undefined, selector: '.car-ign > .light',     blink: true},
		oid_run:                    {val: undefined, selector: '.car-run', 				blink: false},
		oid_run_r:                  {val: undefined, selector: '.car-run-red', 			blink: false},
		oid_hood:                   {val: undefined, selector: '.car-hood', 			blink: false},
		oid_hood_r:                 {val: undefined, selector: '.car-hood-red', 		blink: false},
		oid_parking:                {val: undefined, selector: '.car-parking', 			blink: false},
		oid_parking_r:              {val: undefined, selector: '.car-parking-red', 		blink: false},
		oid_key:                    {val: undefined, selector: '.car-key', 				blink: false},
		oid_key_r:                  {val: undefined, selector: '.car-key-red', 			blink: false},
		oid_neutral:                {val: undefined, selector: '.car-neutral', 			blink: false},
		oid_hfree:                  {val: undefined, selector: '.car-hfree', 			blink: false}
	},
	createWidgetStatus: function (widgetID, view, data, style) {
		var $div = $('#' + widgetID);
		// if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.starline.createWidgetStatus(widgetID, view, data, style);
            }, 100);
        }

		function setVisible(selector, isVisible, isBlink) {
			if (isVisible) {
				$(selector).show();

			} else {
				$(selector).hide();
			}
			if (isBlink) {
				$(selector).addClass('blink_me');
			} else {
				$(selector).removeClass('blink_me');
			}
		}

		function updateStates() {
			var states = JSON.parse(JSON.stringify(vis.binds.starline.states));

			// read all states
			for (var s in states) {
				if (data[s] && data[s] !== 'nothing_selected') states[s].val = vis.states[data[s] + '.val'];
			}

			// convert time
			if (states.oid_alias) {
				var date = new Date(1000 * vis.states[data.oid_alias + '.ts']).toGMTString();
				$div.find('.date').html('Данные на ' + date);
			}

			// convert gsm
			if (states.oid_gsm_lvl.val >= 1  && states.oid_gsm_lvl.val <= 7)  {
				states.oid_gsm_lvl.val = 1;
			} else
			if (states.oid_gsm_lvl.val >= 7  && states.oid_gsm_lvl.val <  14) {
				states.oid_gsm_lvl.val = 2;
			} else
			if (states.oid_gsm_lvl.val >= 14 && states.oid_gsm_lvl.val <  21) {
				states.oid_gsm_lvl.val = 3;
			} else
			if (states.oid_gsm_lvl.val >= 21 && states.oid_gsm_lvl.val <  28) {
				states.oid_gsm_lvl.val = 4;
			} else
			if (states.oid_gsm_lvl.val >= 28 && states.oid_gsm_lvl.val <= 30) {
				states.oid_gsm_lvl.val = 5;
			}

			if (states.oid_gps_lvl.val >= 1  && states.oid_gps_lvl.val <= 7) {
				states.oid_gps_lvl.val = 1;
			} else
			if (states.oid_gps_lvl.val >= 7  && states.oid_gps_lvl.val < 14) {
				states.oid_gps_lvl.val = 2;
			} else
			if (states.oid_gps_lvl.val >= 14 && states.oid_gps_lvl.val < 21) {
				states.oid_gps_lvl.val = 3;
			}


			if (states.oid_status.val){
				$('.menu-status').removeClass('off').addClass('on');
			} else {
				$('.menu-status').removeClass('on').addClass('off');
			}

			if (states.oid_car_state_valet.val){
				$('.valet-border').show();
			} else {
				$('.valet-border').hide();
			}
			if (states.oid_hijack.val){
				$('.hijack-border').show();
			} else {
				$('.hijack-border').hide();
			}

			if (states.oid_car_state_arm.val) {
				states.oid_trunk.val 	= false;
				states.oid_doors.val 	= false;
				states.oid_run.val 		= false;
				states.oid_hood.val 	= false;
				states.oid_parking.val 	= false;
			}

			for (var s in states) {
				if (states[s].selector) setVisible(states[s].selector, states[s].val, states[s].blink && states[s].val);
			}

			setVisible('.car-ign > .s1',    states.oid_ign);
			$('.ctemp_value').html(states.oid_ctemp.val);
		}

		if (data.oid_control_checkballance && data.oid_control_checkballance !== 'nothing_selected') {
			$("li.balance").click(function () {
				vis.setValue(data.oid_control_checkballance, 1);
			});
		}

		if (data.oid_control_checktemp && data.oid_control_checktemp !== 'nothing_selected') {
			$("li.ctemp, li.etemp").click(function () {
				vis.setValue(data.oid_control_checktemp, 1);
			});
		}

		debugger;
        // subscribe on updates of values
		for (var s in vis.binds.starline.states) {
			if (!data[s] || data[s] == 'nothing_selected') continue;
			vis.states.bind(data[s] + '.val', function () {
				updateStates();
			});
		}
		// initial update
		updateStates();
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
		

        

        $('#' + widgetID).html(text);
		
		$( ".control-icon-hijack" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.hijack', 1);
		});
		$( ".control-icon-arm" ).bind( "click", function() {
			if (arm == 0 || arm == 2){
				vis.setValue(data.oid + '.control.arm', 1);
			}
			else {
				vis.setValue(data.oid + '.control.arm', 0);
			}
		});
		$( ".control-icon-ign" ).bind( "click", function() {
			if (ign == 0 || ign == 2){
				vis.setValue(data.oid + '.control.ign', 1);
			}
			else {
				vis.setValue(data.oid + '.control.ign', 0);
			}
		});
		$( ".control-icon-poke" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.poke', 1);
		});		
		$( ".control-icon-webasto" ).bind( "click", function() {
			if (webasto == 0 || webasto == 2){
				vis.setValue(data.oid + '.control.webasto', 1);
			}
			else {
				vis.setValue(data.oid + '.control.webasto', 0);
			}
		});
		$( ".control-icon-shock_bpass" ).bind( "click", function() {
			if (shock_bpass == 0 || shock_bpass == 2){
				vis.setValue(data.oid + '.control.shock_bpass', 1);
			}
			else {
				vis.setValue(data.oid + '.control.shock_bpass', 0);
			}
		});
		$( ".control-icon-tilt_bpass" ).bind( "click", function() {
			if (tilt_bpass == 0 || tilt_bpass == 2){
				vis.setValue(data.oid + '.control.tilt_bpass', 1);
			}
			else {
				vis.setValue(data.oid + '.control.tilt_bpass', 0);
			}
		});
		$( ".control-icon-valet" ).bind( "click", function() {
			if (tilt_bpass == 0 || tilt_bpass == 2){
				vis.setValue(data.oid + '.control.valet', 1);
			}
			else {
				vis.setValue(data.oid + '.control.valet', 0);
			}
		});
		$( ".control-icon-update_position" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.update_position', 1);
		});
		$( ".control-icon-out" ).bind( "click", function() {
			vis.setValue(data.oid + '.control.out', 1);
		});
		$( ".control-button-toright" ).bind( "click", function() {
			$('.control-items').animate({ "marginLeft": "-=267px" }, "slow" );
			$('.control-button-toleft').removeClass("off");
			$('.control-button-toright').addClass("off");
		});
		$( ".control-button-toleft" ).bind( "click", function() {
			$('.control-items').animate({ "marginLeft": "+=267px" }, "slow" );
			$('.control-button-toright').removeClass("off");
			$('.control-button-toleft').addClass("off");
		});
		
		if (hijack == 1){$('.control-icon-hijack').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat 0px -35px;');}
		if (arm == 1){$('.control-icon-arm').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -72px -35px;');}
		if (ign == 1){$('.control-icon-ign').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) no-repeat -36px -35px;');}
		if (webasto == 1){$('.control-icon-webasto').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -108px -35px no-repeat;');}
		if (shock_bpass == 1){$('.control-icon-shock_bpass').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -252px -35px no-repeat;');}
		if (tilt_bpass == 1){$('.control-icon-tilt_bpass').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -324px -35px no-repeat;');}
		if (valet == 1){$('.control-icon-valet').attr('style', 'background:url(./widgets/starline/img/buttons-icon-set_white.png) -288px -35px no-repeat;');}
		
        // subscribe on updates of value
        if (vis.states[data.oid + '.alias.val']) {
            vis.states.bind(data.oid + '.alias.val', function (e, newVal, oldVal) {
                $div.find('.alias_value').html(newVal);
            });
        }
    }
};

if (vis.editMode) {
	vis.binds.starline.changeOid = function (widgetID, view, newId, attr, isCss) {
		newId = newId.substring(0, newId.length - attr.length + 'oid_'.length);
		var changed = [];
		for (var s in vis.binds.starline.states) {
			if (s === 'oid_alias' || !vis.binds.starline.states[s].objName) continue;
			if (vis.objects[newId + vis.binds.starline.states[s].objName]) {
				changed.push(s);
				vis.views[view].widgets[widgetID].data[s] 	= newId + vis.binds.starline.states[s].objName;
				vis.widgets[widgetID].data[s] 				= newId + vis.binds.starline.states[s].objName;
			}
		}

		return changed;
	};
}

vis.binds.starline.showVersion();
