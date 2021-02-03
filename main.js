"use strict";
const utils = require('@iobroker/adapter-core');
let https = require('https');
let adapter, sesId, userAgentId, header, data = '', flag_subscribe = false, reload_data, reAuth_TimeOut;
let control_action = [
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

function startAdapter(options){
    return adapter = utils.adapter(Object.assign({}, options, {
        systemConfig: true,
        name:         'starline',
        ready:        main,
        unload:       callback => {
            reload_data && clearTimeout(reload_data);
            reAuth_TimeOut && clearTimeout(reAuth_TimeOut);
            try {
                debug('cleaned everything up...');
                callback();
            } catch (e) {
                callback();
            }
        },
        stateChange:  (id, state) => {
            if (id && state && !state.ack){
                debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
                let StateArray = id.split('.');
                let action = '';
                if (StateArray[3] === 'control'){
                    let alias = StateArray[2];
                    let value_command = state.val;
                    action = StateArray[4];
                    adapter.getState(alias + '.device_id', (err, state) => {
                        if (err || !state){
                        } else {
                            let deviceId = parseInt(state.val);
                            adapter.setState(alias + '.control.' + action, {ack: true});
                            if (action === 'ign' && value_command){
                                value_command = 1;
                            }
                            send_command(deviceId, action, value_command);
                        }
                    });
                    adapter.log.info('stateChange ' + id + ' - ' + JSON.stringify(state));
                }
            }
        },
    }));
}

function goto_web(){
    let options = {
        hostname: 'starline-online.ru',
        port:     443,
        path:     '/',
        method:   'GET'
    };
    options.headers = {
        'Host':            'starline-online.ru',
        'User-Agent':      'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Connection':      'keep-alive'
    };
    let req = https.request(options, (res) => {
        //res.setEncoding('utf8');
        adapter.log.debug('goto_web - response from the server statusCode: ' + res.statusCode);
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            //adapter.log.debug('Data:' + data);
            getSesId(res.headers, 'notoken', () => {
                adapter.log.debug('goto_web-cookie: ' + header);
                adapter.log.debug('auth_web (sesId)' + sesId);
                auth_web();
            });
        });
    });
    req.end();
    req.on('error', (err) => {
        adapter.log.error('Error: goto_web - ' + err);
        reAuth();
    });
}

function auth_web(){
    let post_data = {
        'username': adapter.config.login,
        'password': adapter.config.password
    };
    let options = {
        hostname: 'starline-online.ru',
        port:     443,
        path:     '/rest/security/login',
        method:   'POST'
    };
    options.headers = {
        //'Host':             'starline-online.ru',
        'user-Agent':       'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
        'accept':           'application/json, text/javascript, */*; q=0.01',
        'origin':           'https://starline-online.ru',
        'accept-Language':  'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6',
        'content-type':     'application/json',
        'x-requested-with': 'XMLHttpRequest',
        'referer':          'https://starline-online.ru/',
        'cookie':           'PHPSESSID=' + sesId + '; lang=ru;',
        'content-Length':   JSON.stringify(post_data).length
    };
    let req = https.request(options, (res) => {
        //res.setEncoding('utf8');
        adapter.log.debug('auth_web - response from the server statusCode: ' + res.statusCode);
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            //adapter.log.debug('Data:' + data);
            getSesId(res.headers, null, () => {
                if (userAgentId && sesId){
                    adapter.log.debug('auth_web-cookie: ' + header);
                    adapter.log.debug('get_data (phpsesid)' + sesId);
                    adapter.log.debug('get_data (token)' + userAgentId);
                    get_data();
                }
            });
        });
    });
    req.on('error', (err) => {
        adapter.log.error('Error: auth_web - ' + err);
        reAuth();
    });
    req.write(JSON.stringify(post_data));
    req.end();
}

