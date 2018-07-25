const TelegramBot = require('node-telegram-bot-api');
global.__base_dir = process.env.PWD;
logInfo(global.__base_dir);
const fs = require('fs');
const tokenJson = JSON.parse(fs.readFileSync(__base_dir + '/config/token.json', 'utf8'));

const token = tokenJson['token'];
logInfo('token : ' + token);
const bot = new TelegramBot(token, {polling: true});


// ============== load config =======================
const configJson                    = JSON.parse(fs.readFileSync(__base_dir + '/config/config.json', 'utf8'));

// config for queue which generated by bot to remove.
const queueConfig                   = configJson['queue'];
const queueBound                    = queueConfig['queueBound'];
const queueBatchRemoveSize          = queueConfig['queueBatchRemoveSize'];

// configs for welcome message.
const welcomeConfig                 = configJson['welcome'];
const welcomePreMsg                 = welcomeConfig['welcomePreMsg'];
const welcomePostMsg                = welcomeConfig['welcomePostMsg'];

// configs to filter message.
const filterConfig                  = configJson['filter'];
const filterResponseMessage         = filterConfig['filterResponseMessage'];

// config for keyboard
const keyboard                      = configJson['keyboard'];
let keyboardMap                     = new Map();

// config for funnyTalk
const funnyTalk                     = configJson['funnyTalk'];

//* variables for application.
const Queue = require('./queue.js');
let welcomeMsgQ = new Queue();
let funnyMsgQ   = new Queue();
let filterWarningMsgQ = new Queue();


bot.on('polling_error', (error) => {
    logErr(error);
});

bot.onText(/\/question/, function(msg, match) {
    var text = 'What is your favorite meal?';

    var keyboardStr = JSON.stringify({
        inline_keyboard: [
            [
                {text:'Sandwich',callback_data:'sandwich'},
                {text:'A juicy steak',callback_data:'steak'}
            ]
        ]
    });

    var keyboard = {reply_markup: JSON.parse(keyboardStr)};
    bot.sendMessage(msg.chat.id, text, keyboard);
});

bot.on('callback_query', function (msg) {
    bot.answerCallbackQuery(msg.id, msg.data, false, undefined, 3);
});

function generateKeyboard(jsonArr){
    /**
     * 1. collect key from jsonArr.
     * 2. make array constructed only keys.
     */
    let keyArr=[];
    for(let jsonObj in jsonArr){
        if(jsonObj.isArray())
            keyArr.add(jsonObj.key);
    }
}

bot.onText(/\/start/, (msg) => {
    if(isPrivateChat(msg)) {
        bot.sendMessage(msg.chat.id, "Welcome", {
            "reply_markup": {
                "keyboard": [["Sample text", "Second sample"], ["Keyboard"], ["I'm robot"]]
            },

        });
    }
});

bot.on('message', (msg) => {
    //* private chat
    if(isPrivateChat(msg)){

    }

    //new chat member
    if (msg.new_chat_members != null) {
        let sentMessage = sendMessage(bot, msg, onNewChatMember(msg));

        //* remove joined message which generated by telegram app automatically.
        bot.deleteMessage(msg.chat.id, msg.message_id);

        //* add welcome Message to queue and pop oldest
        sentMessage.then((message) => {
            welcomeMsgQ.add(message);
            if (welcomeMsgQ.size() > queueBound) {
                for (let i = 0; i < queueBatchRemoveSize; i++) {
                    const oldestMessage = welcomeMsgQ.pop();
                    bot.deleteMessage(oldestMessage.chat.id, oldestMessage.message_id);
                }
            }
        });
    }

    if (msg.left_chat_member != null) {
        onRemoveMember(msg);
        bot.deleteMessage(msg.chat.id, msg.message_id);
    }
    if (!containsBlacklist(msg)) {
        logInfo('chat[' + msg.chat.id + '] sender[' + getUserName(msg.from)+ '] ' + "\nmessage : " + msg.text);
        responseFunnyTalk(bot, msg);
    }
});

