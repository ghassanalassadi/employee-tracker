// import required packages
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const e = require('express');
const { response } = require('express');

const app = express();

// set up middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// database connection

const db = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.DB_USER,
        port: 3001,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    }
);

db.connect(() => {
    try {
        console.log('Connected to the database.');
        userOptions();
    } catch (err) {
        console.error(err);
    }
});

function userOptions() {
    const question = [
        {
            type: 'list',
            name: 'userSelection',
            message: 'What would you like to do?',
            loop: false,
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update Employee Role']
        }
    ];

    try {
        inquirer.prompt(question).then((response) => {
            switch(response.userSelection) {
                case 'View All Departments':
                    viewTable('department');
                    break;
                case 'View All Roles':
                    viewTable('employee_role');
                    break;
                case 'View All Employees':
                    viewTable('employee')
                    break;
                case 'Add A Department':
                    addDepartment();
                    break;
                case 'Add A Role':
                    addRole();
                    break;
                case 'Add An Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployee();
                    break;
            }
        })
    } catch (err) {
        console.error(err);
    }
}

function viewTable(table) {
    let dbQuery;
    if (table === 'department') {
        dbQuery = 'SELECT * FROM department';
    } else if (table === 'employee_role') {
        dbQuery = "SELECT * FROM employee_role";
    } else if (table === 'employee') {
        dbQuery = "SELECT * FROM employee";
    } else { 
        console.log('Invalid table. Exiting application...');
        db.end();
    }
    db.query(dbQuery, (err, res) => {
        if (err) throw err;
        console.table(res);
        userOptions();
    });
}

function addDepartment() {
    const question = [
        {
            type: 'input',
            name: 'departmentName',
            message: 'What is the name of your new department?'
        }
    ];

    inquirer.prompt(question).then((response) => {
        const dbQuery = `INSERT INTO department (departmentName) VALUES (?)`;
        db.query(dbQuery, [response.departmentName], (err) => {
            if (err) throw err;
            console.log(`Department ${response.departmentName} successfully added!`);
            userOptions();
        })
    }).catch(err => console.error(err));
}

function addRole() {
    const departments = [];
        const questions = [
        {
            type: 'input',
            name: 'roleTitle',
            message: 'What is the title of the title of the new role?'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'What is the salary of the new role?'
        },
        {
            type: 'list',
            name: 'roleDepartment',
            choices: departments,
            message: 'Which department is this role in?'
        }
    ];

    db.query('SELECT * FROM department', (res) => {
        try {
            res.forEach(department => {
                let depObj = {
                name: department.name,
                id: department.id
                }
                departments.push(depObj);
            });
        } catch (err) {
            console.error(err);
    }
    });
    inquirer.prompt(questions).then((response) => {
        const dbQuery = `INSERT INTO employee_role (title, salary, department_id) VALUES (?)`;
        db.query(dbQuery, [[response.roleTitle, response.roleSalary, response.roleDepartment]], (err) => {
            if (err) throw err;
            console.log(`Role ${response.roleTitle} successfully added!`)
        });
        userOptions();
    });
}

function addEmployee() {
    const roleList = [];
    const managerList = [];
        const questions = [
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?"
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?"
        },
        {
            type: 'list',
            name: 'employeeRole',
            choices: roleList,
            message: "What is the employees role?"
        },
        {
            type: 'list',
            name: 'employeeManager',
            choices: managerList,
            message: "Who is the employee's manager? (Skip this question if not applicable)"
        }
    ];

    try {
        db.query('SELECT * FROM employee', (res) => {
            let employeeData = [
                {
                    firstName,
                    lastName,
                    employeeID
                }
            ];
            res.forEach(({firstName, lastName, employeeID}) => {
                employeeData.push({
                    firstName,
                    lastName,
                    employeeID
                });
            });
        });

        db.query('SELECT * FROM employee_role', (res) => {
            res.forEach(({roleTitle, id}) => {
                roleList.push({
                    roleTitle,
                    id
                });
            });
        });
    } catch (err) {
        console.error(err);
    }
    inquirer.prompt(questions).then((response) => {
        const dbQuery = `INSERT INTO employee (title, salary, department_id) VALUES (?)`;
        let employeeManager = response.employeeManager !== 0 ? response.employeeManager : null;
        db.query(dbQuery, [[response.firstName, response.lastName, response.employeeRole, employeeManager]], (err) => {
            if (err) throw err;
            console.log(`Employee ${response.firstName} ${response.lastName} successfully added!`);
            userOptions();
        });
    })
}

function updateEmployee() {
    let employeeList = [];
    let roleList = []
    let questions = [
        {
            type: 'list',
            name: 'selectedEmployee',
            choices: employeeList,
            message: "Who's role do you wish to update?"
        },
        {
        type: "list",
        name: "selectedRole",
        choices: roleList,
        message: "What new role do you wish to assign this employee?"
        }
    ];

    db.query('SELECT * FROM employee', (err, res) => {
        res.forEach(({firstName, lastName, id}) => {
            employeeList.push({
                firstName,
                lastName,
                id
            });
        });
    });

    db.query('SELECT * FROM employee_role', (res) => {
    res.forEach(({roleTitle, id}) => {
        roleList.push({
            roleTitle,
            id
            });
        });
    });

    inquirer.prompt(questions).then((response) => {
        const dbQuery = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
        db.query(dbQuery, [ {selectedRole: response.selectedRole}, "id", response.selectedEmployee],
        (err) => {
            if (err) throw err;
            console.log("Successfully updated employee's role!");
            userOptions();
        });
    })
}