function get_data(){
    let getdata = '';
    let eS = new Date().getTime() / 1000;
    eS = eS.toString().replace(".", "");
    let options = {
        hostname: 'starline-online.ru',
        port:     443,
        path:     '/device?tz=360&_=' + eS, //list
        method:   'GET'
    };
    options.headers = {
        'Host':            'starline-online.ru',
        'User-Agent':      'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer':         'https://starline-online.ru/site/map',
        'Cookie':          'PHPSESSID=' + sesId + '; userAgentId=' + userAgentId + '; lang=ru;',
        'Connection':      'keep-alive'
    };
    let req = https.request(options, (res) => {
        //res.setEncoding('utf8');
        adapter.log.debug('get_data - response from the server statusCode: ' + res.statusCode);

        res.on('data', (chunk) => {
            getdata += chunk;
        });
        res.on('end', () => {
            if (res.statusCode === 200){
                adapter.log.debug('Received data:' + getdata);
                parse_data(getdata);
            }
        });
    });
    req.end();
    req.on('error', (err) => {
        adapter.log.error('Error: get_data - ' + err);
        reAuth();
    });
}

function parse_data(getdata){
    let result;
    let device = [];
    try {
        result = JSON.parse(getdata);
        if (result.result){
            let numdevice = result.answer.devices.length;
            for (let t = 0; t < numdevice; t++) {
                device[t] = result.answer.devices[t].alias;
                adapter.log.debug('device- ' + device[t]);
                setObjectfun(device[t] + '.alias', result.answer.devices[t].alias, device[t]);
                setObjectfun(device[t] + '.skey', result.answer.skey);
                setObjectfun(device[t] + '.balance', result.answer.devices[t].balance.active.value);
                setObjectfun(device[t] + '.battery', result.answer.devices[t].battery);
                setObjectfun(device[t] + '.device_id', result.answer.devices[t].device_id);
                setObjectfun(device[t] + '.fw_version', result.answer.devices[t].fw_version);
                setObjectfun(device[t] + '.imei', result.answer.devices[t].imei);
                setObjectfun(device[t] + '.mayak_temp', result.answer.devices[t].mayak_temp);
                setObjectfun(device[t] + '.mon_type', result.answer.devices[t].mon_type);
                setObjectfun(device[t] + '.type', result.answer.devices[t].type);
                setObjectfun(device[t] + '._controls', result.answer.devices[t]._controls);
                setObjectfun(device[t] + '.reg', result.answer.devices[t].reg);
                setObjectfun(device[t] + '.rpl_channel', result.answer.devices[t].rpl_channel);
                setObjectfun(device[t] + '.sn', result.answer.devices[t].sn);
                setObjectfun(device[t] + '.ts_activity', result.answer.devices[t].ts_activity);
                setObjectfun(device[t] + '.shortParking', result.answer.devices[t].shortParking);
                setObjectfun(device[t] + '.longParking', result.answer.devices[t].longParking);
                setObjectfun(device[t] + '.shared_for_me', result.answer.devices[t].shared_for_me);
                setObjectfun(device[t] + '.showInsuranceEvents', result.answer.devices[t].showInsuranceEvents);
                setObjectfun(device[t] + '.ctemp', result.answer.devices[t].ctemp);
                setObjectfun(device[t] + '.etemp', result.answer.devices[t].etemp);
                setObjectfun(device[t] + '.gps_lvl', result.answer.devices[t].gps_lvl);
                setObjectfun(device[t] + '.gsm_lvl', result.answer.devices[t].gsm_lvl);
                setObjectfun(device[t] + '.phone', result.answer.devices[t].phone);
                setObjectfun(device[t] + '.status', result.answer.devices[t].status);
                //car_state
                setObjectfun(device[t] + '.car_state.add_sens_bpass', result.answer.devices[t].car_state.add_sens_bpass);
                setObjectfun(device[t] + '.car_state.alarm', result.answer.devices[t].car_state.alarm);
                setObjectfun(device[t] + '.car_state.arm', result.answer.devices[t].car_state.arm);
                setObjectfun(device[t] + '.car_state.door', result.answer.devices[t].car_state.door);
                setObjectfun(device[t] + '.car_state.hbrake', result.answer.devices[t].car_state.hbrake);
                setObjectfun(device[t] + '.car_state.hijack', result.answer.devices[t].car_state.hijack);
                setObjectfun(device[t] + '.car_state.hood', result.answer.devices[t].car_state.hood);
                setObjectfun(device[t] + '.car_state.ign', result.answer.devices[t].car_state.ign);
                setObjectfun(device[t] + '.car_state.out', result.answer.devices[t].car_state.out);
                setObjectfun(device[t] + '.car_state.pbrake', result.answer.devices[t].car_state.pbrake);
                setObjectfun(device[t] + '.car_state.r_start', result.answer.devices[t].car_state.r_start);
                setObjectfun(device[t] + '.car_state.run', result.answer.devices[t].car_state.run);
                setObjectfun(device[t] + '.car_state.shock_bpass', result.answer.devices[t].car_state.shock_bpass);
                setObjectfun(device[t] + '.car_state.tilt_bpass', result.answer.devices[t].car_state.tilt_bpass);
                setObjectfun(device[t] + '.car_state.trunk', result.answer.devices[t].car_state.trunk);
                setObjectfun(device[t] + '.car_state.valet', result.answer.devices[t].car_state.valet);
                setObjectfun(device[t] + '.car_state.webasto', result.answer.devices[t].car_state.webasto);
                //car_alr_state
                setObjectfun(device[t] + '.car_alr_state.add_h', result.answer.devices[t].car_alr_state.add_h);
                setObjectfun(device[t] + '.car_alr_state.add_l', result.answer.devices[t].car_alr_state.add_l);
                setObjectfun(device[t] + '.car_alr_state.door', result.answer.devices[t].car_alr_state.door);
                setObjectfun(device[t] + '.car_alr_state.hbrake', result.answer.devices[t].car_alr_state.hbrake);
                setObjectfun(device[t] + '.car_alr_state.hijack', result.answer.devices[t].car_alr_state.hijack);
                setObjectfun(device[t] + '.car_alr_state.hood', result.answer.devices[t].car_alr_state.hood);
                setObjectfun(device[t] + '.car_alr_state.ign', result.answer.devices[t].car_alr_state.ign);
                setObjectfun(device[t] + '.car_alr_state.pbrake', result.answer.devices[t].car_alr_state.pbrake);
                setObjectfun(device[t] + '.car_alr_state.shock_h', result.answer.devices[t].car_alr_state.shock_h);
                setObjectfun(device[t] + '.car_alr_state.shock_l', result.answer.devices[t].car_alr_state.shock_l);
                setObjectfun(device[t] + '.car_alr_state.tilt', result.answer.devices[t].car_alr_state.tilt);
                setObjectfun(device[t] + '.car_alr_state.trunk', result.answer.devices[t].car_alr_state.trunk);
                //services
                setObjectfun(device[t] + '.services.control', result.answer.devices[t].services.control);
                setObjectfun(device[t] + '.services.settings', result.answer.devices[t].services.settings);
                //position
                setObjectfun(device[t] + '.position.dir', result.answer.devices[t].position.dir);
                setObjectfun(device[t] + '.position.s', result.answer.devices[t].position.s);
                setObjectfun(device[t] + '.position.sat_qty', result.answer.devices[t].position.sat_qty);
                setObjectfun(device[t] + '.position.ts', result.answer.devices[t].position.ts);
                //setObjectfun (device[t]+'.position.x',result.answer.devices[t].position.x);
                setObjectfun(device[t] + '.position.longitude', result.answer.devices[t].position.x);
                //setObjectfun (device[t]+'.position.y',result.answer.devices[t].position.y);
                setObjectfun(device[t] + '.position.latitude', result.answer.devices[t].position.y);
                setObjectfun(device[t] + '.position.dir', result.answer.devices[t].position.dir);
            }
            adapter.log.info('Data received restart in 1 minutes.');
            reload_data = setTimeout(() => {
                get_data();
            }, 60000);
        }
        if (result.result === 0){
            error('Error get Parse Data:' + result.answer.error);
            //adapter.log.error('Error get Parse Data:' + result.answer.error);
            //CONSTRUCTION - Тех работы на сайте.
            reAuth();
        }
    } catch (e) {
        adapter.log.error('Parse error DATA');
        reAuth();
    }
}

