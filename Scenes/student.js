const Stage = require("../node_modules/telegraf/stage");                // не помню
const WizardScene = require("../node_modules/telegraf/scenes/wizard");  // Многоуровневые вопросы
const { enter, leave } = Stage;                         // Не помню
const Markup = require('../node_modules/telegraf/markup');              // Настройки клавиатуры, форматирования текста и тп

const { readFacultiesList, readFacultyForms, readFormGroupTypes, readCourses, readGroups } = require('../helpers/getFacultyData');
const { read } = require("../helpers/read");

const weekdays = [['Воскресенье'],
    ['Понедельник'], ['Вторник'], ['Среда'],
    ['Четверг'], ['Пятница'], ['Суббота']];
let date = new Date();

const student = new WizardScene(
    "student",
    // Начало меню выбора
    async (ctx) => {
        ctx.wizard.state.faculties = await new readFacultiesList();
        ctx.wizard.state.faculties.push("Назад");

        ctx.reply("Выберите факультет", Markup.keyboard(ctx.wizard.state.faculties).resize().extra());

        return ctx.wizard.next();
    },

    // Выбор факультета, предложение выбора формы обучения
    async (ctx) => {
        ctx.wizard.state.faculty = ctx.message.text;

        if (ctx.wizard.state.faculty === "Назад") {
            ctx.reply('Вы выбрали "Назад"');
            return ctx.scene.enter('def');
        }

        if (ctx.wizard.state.faculties.indexOf(ctx.wizard.state.faculty) == -1) {
            ctx.reply("Вы ввели неверное значение, выход из меню выбора", Markup.removeKeyboard(true).oneTime().resize().extra());
            return ctx.scene.enter('def');
        }

        ctx.reply('Вы выбрали "' + ctx.wizard.state.faculty + '"');

        ctx.wizard.state.forms = await new readFacultyForms(ctx.wizard.state.faculty);
        ctx.wizard.state.forms.push("Назад");
        ctx.reply('Выберите форму обучения', Markup.keyboard(ctx.wizard.state.forms).resize().extra());

        return ctx.wizard.next();
    },

    // Выбор формы обучения, предложение выбора типа обучения
    async (ctx) => {
        ctx.wizard.state.form = ctx.message.text;

        if (ctx.wizard.state.form === "Назад") {
            ctx.reply('Вы выбрали "Назад"');
            ctx.reply("Выберите факультет", Markup.keyboard(ctx.wizard.state.faculties).resize().extra());
            return ctx.wizard.back();
        }

        if (ctx.wizard.state.forms.indexOf(ctx.wizard.state.form) == -1) {
            ctx.reply("Вы ввели неверное значение, выход из меню выбора", Markup.removeKeyboard(true).oneTime().resize().extra());
            return ctx.scene.enter('def');
        }

        ctx.reply('Вы выбрали"' + ctx.wizard.state.form + '"');

        ctx.wizard.state.types = await new readFormGroupTypes(ctx.wizard.state.faculty, ctx.wizard.state.form);
        ctx.wizard.state.types.push("Назад");
        ctx.reply('Выберите тип обучения', Markup.keyboard(ctx.wizard.state.types).resize().extra());

        return ctx.wizard.next();
    },

    // Выбор типа обучение, предложение выбора курса
    async (ctx) => {
        ctx.wizard.state.type = ctx.message.text;

        if (ctx.wizard.state.type === "Назад") {
            ctx.reply('Вы выбрали "Назад"');
            ctx.reply('Выберите форму обучения', Markup.keyboard(ctx.wizard.state.forms).resize().extra());
            return ctx.wizard.back();
        }

        if (ctx.wizard.state.types.indexOf(ctx.wizard.state.type) == -1) {
            ctx.reply("Вы ввели неверное значение, выход из меню выбора", Markup.removeKeyboard(true).oneTime().resize().extra());
            return ctx.scene.enter('def');
        }

        ctx.reply('Вы выбрали"' + ctx.wizard.state.type + '"');

        ctx.wizard.state.courses = await new readCourses(ctx.wizard.state.faculty, ctx.wizard.state.form, ctx.wizard.state.type);
        ctx.wizard.state.courses.push("Назад");
        ctx.reply('Выберите курс', Markup.keyboard(ctx.wizard.state.courses).resize().extra());

        return ctx.wizard.next();
    },

    // Выбор курса, предложение выбора группы
    async (ctx) => {
        ctx.wizard.state.course = ctx.message.text;

        if (ctx.wizard.state.course === "Назад") {
            ctx.reply('Вы выбрали "Назад"');
            ctx.reply('Выберите тип обучения', Markup.keyboard(ctx.wizard.state.types).resize().extra());
            return ctx.wizard.back();
        }

        if (ctx.wizard.state.courses.indexOf(ctx.wizard.state.course) == -1) {
            ctx.reply("Вы ввели неверное значение, выход из меню выбора", Markup.removeKeyboard(true).oneTime().resize().extra());
            return ctx.scene.enter('def');
        }

        ctx.reply('Вы выбрали"' + ctx.wizard.state.course + '"');

        ctx.wizard.state.temp = await new readGroups(ctx.wizard.state.faculty, ctx.wizard.state.form, ctx.wizard.state.type, ctx.wizard.state.course);

        ctx.wizard.state.groups = [];
        ctx.wizard.state.paths = [];

        ctx.wizard.state.temp.number.forEach(element => {
            ctx.wizard.state.groups.push(element);
        });

        ctx.wizard.state.temp.path.forEach(element => {
            ctx.wizard.state.paths.push(element);
        });

        ctx.wizard.state.groups.push("Назад");
        ctx.reply('Выберите группу', Markup.keyboard(ctx.wizard.state.groups).resize().extra());

        return ctx.wizard.next();
    },

    async (ctx) => {
        ctx.wizard.state.group = ctx.message.text;

        if (ctx.wizard.state.group === "Назад") {
            ctx.reply('Вы выбрали "Назад"');
            ctx.reply('Выберите курс', Markup.keyboard(ctx.wizard.state.courses).resize().extra());
            return ctx.wizard.back();
        }

        if (ctx.wizard.state.groups.indexOf(ctx.wizard.state.group) == -1) {
            ctx.reply("Вы ввели неверное значение, выход из меню выбора", Markup.removeKeyboard(true).oneTime().resize().extra());
            return ctx.scene.enter('def');
        }

        await ctx.reply('Вы выбрали"' + ctx.wizard.state.group + '"', Markup.removeKeyboard(true).oneTime().resize().extra());

        ctx.reply('Вам нужно расписание на сегодня или на конкретный день?', Markup.keyboard(["На сегодня", "На конкретный день", "Назад"]).resize().extra());

        return ctx.wizard.next();
    },

    async (ctx) => {

        ctx.wizard.state.dayAns = ctx.message.text;

        if (ctx.wizard.state.dayAns === "Назад") {
            ctx.reply('Вы выбрали "Назад"');
            ctx.reply('Выберите группу', Markup.keyboard(ctx.wizard.state.groups).resize().extra());
            return ctx.wizard.back();
        }

        if (ctx.wizard.state.dayAns !== "На сегодня" && ctx.wizard.state.dayAns !== "На конкретный день") {
            ctx.reply("Вы ввели неверное значение, выход из меню выбора", Markup.removeKeyboard(true).oneTime().resize().extra());
            return ctx.scene.enter('def');
        }
        let weekday = null;
        await ctx.reply('Вы выбрали"' + ctx.wizard.state.dayAns + '"', Markup.removeKeyboard(true).oneTime().resize().extra());
        if (ctx.wizard.state.dayAns == "На сегодня") { weekday = weekdays[date.getDay()][0]; }
        else {
            ctx.wizard.state.variables = weekdays.slice(1).concat([["Назад"]]);
            console.log(ctx.wizard.state.variables)
            ctx.reply('На какой день недели Вам нужно расписание', Markup.keyboard(ctx.wizard.state.variables).resize().extra());
            return ctx.wizard.selectStep(8);
        }


        await ctx.reply("Пожалуйста, подождите, пока данные обрабатываются\nВозможен неправильный порядок пар");



        if (weekday !== "Воскресенье") {
            await ctx.reply("Вывод пар на " + weekday);
            await read(ctx.wizard.state.paths[ctx.wizard.state.groups.indexOf(ctx.wizard.state.group)], weekday, (err, res) => {
                if (res === "Сегодня пар нет" || res.length === 0) ctx.reply("Сегодня пар нет");

                else
                    for (let index = 0; index < res.length; index++) {
                        const element = res[index];
                        ctx.replyWithHTML(element);
                    }
            });
        }
        else {
            await ctx.reply("Так как сегодня Воскресенье, вывод пар на Понедельник");
            await read(ctx.wizard.state.paths[ctx.wizard.state.groups.indexOf(ctx.wizard.state.group)], "Понедельник", (err, res) => {
                if (res === "Сегодня пар нет") ctx.reply("Сегодня пар нет");
                else
                    for (let index = 0; index < res.length; index++) {
                        const element = res[index];
                        ctx.replyWithHTML(element);
                    }
            });
        }

        setTimeout(() => {
            ctx.reply("Выбрать другую группу?", Markup.keyboard(['Да', 'Нет']).oneTime().resize().extra());
        }, 10000);

        return ctx.wizard.next();
    },

    async (ctx) => {
        let answer = ctx.message.text;
        if (answer === "Да") {
            ctx.wizard.state.faculties = await new readFacultiesList();
            ctx.wizard.state.faculties.push("Назад");

            ctx.reply("Выберите факультет", Markup.keyboard(ctx.wizard.state.faculties).resize().extra());

            return ctx.wizard.selectStep(1);
        }
        else return ctx.scene.enter('def');
    },

    async (ctx) => {
        ctx.wizard.state.weekday = ctx.message.text;
        console.log("im here")
        if (ctx.wizard.state.weekday === "Назад") {
            ctx.reply('Вы выбрали "Назад"');
            ctx.reply('Выберите группу', Markup.keyboard(ctx.wizard.state.groups).resize().extra());
            return ctx.wizard.selectStep(5);
        }

        let temp = weekdays.reduce((acc, val) => acc.concat(val), []);
        if (temp.indexOf(ctx.wizard.state.weekday) == -1) {
            ctx.reply("Вы ввели неверное значение, выход из меню выбора", Markup.removeKeyboard(true).oneTime().resize().extra());
            return ctx.scene.enter('def');
        }
        let weekday = ctx.wizard.state.weekday;
        await ctx.reply('Вы выбрали"' + ctx.wizard.state.weekday + '"', Markup.removeKeyboard(true).oneTime().resize().extra());

        await ctx.reply("Пожалуйста, подождите, пока данные обрабатываются\nВозможен неправильный порядок пар");


        await ctx.reply("Вывод пар на " + weekday);
        await read(ctx.wizard.state.paths[ctx.wizard.state.groups.indexOf(ctx.wizard.state.group)], weekday, (err, res) => {
            if (res === "Сегодня пар нет" || res.length === 0) ctx.reply("Сегодня пар нет");

            else
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];
                    ctx.replyWithHTML(element);
                }
        });


        setTimeout(() => {
            ctx.reply("Выбрать другую группу?", Markup.keyboard(['Да', 'Нет']).oneTime().resize().extra());
        }, 10000);

        return ctx.wizard.selectStep(7);
    }
);

module.exports = { student };