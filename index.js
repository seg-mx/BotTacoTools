require('dotenv').config();
const config = require('./config.json');
const fs = require('fs');

const {Client, Intents} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const data = require('./data.json');
const {loadData, saveData} = require('./src/dataManager.js');
const {sortMap} = require('./src/utils.js');
const sendStats = require('./src/stats.js');
const buyList = new Map();

let cleanTimestamp = config.clean_timestamp;
let dailyTimestamp = config.daily_timestamp;

let income = 0;
let upgrades = loadData(data);

client.on('ready', () => {
    console.log(client.user.username + " is ready!");

    client.channels.fetch(process.env.CHANNEL_ID).then(channel => {
        if (cleanTimestamp != 0) {
            let time = cleanTimestamp-Date.now();
            if (time > 0) {
                setTimeout(() => {
                    remind(channel, "clean");
                }, time);
            }
        }

        if (dailyTimestamp != 0) {
            let time = dailyTimestamp-Date.now();
            if (time > 0) {
                setTimeout(() => {
                    remind(channel, "daily");
                }, time);
            }
        }
    });
});

function saveConfig() {
    fs.writeFileSync("./config.json", JSON.stringify(config));
}

function executeBotCommand(message) {
    let args = message.content.replace(config.prefix, '').toLowerCase().trim().split(/\s+/);

    switch (args[0]) {
        case "setprefix":
        case "settacoprefix":
            if (!args[1]) {
                message.channel.send(":x: Añade el prefix a usar");
                return;
            }
            if (has(args[0], "setprefix")) {
                config.prefix = args[1];
            } else {
                config.taco_shack_prefix = args[1];
            }
            saveConfig();
            message.channel.send(":white_check_mark: El prefix ahora es `"+args[1]+"`");
            return;
        case "next":
            let array = sortMap(upgrades);
            if (array.length == 0) {
                message.channel.send(":x: No hay más mejoras");
                return;
            }
            let price = Number(array[0].price).toLocaleString();
            message.channel.send("Compra esta mejora: `"+array[0].id+"`, vale `$"+price+"` :thumbsup:");
            return;
        case "show":
            if (buyList.size == 0) {
                message.channel.send(":x: La lista está vacia");
                return;
            }
            let content = "";
            for (let key of Array.from(buyList.keys())) {
                content += key+" x"+buyList.get(key)+"\n";
            }
            content += "\nIncome: "+income;
            message.channel.send(content);
            return;
        case "clear":
            buyList.clear();
            income = 0;
            message.channel.send(":white_check_mark: Lista reestablecida");
            return;
        case "stats":
            sendStats(upgrades, message.channel);
            return;
        case "help":
            let commands = "Comandos disponibles:\nsetprefix\nsettacoprefix\nnext\nshow\nclear\nstats";
            message.channel.send(commands);
            return;
    }
}

function executeTacoCommand(message) {
    let args = message.content.replace(config.taco_shack_prefix, '').toLowerCase().trim().split(/\s+/);

    switch (args[0]) {
        case "hire":
        case "buy":
            if (!upgrades.has(args[1])) {
                return;
            }
            let array = sortMap(upgrades);
            let upgrade = upgrades.get(args[1]);

            if (typeof upgrade.boost == 'number') {
                income += upgrade.boost;
            }

            if (buyList.has(upgrade.id)) {
                let value = buyList.get(upgrade.id) + 1;
                buyList.set(upgrade.id, value);
            } else {
                buyList.set(upgrade.id, 1);
            }
            upgrade.buy();
            saveData(Array.from(upgrades.values()));
            
            let info = "Mejora comprada: "+upgrade.name+"\n";

            array = sortMap(upgrades);
            if (array.length == 0) {
                message.channel.send(info+":tada: Ya no quedan mejoras"); 
                return;
            }

            let price = Number(array[0].price).toLocaleString();
            message.channel.send(info+"Compra esta mejora: `"+array[0].id+"`, vale `$"+price+"` :thumbsup:");
            return;
        case "clean":
        case "daily":
        case "d":
            let time = 24 * 60 * 60 * 1000;
            let timestamp = Date.now()+time;

            if (args[0] == "clean") {
                config.clean_timestamp = timestamp;
            } else {
                config.daily_timestamp = timestamp;
            }

            saveConfig();

            setTimeout(() => {
                remind(message.channel, args[0]);
            }, time);
            return;
    }
}

function remind(channel, type) {
    if (type == "d") {
        type = "daily";
    }
    channel.send("<@"+process.env.OWNER_ID+"> Recordatorio, haz el comando de `"+type+"`");

    if (type == "clean") {
        config.clean_timestamp = 0;
    } else {
        config.daily_timestamp = 0;
    }
    saveConfig();
}

function has(text, string) {
    return text.indexOf(string) != -1;
}

client.on('messageCreate', async (message) => {
    if (message.author.id != process.env.OWNER_ID) {
        return;
    }

    let lowerCase = message.content.toLowerCase();

    if (lowerCase.startsWith(config.prefix)) {
        executeBotCommand(message);
    }

    if (lowerCase.startsWith(config.taco_shack_prefix)) {
        executeTacoCommand(message);
    }

})

client.login(process.env.TOKEN);
