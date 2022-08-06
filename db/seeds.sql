INSERT INTO department(dep_name)
VALUES
    ("engineering"),
    ("finace"),
    ("marketing");

SELECT * FROM department;

INSERT INTO employee_role (title, salary, department_id)
VALUES
    ("Full Stack Engineer", 150000, 1),
    ("Accountant", 85000, 2),
    ("Network Engineer", 95000, 1),
    ("Marketing Lead", 130000, 3);

SELECT * FROM employee_role;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Jack", "Jones", 2, 1),
    ("Sakura", "Tachibana", 1, 2),
    ("Ahmad", "Yousef", 3, 3);

SELECT * FROM employee;