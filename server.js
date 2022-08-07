// import required packages
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const app = express();

// set up middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// database connection

const db = mysql.createConnection(
    {
        host: "localhost",
        user: process.env.DB_USER,
        port: 3306,
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
            message: 'What would you like to do? (Press Ctrl + C to exit application).',
            loop: false,
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add A Role', 'Add An Employee', 'Update Employee Role']
        }
    ];


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
        const dbQuery = `INSERT INTO department (dep_name) VALUES (?)`;
        db.query(dbQuery, [response.departmentName], (err) => {
            if (err) throw err;
            console.log(`Department ${response.departmentName} successfully added!`);
            userOptions();
        })
    }).catch(err => console.error(err));
}

function addRole() {
    const departmentList = [];
        const questions = [
        {
            type: 'input',
            name: 'roleTitle',
            message: 'What is the title of the new role?'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'What is the salary of the new role?'
        },
        {
            type: 'list',
            name: 'roleDepartment',
            choices: departmentList,
            message: 'Which department is this role in?'
        }
    ];

    db.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        res.forEach(department => {
            let depObj = {
            name: department.dep_name,
            value: department.id
            };
            departmentList.push(depObj);
        });
    });
    inquirer.prompt(questions).then((response) => {
        const dbQuery = `INSERT INTO employee_role (title, salary, department_id) VALUES (?)`;
        db.query(dbQuery, [[response.roleTitle, response.roleSalary, response.roleDepartment]], (err) => {
            if (err) throw err;
            console.log(`Role ${response.roleTitle} successfully added!`);
            userOptions();
        });
    }).catch(err => console.error(err));
}

function addEmployee() {
    const roleList = [];
    // if employee does not have a manager
    const employeeData = [
    {
        name: 'N/A',
        value: 0
    }
    ];
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
            message: "What is the employee's role?"
        },
        {
            type: 'list',
            name: 'employeeManager',
            choices: employeeData,
            message: "Who is this employee's manager? (Skip this question if not applicable)"
        }
    ];

    db.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        res.forEach(({ first_name, last_name, id }) => {
            employeeData.push({
                name: first_name + ' ' + last_name,
                value: id,
            });
        });
    });

    db.query('SELECT * FROM employee_role', (err, res) => {
        if (err) throw err;
        res.forEach(({title, id}) => {
            roleList.push({
                name: title,
                value: id
            });
        });
    });

    inquirer.prompt(questions).then((response) => {
        const dbQuery = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)`;
        let employeeManager = response.employeeManager !== 0 ? response.employeeManager : null;
        db.query(dbQuery, [[response.firstName, response.lastName, response.employeeRole, employeeManager]], (err) => {
            if (err) throw err;
            console.log(`Employee ${response.firstName} ${response.lastName} successfully added!`);
            userOptions();
        });
    }).catch(err => console.error(err));
}

function updateEmployee() {
    db.query('SELECT * FROM employee', (err, res) => {
    if (err) throw err;
    const employeeList = [];
    res.forEach(({first_name, last_name, id}) => {
        employeeList.push({
            name: first_name + ' ' + last_name,
            value: id,
            });
        });
    
    const roleList = [];
    const questions = [
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
    db.query('SELECT * FROM employee_role', (err, res) => {
        if (err) throw err;
        res.forEach(({title, id}) => {
            roleList.push({
                name: title,
                value: id
                });
            });
    });

    inquirer.prompt(questions).then((response) => {
        const dbQuery = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
        db.query(dbQuery, [ {role_id: response.selectedRole}, "id", response.selectedEmployee], (err) => {
            if (err) throw err;
            console.log("Successfully updated employee's role!");
            userOptions();
        });
    }).catch(err => console.error(err));
    });
}