function reAuth(){
    adapter.log.error('Re-authorization, and receiving data in 10 minutes.');
    reAuth_TimeOut = setTimeout(() => {
        clearTimeout(reload_data);
        goto_web();
    }, 600000);
}

function getSesId(head, notoken, cb){
    header = JSON.stringify(head);
    let pos = header.indexOf('PHPSESSID=');
    let pos_t = header.indexOf('userAgentId=');
    if (pos !== -1){
        sesId = header.substring(pos + 'PHPSESSID='.length);
        pos = sesId.indexOf(';');
        if (pos !== -1){
            sesId = sesId.substring(0, pos);
            cb && cb();
        } else {
            error('failed to get PHPSESSID');
            return;
        }
        adapter.log.debug('PHPSESSID=' + sesId);
    } else {
        error('failed to get PHPSESSID');
        return;
    }
    if (notoken !== 'notoken'){
        if (pos_t !== -1){
            userAgentId = header.substring(pos_t + 'userAgentId='.length);
            pos_t = userAgentId.indexOf(';');
            if (pos_t !== -1){
                userAgentId = userAgentId.substring(0, pos_t);
                cb && cb();
            } else {
                error('failed to get userAgentId');
                return;
            }
            adapter.log.debug('userAgentId=' + userAgentId);
        } else {
            error('failed to get userAgentId');
        }
    }
    //return;
}

