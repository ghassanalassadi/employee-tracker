DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;
USE employees_db;

CREATE TABLE department(
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    dep_name VARCHAR(30) NOT NULL
);

CREATE TABLE employee_role(
    id INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL
    FOREIGN KEY (department_id)
    REFERENCES department(id)
);

CREATE TABLE employee(
    id INT NOT NULL IDENTITY(1,1),
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL
    FOREIGN KEY (role_id)
    REFERENCES employee_id(id),
    manager_id INT
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
)