const fs = require('fs');                               // Работа с файловой системой

function readFacultiesList() {
    return new Promise(resolve => {
        fs.readdir("./" + "\\paths", function (err, files) {
            if (err) {
                throw err;
            }

            let names = [];
            files.forEach(function (file) {
                names.push(file.replace(".json", ""));
            });

            resolve(names);
        });
    });
}

function readFacultyForms(name) {
    let faculty = JSON.parse(String(fs.readFileSync("./" + '/paths/' + name + '.json')));
    return new Promise(resolve => {
        let names = [];
        faculty.forEach(element => {
            names.push(element.form);
        });
        resolve(names);
    });
}

function readFormGroupTypes(name, form) {
    let faculty = JSON.parse(String(fs.readFileSync("./" + '/paths/' + name + '.json')));
    return new Promise(resolve => {
        faculty.forEach(Form => {

            if (Form.form === form) {
                let types = [];
                Form.group_types.forEach(element => {
                    types.push(element.group_type);
                });
                resolve(types);
            }
        });
    });
}

function readCourses(name, form, type) {
    let faculty = JSON.parse(String(fs.readFileSync("./" + '/paths/' + name + '.json')));
    return new Promise(resolve => {
        faculty.forEach(Form => {

            if (Form.form === form) {
                Form.group_types.forEach(Type => {
                    if (Type.group_type === type) {
                        let courses = [];
                        Type.courses.forEach(element => {
                            courses.push(element.course.replace(":", ""));
                        });
                        resolve(courses);
                    }
                });
            }
        });
    });
}

function readGroups(name, form, type, course) {
    let faculty = JSON.parse(String(fs.readFileSync("./" + '/paths/' + name + '.json')));
    course += ':';
    return new Promise(resolve => {
        faculty.forEach(Form => {

            if (Form.form === form) {
                Form.group_types.forEach(Type => {

                    if (Type.group_type === type) {
                        Type.courses.forEach(Course => {
                            if (Course.course === course) {
                                resolve(Course.groups[0]);
                            }

                        });
                    }
                });
            }
        });
    });
}

module.exports = { readFacultiesList, readFacultyForms, readFormGroupTypes, readCourses, readGroups };