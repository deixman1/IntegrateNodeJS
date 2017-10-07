'use strict';
var ajax = require('./node_modules/libs/ajax.js');
var VK = require('./node_modules/libs/VK.js');
var Telegram = require('./node_modules/libs/Telegram.js');
//var result = exports.send('https://api.vk.com/method/messages.getLongPollServer', 'GET', { access_token: VK.token } );
ajax.GET('https://api.vk.com/method/messages.getLongPollServer', { access_token: VK.token });

console.log(VK);
process.stdin.read();