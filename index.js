const Telegraf = require('telegraf');
const config = require('./config.json'); 

const Stage = require("telegraf/stage");
const session = require("telegraf/session");

const { getFacultiesList } = require('./helpers/getFaculties');
const { student } = require("./Scenes/student");
const { def } = require("./Scenes/def");
const { professor } = require("./Scenes/professor");

const SocksAgent = require('socks5-https-client/lib/Agent');
/* const socksAgent = new SocksAgent({
  socksHost: config.host,
  socksPort: config.port,
  socksUsername: config.login,
  socksPassword: config.psswd,
}); */

const bot = new Telegraf(config.BOT_TOKEN, /* {
    telegram: { agent: socksAgent }
} */);

let date = new Date();

getFacultiesList();

setInterval(() => {
    if (date.getUTCHours() === 0) {
        getFacultiesList();
        setTimeout(() => {
            console.log('Update complited');
        }, 3600000);

    }
}, 60000);


// Регистрация сцен
const stage = new Stage([student, def, professor], { default: 'def' });
bot.use(session());
bot.use(stage.middleware());

// Реакция на команду start
bot.start(async (ctx) => {
    await ctx.reply("Здравствуйте, " + ctx.from.first_name + ", вас приветствует " +
        "бот расписания СГУ!");
    return ctx.scene.enter('def');
});

bot.help(ctx => {
    ctx.reply(`
    Список доступных команд:
    •   /start - начать диалог с ботом
    •   /help - вывод доступных команд
    `);
});

// Реакция на любое сообщение не в сцене
bot.on('message', ctx => {
    ctx.reply('"' + ctx.message.text + '" - не распознанная команда');
    return ctx.scene.enter('def');
});

bot.launch();

// Отлавливание ошибок
/* bot.catch((err) => {
    ctx.reply("Произошла ошибка");  
    return ctx.scene.enter("def");
}); */