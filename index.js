const TelegramBot = require('node-telegram-bot-api');

const fs = require('fs');
const tokenJson = JSON.parse(fs.readFileSync('./token.json', 'utf8'));

const token = tokenJson['token'];
console.log('token : ' + token);
const bot = new TelegramBot(token, {polling: true});

const wellComeMsg_candidates=['hi', ];
const wellcomePreMsg = 'Hi ';
const wellcomepostMsg = 'Wellcome to Remiit. Thanks for concerning Remiit project.:)';


function containsUrl(msg){
    msg.entities.forEach((entity, idx) => {
        if(entity.type === 'url') {
            console.log('User \''+ getUserName(msg.from) + '\' send message which contains url.');
            return true;
        }
    });
    return false;
}

function containsBlacklist(msg) {
    let result = false;
    if(containsUrl(msg)){
        bot.sendMessage(msg.chat.id, getUserName(msg.from) + ". You cannot send message which contains url on this chat.");
        result = true;
    }

    if(result){
        bot.deleteMessage(msg.chat.id, msg.message_id);
        console.log('Message[' + msg.message_id + '] is removed on the chat[' + msg.chat.id + ']');
    }
    return result;
}

function getUserName(user){
    return user.last_name === '' ? user.first_name : user.first_name + ' ' + user.last_name;
}
// bot.on('new_chat_members', (msg) => {
function onNewChatMember(msg) {
    let new_members = '';
    // for (var member in msg.new_chat_members) {
    //     //member is user type.
    //     new_members += getUserName(member) + ', ';
    // }
    msg.new_chat_members.forEach((member, idx) => {
        new_members += getUserName(member) + ', ';
    });
    new_members = new_members.substring(0, new_members.length - 2);
    new_members += '. ';
    console.log('bot on ' + 'new_chat_members' + '[ ' + new_members);
    const message = wellcomePreMsg + new_members + wellcomepostMsg;
    bot.sendMessage(msg.chat.id, message);
}

function onRemoveMember(msg){
    var str = getUserName(msg.left_chat_member);
    bot.sendMessage(msg.chat.id, 'GoodBye ' + str);
    console.log(str + ' is removed on the chat ' + msg.chat.name);
}
// });

bot.on('message', (msg) => {
    //anything
    if(msg.new_chat_members != null){
        onNewChatMember(msg);
    }
    if(msg.left_chat_member != null){
        onRemoveMember(msg);
    }
    if(!containsBlacklist(msg)){
        const hi = "hi";
        if (msg.text.toString().toLowerCase().indexOf(hi) === 0) {
            bot.sendMessage(msg.chat.id, "Hello dear user");
        } else {
            bot.sendMessage(msg.chat.id, "Eho v1: " + msg.text);
        }

        var bye = "bye";
        if (msg.text.toString().toLowerCase().includes(bye)) {
            bot.sendMessage(msg.chat.id, "Hope to see you around again , Bye");
        } else {
            bot.sendMessage(msg.chat.id, "Eho: " + msg.text);
        }
    }
});



// function isWellcomeMsg(msg) {
//     _msg = msg.toLowerCase();
//     if(_msg.includes(''))
// }