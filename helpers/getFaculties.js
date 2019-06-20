const Xray = require('x-ray');                          // Один из парсеров

const xray = new Xray();                                // Для xray

function readFacultyInfo(faculty) {
    xray(faculty.path, 'fieldset.form_education.form-wrapper', [{
        form: 'legend > span',
        group_types: xray('fieldset.group-type.form-wrapper', [{
            group_type: 'legend > span',
            courses: xray('fieldset.course.form-wrapper', [{
                course: 'legend > span',
                groups: xray('div', [{
                    number: ['a'],
                    path: ['a@href']
                }])
            }])

        }])

    }])
        .write('./paths/' + faculty.name + '.json');
}

function getFacultiesList() {
    xray('https://www.sgu.ru/schedule', 'div.panes_item.panes_item__type_group > ul > li', [{
        name: 'a',
        path: 'a@href'
    }])
        .then(async function (res) {
            await res.forEach(async faculty => {
                await readFacultyInfo(faculty);
                
            });
            
        })

        .catch(function (err) {
            
        });
}

module.exports = { getFacultiesList };