function responseFunnyTalk(bot, msg) {
    for(const key in funnyTalk){
        if(msg.text.toLowerCase().includes(key)){
            sendMessage(bot, msg, funnyTalk[key]).then((message) => {
                funnyMsgQ.add(message);
                if (funnyMsgQ.size() > 1) {
                    const oldestMessage = funnyMsgQ.pop();
                    bot.deleteMessage(oldestMessage.chat.id, oldestMessage.message_id);
                }
            });
        }
    }

}


function containsBlacklist(msg) {
    let result = false;
    if (containsUrl(msg) ||
        containsPhoto(msg) ||
        containsDocument(msg) ||
        containsVideoMedia(msg) ||
        containsAudioMedia(msg)
    ) { //* If the message contains filtering target.
        result = true;

        //* delete filtered message
        bot.deleteMessage(msg.chat.id, msg.message_id);
        logInfo('Message[' + msg.message_id + '] is removed on the chat[' + msg.chat.id + ']');

        //* response to warn to do not upload filtering target messages.
        let sentMessage = sendMessage(bot, msg, getUserName(msg.from) + filterResponseMessage);
        sentMessage.then((message) => {
            filterWarningMsgQ.add(message);
            if (filterWarningMsgQ.size() > 1) {
                const oldestMessage = filterWarningMsgQ.pop();
                bot.deleteMessage(oldestMessage.chat.id, oldestMessage.message_id);
            }
        });
    }
    return result;
}

function containsUrl(msg) {
    let result = false;
    if (msg.entities !== undefined) {
        for (let i = 0; i < msg.entities.length; i++) {
            const entity = msg.entities[i];
            if (entity.type == 'url') {
                logInfo('User \'' + getUserName(msg.from) + '\' send message which contains url.');
                result = true;
            }

        }
    }
    return result;
}

function containsDocument(msg) {
    return msg.document !== undefined;
}

function containsPhoto(msg) {
    return msg.photo !== undefined;
}

function containsVideoMedia(msg) {
    return containsVideo(msg) || containsVideoNote(msg);
}

function containsVideoNote(msg) {
    return msg.video_note !== undefined;
}

function containsVideo(msg) {
    return msg.video !== undefined;
}

function containsAudioMedia(msg) {
    return containsAudio(msg) || containsVoice(msg);
}

function containsAudio(msg) {
    return msg.audio !== undefined;
}

function containsVoice(msg) {
    return msg.voice !== undefined;
}


function getUserName(user) {
    return user.last_name === undefined ? user.first_name : user.first_name + ' ' + user.last_name;
}

function onNewChatMember(msg) {
    let new_members = '';
    msg.new_chat_members.forEach((member, idx) => {
        new_members += getUserName(member) + ', ';
    });
    new_members = new_members.substring(0, new_members.length - 2);
    new_members += '. ';
    logInfo('bot on ' + 'new_chat_members' + '[ ' + new_members);
    return welcomePreMsg + new_members + welcomePostMsg;
}

function onRemoveMember(msg) {
    var str = getUserName(msg.left_chat_member);
    logInfo(str + ' is removed on the chat ' + msg.chat.name);
}

// });


/**
 * This method is to treat sendMessage method automatically. Because the return value of sendMessage is Promise type.
 * </br>
 * @param bot bot object.
 * @param msg original message object.
 * @param text which you want to write.
 * @return Promise object if sending message is success. If not, do not return.
 */
function sendMessage(bot, msg, text) {
    if (text !== undefined && text !== "") {
        const returnValue = bot.sendMessage(msg.chat.id, text)
            .catch((error) => {
                logErr(error);
            });
        return returnValue;
    }
}

function isPrivateChat(msg) {
    return msg.chat.type.toLowerCase() === "private";
}

function logInfo(msg) {
    console.log(msg);
}

function logErr(msg) {
    console.error(msg);
}


// function isWellcomeMsg(msg) {
//     _msg = msg.toLowerCase();
//     if(_msg.includes(''))
// }