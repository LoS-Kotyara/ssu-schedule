var cheerio = require('cheerio');
const request = require('request');

function read(url, day, callback) {
    request(url, (err, res, body) => {
        if (err)
            return callback(err);
        let $ = cheerio.load(body);
        // Получаем время занятий
        let classTimes = [];
        $('table#schedule tr').each(function (index) {
            let temp = $(this).find("th").first().text();
            if (temp && temp.length !== 0)
                classTimes.push(temp.slice(0, 5) + " - " + temp.slice(5));
        });
        let result = [];
        // Получаем все занития
        $('table#schedule tr td').each(function (index) {
            let str = "";
            // Находим ячейку с расписанием и считываем из неё все данные    
            $(this).find("div.l").each(function (index) {
                $(this).find("div.l-pr").each(function (index) {
                    str += $(this).find("div.l-pr-r").text() + "\t" + $(this).find("div.l-pr-t").text() + "\t" + $(this).find("div.l-pr-g").text() + "\t";
                });
                str += $(this).find("div.l-dn").text() + "\t";
                str += $(this).find("div.l-tn").text() + "\t";
                str += $(this).find("div.l-p").text() + "\t";
                str += $(this).find("div.l-g").text() + "\t";
            });
            result.push(str);
        });
        
        // Все проанализированные занятия
        let classes = [];
        result.forEach(_class => {
            // Занятия в это время одним объектом
            _class = _class.split("\t");
            _class.pop();
            // Проанализированные занятия в это время
            let w = [];
            // Количество занятий
            let z = Array.from(_class).length / 7.0;
            for (let j = 0; j < z; j++) {
                let q = {
                    parity: _class[0 + j * 7],
                    type: _class[1 + j * 7],
                    subgroup: _class[2 + j * 7],
                    name: _class[3 + j * 7],
                    professor: _class[4 + j * 7],
                    classroom: _class[5 + j * 7],
                    group_for_professors: _class[6 + j * 7] // Группа студентов, для преподавателя
                };
                w.push(q);
            }
            classes.push(w);
        });
        // зянятия, разбитые по времени и по дню недели
        let time = {
            Понедельник: [],
            Вторник: [],
            Среда: [],
            Четверг: [],
            Пятница: [],
            Суббота: []
        };
        // Разбили занятия по дням
        for (let i = 0; i < 8; i++) {
            time.Понедельник.push(classes[0 + i * 6]);
            time.Вторник.push(classes[1 + i * 6]);
            time.Среда.push(classes[2 + i * 6]);
            time.Четверг.push(classes[3 + i * 6]);
            time.Пятница.push(classes[4 + i * 6]);
            time.Суббота.push(classes[5 + i * 6]);
        }
        // Преобразуем данные каждого дня в строку
        timeString = [];
        //console.log(time[day]);
        if (time[day].includes(undefined))
            return callback(null, "Сегодня пар нет");
        for (let i = 0; i < 8; i++) {
            time[day][i].forEach(_class => {
                let str = "";
                str += "<b>" + classTimes[i] + "</b>\n";
                if (_class.parity.length > 0)
                    str += _class.parity + "\n";
                if (_class.type.length > 0)
                    str += _class.type + "\n";
                if (_class.subgroup.length > 0)
                    str += _class.subgroup + "\n";
                if (_class.name.length > 0)
                    str += _class.name + "\n";
                if (_class.professor.length > 0)
                    str += _class.professor + "\n";
                if (_class.classroom.length > 0)
                    str += _class.classroom + "\n";
                if (_class.group_for_professors.length > 0)
                    str += _class.group_for_professors;
                timeString.push(str);
            });
        }
        //console.log(timeString);
        callback(null, timeString);
    });
}

module.exports = { read };