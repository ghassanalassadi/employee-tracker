// import required packages
const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const e = require('express');
const { response } = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

// set up middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// database connection

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employees_db'
    },
    console.log(`Connected to the employees_db database.`)
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
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add A Department', 'Add An Employee', 'Update Employee Role']
        }
    ];

    try {
        inquirer.prompt(question).then((response) => {
            switch(question.userSelection) {
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
        db.query(dbQuery, [response.departmentName], (err, res) => {
            if (err) throw err;
            console.log(`Department ${response.departmentName} successfully added!`);
            userOptions();
        })
    })
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

    inquirer.prompt(questions).then((response) => {
        const dbQuery = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
        db.query(dbQuery, [[response.roleTitle, response.roleSalary, response.roleDepartment]]);
        userOptions();
    })
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
    ]

}

function updateEmployee() {

}