function setObjectfun(name, state, device){
    let role = 'indicator';
    adapter.getState(device + '.alias', (err, state) => {
        if ((err || !state) && device){
            for (let t = 0; t < control_action.length; t++) {
                adapter.setObject(device + '.control.' + control_action[t], {
                    type:   'state',
                    common: {
                        name: device + '.control.' + control_action[t],
                        type: 'state',
                        role: 'indicator'
                    },
                    native: {}
                });
                adapter.setState(device + '.control.' + control_action[t], {val: false, ack: true});
            }
        } else {
            if (!flag_subscribe && device){
                adapter.subscribeStates(device + '.control.' + '*');
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
        type:   'state',
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
function send_command(device_id, action, value){
    data = '';
    let path = '/device/' + device_id + '/executeCommand';
    let post_data;
    switch (action) {
        case 'checkballance':
            path = '/device/balance';
            post_data = querystring.stringify({
                'device_id': device_id
            });
            break;
        case 'checktemp':
            path = '/device/batteryTemperature';
            post_data = querystring.stringify({
                'device_id': device_id
            });
            break;
        default:
            post_data = querystring.stringify({
                /*'device_id':device_id,*/
                'action':   action,
                'value':    value,
                'password': ''
            });
    }
    let options = {
        hostname: 'starline-online.ru',
        port:     443,
        path:     path,
        method:   'POST'
    };
    options.headers = {
        'Host':             'starline-online.ru',
        'User-Agent':       'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0',
        'Accept':           'application/json, text/javascript, */*; q=0.01',
        'Accept-Language':  'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Content-Type':     'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer':          'https://starline-online.ru/site/map',
        'Content-Length':   post_data.length,
        'Cookie':           'PHPSESSID=' + sesId + '; userAgentId=' + userAgentId + '; lang=ru;',
        'Connection':       'keep-alive'
    };
    let req = https.request(options, (res) => {
        //res.setEncoding('utf8');
        adapter.log.debug('send_command - response from the server statusCode: ' + res.statusCode);

        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            let result;
            try {
                result = JSON.parse(data);
                if (result.state){
                    adapter.log.info('It sent command: Device number - ' + device_id + ' * Command - ' + action + ' * Value - ' + value);
                } else {
                    adapter.log.info('Error sending command - ' + result.desc.action[0]);
                }
            } catch (e) {
                adapter.log.error('Send command. Parsing error response' + JSON.stringify(e));
            }
            setTimeout(() => {
                clearTimeout(reload_data);
                get_data();
            }, 10000);
        });
    });
    req.on('error', (err) => {
        adapter.log.error('Error: send_command - ' + err);
    });
    req.write(post_data);
    req.end();

}

function error(error){
    adapter.log.error('ERROR ' + error);
    reAuth();
}

/*******************************************************************/
function main(){
    if (adapter.config.login && adapter.config.password){
        goto_web();
    } else {
        adapter.log.error('Error! Is not set LOGIN and PASSWORD!');
    }
}


if (module.parent){
    module.exports = startAdapter;
} else {
    startAdapter();
}