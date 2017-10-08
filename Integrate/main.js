'use strict';
var ajax = require('./node_modules/libs/ajax.js');
var VK = require('./node_modules/libs/VK.js');
var Telegram = require('./node_modules/libs/Telegram.js');
var utf8 = require('utf8');
var messages = {
    photo: [],
    video: [],
    audio: [],
    doc: []
};
function clear() {
    messages = {
        photo: [],
        video: [],
        audio: [],
        doc: []
    };
}
var shit = false;

get_for_polling_vk();

function get_for_polling_vk() {
    ajax.GET('https://api.vk.com/method/messages.getLongPollServer', { access_token: VK.token }, 'start_polling_vk(obj)');
}

global.start_polling_vk = function (obj = false) {
    if (obj) {
        VK.ts = obj.response.ts;
        VK.key = obj.response.key;
        VK.server = obj.response.server;
    }
    ajax.GET(
        'https://' + VK.server,
        {
            key: VK.key,
            ts: VK.ts,
            act: 'a_check',
            wait: 25,
            mode: 2,
            version: 2
        },
        'result_polling_vk(obj)'
    );
}
global.result_polling_vk = function (obj) {
    if (typeof obj.failed !== "undefined") {
        get_for_polling_vk();
        //return;
    }
    else {
        var array = obj.updates;
        VK.ts = obj.ts;
        for (key in array)
        {
            if (array[key][0] == 4)
                if (array[key][3] == 2000000003)
                    message_from_vk(array[key][1]);
        }
        start_polling_vk();
    }
}
function message_from_vk(id) {
    ajax.GET(
        'https://api.vk.com/method/messages.getById',
        {
            message_ids: id,
            access_token: VK.token
        },
        'processing_message_vk(obj)'
    );
}
global.processing_message_vk = function (obj) {
    if (!obj.response[1].out) {
        VK.uid = obj.response[1].uid;
        if (obj.response[1].body != "") {
            //if (obj.response[1].body.search(reg) != -1)
            //    messages.atext = 'я сосу хуи с======8';
            //else
            messages.atext = obj.response[1].body;
        }
        //if (typeof obj.response[1].fwd_messages !== "undefined") {
        //    SendTelegram_fwd_messages(obj.response[1].fwd_messages, VK.uid);
        //    shit = true;
        //}
        if (typeof obj.response[1].attachments !== "undefined") {
            attachments(obj.response[1].attachments);
            shit = true;
        }
        if (!shit)
            sendTelegram(VK.uid);
        shit = false;
    }
}
function attachments(e, wall = true) {
    for (key in e){
        switch (e[key].type) {
            case 'video':
                //sendTelegramVideo(VK.uid, 0);
                console.log(e[key].video);
                messages.video[messages.video.length] = e[key].video;
                //if(e.length-1 == key)
                //	sendTelegramVideo(VK.uid, 0);
                break;
            case 'doc':
                // statements_1
                messages.doc[messages.doc.length] = e[key].doc.url;
                //if(e.length-1 == key)
                //	sendTelegramDoc(VK.uid, 0);
                break;
            case 'photo':
                // statements_1 src_big 137774
                console.log(e[key].photo.src_big);
                messages.photo[messages.photo.length] = e[key].photo.src_big;
                //if(e.length-1 == key)
                //	sendTelegramPhoto(VK.uid, 0);
                break;
            case 'audio':
                // statements_1 src_big 137774
                if (typeof e[key].audio.url !== "undefined")
                    messages.audio[messages.audio.length] = e[key].audio.url;
                //if(e.length-1 == key && messages.audio.length)
                //	sendTelegramAudio(VK.uid, 0);
                break;
            case 'wall':
                if (typeof e[key].wall.text !== "undefined")
                    messages.atext += '\n' + e[key].wall.text;
                if (typeof e[key].wall.attachments !== "undefined")
                    attachments(e[key].wall.attachments, false);
                else
                    sendTelegram(VK.uid);
                break;
        }
    }

    if (wall)
        for (key in messages) {
            switch (key) {
                case 'video':
                    if (messages.video.length)
                        sendTelegramVideo(VK.uid, 0);
                    break;
                case 'audio':
                    if (messages.audio.length)
                        sendTelegramAudio(VK.uid, 0);
                    break;
                case 'photo':
                    if (messages.photo.length)
                        sendTelegramPhoto(VK.uid, 0);
                    break;
                case 'doc':
                    if (messages.doc.length)
                        sendTelegramDoc(VK.uid, 0);
                    break;
            }
        }
}
global.sendTelegram = function (uid, user = false) {
    if (user)
    {
        VK.messageReturn = '(VK)' + user.response[0].first_name + ' ' + user.response[0].last_name + ':\n'
        if (messages.atext !== undefined)
            VK.messageReturn += messages.atext + '\n';
        VK.messageReturn = VK.messageReturn.replace(/\<br\>/g, '\n');
        VK.messageReturn = utf8.encode(VK.messageReturn);
        ajax.GET(
            'https://api.telegram.org/bot' + Telegram.token + '/sendMessage',
            {
                chat_id: Telegram.chatId,
                text: VK.messageReturn
            }
        );
        clear();
    }
    else
    {
        ajax.GET(
            'https://api.vk.com/method/users.get',
            {
                user_ids: uid,
                access_token: VK.token
            },
            'sendTelegram(' + uid + ', obj)'
        );
    }
        
}
//console.log(VK);
process.stdin.read();