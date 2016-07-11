/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

// you have to require the utils module and call adapter function
 var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
 var https = require('https');
 var querystring = require('querystring');
 var sesId;
 var token;
 var header;
 var data = '';
 var flag_subscribe = false;
 var reload_data;
	var control_action = [
			'valet', 
			'hijack', 
			'update_position', 
			'shock_bpass', 
			'tilt_bpass', 
			'webasto', 
			'ign', 
			'arm', 
			'poke', 
			'add_sens_bpass', 
			'out', 
			'checkballance', 
			'checktemp'
	];
 
 var adapter = utils.adapter('starline');
// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});
// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    //adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});
// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    //adapter.log.error('stateChange ' + id + ' - ' + JSON.stringify(state));
 if (state && !state.ack) {
		var StateArray = id.split('.');
		var action = '';
        if (StateArray[3] == 'control'){
          var alias = StateArray[2];
          var value_command = state.val;
          action = StateArray[4];
        adapter.getState(alias +'.device_id', function (err, state) {
      		if (err || !state) {
      		} else {
      		  var deviceId = parseInt(state.val);
			  //adapter.log.error('parseInt(state.val) ' + deviceId);  
			  adapter.setState(alias +'.control.'+action, {ack: true});
      		  send_command (deviceId,action,value_command);
      		}
      	});
          adapter.log.info('stateChange ' + id + ' - ' + JSON.stringify(state));
        }
  }
});
// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj == 'object' && obj.message) {
        if (obj.command == 'send') {
            // e.g. send email or pushover or whatever
            console.log('send command');
            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});
// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();
});
function goto_web (){
var options = {
  hostname: 'starline-online.ru',
  port: 443,
	path: '/',
	method: 'GET'
};
  options.headers = {
    'Host': 'starline-online.ru',
  	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
  	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  	'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
  	'Connection': 'keep-alive'
  };
	var req = https.request(options, function (res) {
        //res.setEncoding('utf8');
	    adapter.log.debug('goto_web - response from the server statusCode: ' + res.statusCode);
      res.on('data', function (chunk) {
      	data += chunk;
      });
      res.on('end', function () {
        //adapter.log.debug('Data:' + data);
		getSesId (res.headers,'notoken');
      adapter.log.debug('goto_web-cookie: ' + header);
    	adapter.log.debug('auth_web (sesId)' + sesId);
    	auth_web ();
      });
    });
	req.end();
		req.on('error', function (err) {
        	adapter.log.error('Error: goto_web - ' + err);
        	reAuth ();
    });
}
function auth_web (){
	var post_data = querystring.stringify({
		'LoginForm[login]':adapter.config.login,
		'LoginForm[pass]':adapter.config.password,
		'LoginForm[rememberMe]':'on',
		'captcha[code]':'',
		'captcha[sid]':''
  	});
var options = {
  hostname: 'starline-online.ru',
  port: 443,
	path: '/user/login', 
	method: 'POST'
};
    options.headers = {
        'Host': 'starline-online.ru',
      	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
      	'Accept': 'application/json, text/javascript, */*; q=0.01',
      	'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
      	'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      	'X-Requested-With': 'XMLHttpRequest',
      	'Referer': 'https://starline-online.ru/',
      	'Cookie': 'PHPSESSID='+sesId+'; lang=ru;',
      	'Content-Length': post_data.length,
      	'Connection': 'keep-alive'
    };
var req = https.request(options, function (res) {
  //res.setEncoding('utf8');
        adapter.log.debug('auth_web - response from the server statusCode: ' + res.statusCode);
        res.on('data', function (chunk) {
        	data += chunk;
        });
        res.on('end', function () {
          //adapter.log.debug('Data:' + data);
			getSesId (res.headers);
			if (token && sesId){
				adapter.log.debug('auth_web-cookie: ' + header);
      			adapter.log.debug('get_data (phpsesid)' + sesId);
      			adapter.log.debug('get_data (token)' + token);
      			get_data ();
			}
        });
    });
	req.on('error', function (err) {
        	adapter.log.error('Error: auth_web - ' + err);
        	reAuth ();
	});
	req.write(post_data);
	req.end();
}
function get_data (){
	var getdata = '';
	var eS = new Date().getTime() / 1000;
	eS = eS.toString().replace(".","");
var options = {
  hostname: 'starline-online.ru',
  port: 443,
	path: '/device/list?tz=360&_='+eS,
	method: 'GET'
};
		options.headers = {
	    'Host': 'starline-online.ru',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
			'Referer': 'https://starline-online.ru/site/map',
			'Cookie': 'PHPSESSID='+sesId+'; t='+token+'; lang=ru;',
			'Connection': 'keep-alive'
	    };	
		var req = https.request(options, function (res) {
			//res.setEncoding('utf8');
			adapter.log.debug('get_data - response from the server statusCode: ' + res.statusCode);
			
			res.on('data', function (chunk) {
				getdata += chunk;
			});
			res.on('end', function () {
				if (res.statusCode == 200){
					adapter.log.debug('Received data:' + getdata);
					parse_data (getdata);
				}
			});
		});
		req.end();
		req.on('error', function (err) {
				adapter.log.error('Error: get_data - ' + err);
				reAuth ();
			});
}
function parse_data (getdata){
	var result;
	var device = [];
	try {
  	result = JSON.parse(getdata);
  	if (result.result){
  		var numdevice = result.answer.devices.length;
  		for (var t = 0; t < numdevice; t++) {
  		  device[t] = result.answer.devices[t].alias;
  		  adapter.log.debug('device- ' + device[t]);				
  			setObjectfun (device[t]+'.alias',result.answer.devices[t].alias,device[t]);
  			setObjectfun (device[t]+'.skey',result.answer.skey);
  			setObjectfun (device[t]+'.balance',result.answer.devices[t].balance);
  			setObjectfun (device[t]+'.battery',result.answer.devices[t].battery);
  			setObjectfun (device[t]+'.device_id',result.answer.devices[t].device_id);
  			setObjectfun (device[t]+'.fw_version',result.answer.devices[t].fw_version);
  			setObjectfun (device[t]+'.imei',result.answer.devices[t].imei);
  			setObjectfun (device[t]+'.mayak_temp',result.answer.devices[t].mayak_temp);
  			setObjectfun (device[t]+'.mon_type',result.answer.devices[t].mon_type);
  			setObjectfun (device[t]+'.type',result.answer.devices[t].type);
  			setObjectfun (device[t]+'._controls',result.answer.devices[t]._controls);
  			setObjectfun (device[t]+'.reg',result.answer.devices[t].reg);
  			setObjectfun (device[t]+'.rpl_channel',result.answer.devices[t].rpl_channel);
  			setObjectfun (device[t]+'.sn',result.answer.devices[t].sn);
  			setObjectfun (device[t]+'.ts_activity',result.answer.devices[t].ts_activity);
  			setObjectfun (device[t]+'.shortParking',result.answer.devices[t].shortParking);
  			setObjectfun (device[t]+'.longParking',result.answer.devices[t].longParking);
  			setObjectfun (device[t]+'.shared_for_me',result.answer.devices[t].shared_for_me);
  			setObjectfun (device[t]+'.showInsuranceEvents',result.answer.devices[t].showInsuranceEvents);
  			setObjectfun (device[t]+'.ctemp',result.answer.devices[t].ctemp);
  			setObjectfun (device[t]+'.etemp',result.answer.devices[t].etemp);
  			setObjectfun (device[t]+'.gps_lvl',result.answer.devices[t].gps_lvl);
  			setObjectfun (device[t]+'.gsm_lvl',result.answer.devices[t].gsm_lvl);
  			setObjectfun (device[t]+'.phone',result.answer.devices[t].phone);
  			setObjectfun (device[t]+'.status',result.answer.devices[t].status);
  			//car_state
  			setObjectfun (device[t]+'.car_state.add_sens_bpass',result.answer.devices[t].car_state.add_sens_bpass);
  			setObjectfun (device[t]+'.car_state.alarm',result.answer.devices[t].car_state.alarm);
  			setObjectfun (device[t]+'.car_state.arm',result.answer.devices[t].car_state.arm);
  			setObjectfun (device[t]+'.car_state.door',result.answer.devices[t].car_state.door);
  			setObjectfun (device[t]+'.car_state.hbrake',result.answer.devices[t].car_state.hbrake);
  			setObjectfun (device[t]+'.car_state.hijack',result.answer.devices[t].car_state.hijack);
  			setObjectfun (device[t]+'.car_state.hood',result.answer.devices[t].car_state.hood);
  			setObjectfun (device[t]+'.car_state.ign',result.answer.devices[t].car_state.ign);
  			setObjectfun (device[t]+'.car_state.out',result.answer.devices[t].car_state.out);
  			setObjectfun (device[t]+'.car_state.pbrake',result.answer.devices[t].car_state.pbrake);
  			setObjectfun (device[t]+'.car_state.r_start',result.answer.devices[t].car_state.r_start);
  			setObjectfun (device[t]+'.car_state.run',result.answer.devices[t].car_state.run);
  			setObjectfun (device[t]+'.car_state.shock_bpass',result.answer.devices[t].car_state.shock_bpass);
  			setObjectfun (device[t]+'.car_state.tilt_bpass',result.answer.devices[t].car_state.tilt_bpass);
  			setObjectfun (device[t]+'.car_state.trunk',result.answer.devices[t].car_state.trunk);
  			setObjectfun (device[t]+'.car_state.valet',result.answer.devices[t].car_state.valet);
  			setObjectfun (device[t]+'.car_state.webasto',result.answer.devices[t].car_state.webasto);
  			//car_alr_state
  			setObjectfun (device[t]+'.car_alr_state.add_h',result.answer.devices[t].car_alr_state.add_h);
  			setObjectfun (device[t]+'.car_alr_state.add_l',result.answer.devices[t].car_alr_state.add_l);
  			setObjectfun (device[t]+'.car_alr_state.door',result.answer.devices[t].car_alr_state.door);
  			setObjectfun (device[t]+'.car_alr_state.hbrake',result.answer.devices[t].car_alr_state.hbrake);
  			setObjectfun (device[t]+'.car_alr_state.hijack',result.answer.devices[t].car_alr_state.hijack);
  			setObjectfun (device[t]+'.car_alr_state.hood',result.answer.devices[t].car_alr_state.hood);
  			setObjectfun (device[t]+'.car_alr_state.ign',result.answer.devices[t].car_alr_state.ign);
  			setObjectfun (device[t]+'.car_alr_state.pbrake',result.answer.devices[t].car_alr_state.pbrake);
  			setObjectfun (device[t]+'.car_alr_state.shock_h',result.answer.devices[t].car_alr_state.shock_h);
  			setObjectfun (device[t]+'.car_alr_state.shock_l',result.answer.devices[t].car_alr_state.shock_l);
  			setObjectfun (device[t]+'.car_alr_state.tilt',result.answer.devices[t].car_alr_state.tilt);
  			setObjectfun (device[t]+'.car_alr_state.trunk',result.answer.devices[t].car_alr_state.trunk);
  			//services
  			setObjectfun (device[t]+'.services.control',result.answer.devices[t].services.control);
  			setObjectfun (device[t]+'.services.settings',result.answer.devices[t].services.settings);
  			//position
  			setObjectfun (device[t]+'.position.dir',result.answer.devices[t].position.dir);
  			setObjectfun (device[t]+'.position.s',result.answer.devices[t].position.s);
  			setObjectfun (device[t]+'.position.sat_qty',result.answer.devices[t].position.sat_qty);
  			setObjectfun (device[t]+'.position.ts',result.answer.devices[t].position.ts);
  			//setObjectfun (device[t]+'.position.x',result.answer.devices[t].position.x);
  			setObjectfun (device[t]+'.position.longitude',result.answer.devices[t].position.x);
  			//setObjectfun (device[t]+'.position.y',result.answer.devices[t].position.y);
  			setObjectfun (device[t]+'.position.latitude',result.answer.devices[t].position.y);
  			setObjectfun (device[t]+'.position.dir',result.answer.devices[t].position.dir);
  		}	
		adapter.log.info('Data received restart in 1 minutes.');
  		reload_data = setTimeout(function () {
                  	get_data ();
              	}, 60000);
  	}
  	if (result.result == 0){
  	  error('Error get Parse Data:' + result.answer.error);
  		//adapter.log.error('Error get Parse Data:' + result.answer.error);
  		//CONSTRUCTION - Тех работы на сайте.
		reAuth ();
  	}
	} catch (e) {
		adapter.log.error('Parse error DATA');
		reAuth ();
	}
}
function reAuth (){
	adapter.log.error('Re-authorization, and receiving data in 10 minutes.');
	setTimeout(function () {
			clearTimeout(reload_data);
         	goto_web ();
    }, 600000);
}
function getSesId (head,notoken){
      header = JSON.stringify(head);
			var pos = header.indexOf('PHPSESSID=');
			var pos_t = header.indexOf('t=');
				if (pos != -1) {
				  sesId = header.substring(pos + 'PHPSESSID='.length);
				  pos = sesId.indexOf(';');
				  	if (pos != -1) {
				  	  sesId = sesId.substring(0, pos);
				  	} else {
				  	  error('failed to get PHPSESSID');
				  	  return;
				  	}
				  adapter.log.debug('PHPSESSID=' + sesId);
				}	else {
				  error('failed to get PHPSESSID');
				  return;
				}
		    if (notoken != 'notoken'){
			if (pos_t != -1) {
  			  token = header.substring(pos_t + 't='.length);
  			  pos_t = token.indexOf(';');
					if (pos_t != -1) {
					  token = token.substring(0, pos_t);
					} else {
					  error('failed to get token');
					  return;
					}
				  adapter.log.debug('token=' + token);
				}	else {
				  error('failed to get token');
				  return;
				}
			}
		//return;
}
function setObjectfun (name,state,device){
	var role = 'indicator';
  adapter.getState(device +'.alias', function (err, state) {
  		if ((err || !state) && device) {
				  for (var t = 0; t < control_action.length; t++) {
					  adapter.setObject(device +'.control.'+control_action[t], {
					type: 'state',
						common: {
						name: device +'.control.'+control_action[t],
						type: 'state',
						role: 'indicator'
					},
					native: {}
				  });
					adapter.setState(device +'.control.'+control_action[t], {val: false, ack: true});
				  }
  		}	else {
  		   if (!flag_subscribe && device){
  		      adapter.subscribeStates(device +'.control.' + '*');
  		      flag_subscribe = true;
  		   }
  		}
	});
		
		if (~name.indexOf('longitude')){
			role = 'value.gps.longitude';
		}
		if (~name.indexOf('latitude')){
			role = 'value.gps.longitude';
		}
		
		 adapter.setObject(name, {
	    	type: 'state',
	      	common: {
	      		name: name,
	      		type: 'state',
	      		role: role
	      	},
	      native: {}
	   });
		adapter.setState(name, {val: state, ack: true});	
}
/******************************************************************/
function send_command (device_id,action,value){ 
  data = '';
  var path = '/device/setCommand';
  var post_data;
  switch (action) {
      case 'checkballance':
          path = '/device/balance';
          post_data = querystring.stringify({
      		  'device_id':device_id
          });
        break;
      case 'checktemp':
          path = '/device/batteryTemperature';
          post_data = querystring.stringify({
        		'device_id':device_id
          });
        break;
      default:
          post_data = querystring.stringify({
      		'device_id':device_id,
      		'action':action,
      		'value':value
        });
   }
var options = {
    hostname: 'starline-online.ru',
    port: 443,
		path: path,
		method: 'POST'
};
		options.headers = {
			'Host': 'starline-online.ru',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest',
			'Referer': 'https://starline-online.ru/site/map',
			'Content-Length': post_data.length,
			'Cookie': 'PHPSESSID='+sesId+'; t='+token+'; lang=ru;',
			'Connection': 'keep-alive'
	    };	
		var req = https.request(options, function (res) {
			//res.setEncoding('utf8');
			adapter.log.debug('send_command - response from the server statusCode: ' + res.statusCode);

			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function () {
				var result;
		try{
        result = JSON.parse(data);
        	if (result.state){
        		adapter.log.info('It sent command: Device number - ' + device_id+' * Command - '+action+' * Value - '+value);
		      } else {
		        adapter.log.info('Error sending command - '+result.desc.action[0]);
		      }
		} catch (e) {
  		adapter.log.error('Send command. Parsing error response' + JSON.stringify(e));
	  }
				setTimeout(function () {
					clearTimeout(reload_data);
                	get_data ();
            	}, 10000);
			});
		});
	req.end();
	req.on('error', function (err) {
     adapter.log.error('Error: send_command - ' + err);
	});
	req.write(post_data);
	req.end();
	
}
function error (error){
	adapter.log.error('ERROR '+error);
  	reAuth ();
}
/*******************************************************************/
function main() {
	if (adapter.config.login && adapter.config.password){
    		goto_web ();
	} else {
		adapter.log.error('Error! Is not set LOGIN and PASSWORD!');	
		return
	}

}
