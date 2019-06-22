const Stage = require("../node_modules/telegraf/stage"); // не помню
const WizardScene = require("../node_modules/telegraf/scenes/wizard"); // Многоуровневые вопросы
const { enter, leave } = Stage; // Не помню
const Markup = require("../node_modules/telegraf/markup"); // Настройки клавиатуры, форматирования текста и тп

const Nightmare = require("nightmare");
const cheerio = require("cheerio");
const url = "https://www.sgu.ru/schedule";

const { read } = require("../helpers/read");

const weekdays = new Array(
  ["Воскресенье"],
  ["Понедельник"],
  ["Вторник"],
  ["Среда"],
  ["Четверг"],
  ["Пятница"],
  ["Суббота"]
);
let date = new Date();

function getData(html, callback) {
  const $ = cheerio.load(html);
  let resp = [];
  $("#results > div > a").each(function() {
    let name = $(this).text();
    let path = $(this).attr("href");
    let temp = {
      name: name,
      path: path
    };
    resp.push(temp);
  });
  return callback(null, resp);
}

function get(lastName, callback) {
  Nightmare({
    show: false
  })
    .goto(url)
    .wait("body")
    .type(
      "#schedule_page > div > div.panes_item.panes_item__type_teacher > div.teacher-form > input[type=text]:nth-child(1)",
      lastName
    )
    .click(
      "#schedule_page > div > div.panes_item.panes_item__type_teacher > div.teacher-form > input[type=button]:nth-child(2)"
    )
    .wait(1500)
    .evaluate(() => document.querySelector("body").innerHTML)
    .end()
    .then(response => {
      getData(response, (err, res) => {
        return callback(null, res);
      });
    })
    .catch(err => {
      return callback(err);
    });
}

const professor = new WizardScene(
  "professor",
  ctx => {
    ctx.reply(
      "Введите фамилию преподавателя",
      Markup.removeKeyboard(true)
        .oneTime()
        .resize()
        .extra()
    );
    return ctx.wizard.next();
  },
  ctx => {
    ctx.wizard.state.lastName = ctx.message.text;
    get(ctx.wizard.state.lastName, async (err, res) => {
      ctx.wizard.state.res = res;
      let names = [];
      res.map(professor => {
        names.push(professor.name);
      });
      if (names.length == 0) {
        await ctx.reply(
          "Поиск не дал результатов" + "\nПожалуйста, введите фамилию заново",
          Markup.removeKeyboard(true)
            .oneTime()
            .resize()
            .extra()
        );
        ctx.reply("Введите фамилию преподавателя");
        return ctx.wizard.selectStep(1);
      }
      if (names.length > 15) {
        await ctx.reply(
          "Поиск дал большое число результатов (" +
            names.length +
            ")" +
            "\nПожалуйста, уточните фамилию преподавателя",
          Markup.removeKeyboard(true)
            .oneTime()
            .resize()
            .extra()
        );
        ctx.reply("Введите фамилию преподавателя");
        return ctx.wizard.selectStep(1);
      }
      ctx.reply(
        "Выберите преподавателя",
        Markup.keyboard(names)
          .resize()
          .extra()
      );
      return ctx.wizard.next();
    });
  },
  async ctx => {
    let names = [];
    let paths = [];
    ctx.wizard.state.res.map(professor => {
      names.push(professor.name);
      paths.push("https://www.sgu.ru" + professor.path);
    });

    if (names.includes(ctx.message.text) == false) {
      ctx.reply("Введена неверная фамилия.\nСделайте выбор заново");
      return ctx.wizard.selectStep(2);
    }
    await ctx.reply(
      'Вы выбрали "' + ctx.message.text + '"',
      Markup.removeKeyboard(true)
        .oneTime()
        .resize()
        .extra()
    );
    let index = names.indexOf(ctx.message.text);

    let weekday = weekdays[date.getDay()][0];

    if (weekday !== "Воскресенье") {
      await ctx.reply("Вывод пар на " + weekday);
      await read(paths[index], weekday, (err, res) => {
        if (res === "Сегодня пар нет" || res.length === 0)
          ctx.reply("Сегодня пар нет");
        else
          for (let index = 0; index < res.length; index++) {
            const element = res[index];
            ctx.replyWithHTML(element);
          }
      });
    } else {
      await ctx.reply("Так как сегодня Воскресенье, вывод пар на Понедельник");
      await read(paths[index], "Понедельник", (err, res) => {
        if (res === "Сегодня пар нет") ctx.reply("Сегодня пар нет");
        else
          for (let index = 0; index < res.length; index++) {
            const element = res[index];
            ctx.replyWithHTML(element);
          }
      });
    }
    setTimeout(() => {
      ctx.reply(
        "Выбрать другого преподавателя?",
        Markup.keyboard(["Да", "Нет"])
          .oneTime()
          .resize()
          .extra()
      );
    }, 10000);

    return ctx.wizard.next();
  },
  async ctx => {
    let answer = ctx.message.text;
    if (answer === "Да") {
      ctx.reply("Введите фамилию преподавателя");
      return ctx.wizard.selectStep(1);
    } else return ctx.scene.enter("def");
  }
);

module.exports = { professor };
