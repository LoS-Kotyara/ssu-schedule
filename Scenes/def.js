const Markup = require("../node_modules/telegraf/markup");
const WizardScene = require("../node_modules/telegraf/scenes/wizard");
const Stage = require("../node_modules/telegraf/stage");
const { enter, leave } = Stage;

const def = new WizardScene(
  "def",
  async ctx => {
    leave("professor");
    leave("student");
    ctx.wizard.state.anss = ["Группы", "Преподавателя"];
    ctx.reply(
      "Вы хотите найти расписание",
      Markup.keyboard(ctx.wizard.state.anss)
        .resize()
        .extra()
    );
    return ctx.wizard.next();
  },
  async ctx => {
    if (ctx.message.text === "/help") {
      await ctx.reply(`
            Список доступных команд:
            •   /start - начать диалог с ботом
            •   /help - вывод доступных команд
            `);
      leave("def");
      return ctx.scene.enter("def");
    }
    if (ctx.message.text === "/start") {
      await ctx.reply(
        "Здравствуйте, " +
          ctx.from.first_name +
          ", вас приветствует " +
          "бот расписания СГУ!"
      );
      leave("def");
      return ctx.scene.enter("def");
    }
    if (ctx.message.text.match(/Группы/i)) {
      leave("def");
      return ctx.scene.enter("student");
    }
    if (ctx.message.text.match(/Преподавателя/i)) {
      leave("def");
      return ctx.scene.enter("professor");
    } else {
      await ctx.reply('"' + ctx.message.text + '" - не распознанная команда');
      leave("def");
      return ctx.scene.enter("def");
    }
  }
);
module.exports = { def };
