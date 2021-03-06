const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: 'root',
  
    // Be sure to update with your own MySQL password!
    password: '',
    database: 'employeetracker',
});

//function to print welcome screen
function welcome() {
  console.log(`
░█▀▀░█▄█░█▀█░█░░░█▀█░█░█░█▀▀░█▀▀░░░▀█▀░█▀▄░█▀█░█▀▀░█░█░█▀▀░█▀▄
░█▀▀░█░█░█▀▀░█░░░█░█░░█░░█▀▀░█▀▀░░░░█░░█▀▄░█▀█░█░░░█▀▄░█▀▀░█▀▄
░▀▀▀░▀░▀░▀░░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░░░░▀░░▀░▀░▀░▀░▀▀▀░▀░▀░▀▀▀░▀░▀`)
}

const init = () => {
    inquirer.prompt(
        {
            type:'list',
            message:'What would you like to do?',
            name:'actionChoice',
            choices:['View All Employees','View All Employees By Department', 'View All Employees by Role', 'Add an Employee', 'Remove an Employee', 'Update Employee Role', 'Update Employee Manager', 'Exit']
        })
      .then( answers => {
        if (answers.actionChoice === 'View All Employees') {
          // print the employees table
          console.log('Displaying all employees...\n');
          connection.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            console.table(res);
            init();
          })
        }
        else if (answers.actionChoice === 'View All Employees By Department') {
          // statement to view employees by dept.
          selectByDept();
        }
        else if (answers.actionChoice === 'View All Employees by Role') {
          // statement to view employees by role.
          selectByRole();
        }
        else if (answers.actionChoice === 'Add an Employee') {
          // statement to add an employee.
          addEmployeePrompt();
        }
        else if (answers.actionChoice === 'Remove an Employee') {
          // statement to remove an employee
          deleteEmployee();
        }
        else if (answers.actionChoice === 'Update Employee Role') {
          // statement to update an employee's role
          updateRole();
        }
        else if (answers.actionChoice === 'Update Employee Manager') {
          // statement to update employee's manager
          updateManager();
        }
        else if (answers.actionChoice === 'Exit') {
          process.exit(0)
        }
      })
}

function selectByDept() {
  let departments = {}
  connection.query('SELECT emp_id, CONCAT(first_name, " ", last_name) AS full_name, employee.role_id, title, name, department.dept_id FROM employee INNER JOIN role ON role.role_id = employee.role_id INNER JOIN department ON role.dept_id = department.dept_id', (err, res) => {
    if (err) throw err;
    res.forEach(({name, dept_id}) => {
      departments[name] = dept_id;
    });
    inquirer.prompt([
      {
        type:'list',
        message: 'Select a department',
        name: 'dept',
        choices() {
          return Object.keys(departments).filter(x => x !== 'null');
        }
      }
    ])
    .then((answers) => {
      connection.query(
        `SELECT CONCAT(first_name, " ", last_name) AS full_name, title, name FROM employee INNER JOIN role ON role.role_id = employee.role_id INNER JOIN department ON role.dept_id = department.dept_id WHERE name = ?`,
        answers.dept,
        (err, res) => {
          if (err) throw err;
          console.table(res);
          init();
        }
      )
    })
  })
}

function selectByRole() {
  let roles = {}
  connection.query('SELECT emp_id, CONCAT(first_name, " ", last_name) AS full_name, employee.role_id, title FROM employee INNER JOIN role ON role.role_id = employee.role_id', (err, res) => {
    if (err) throw err;
    res.forEach(({title, role_id}) => {
      roles[title] = role_id;
    });
    inquirer.prompt([
      {
        type:'list',
        message: 'Select a role',
        name: 'role',
        choices() {
          return Object.keys(roles).filter(x => x !== 'null');
        }
      }
    ])
    .then((answers) => {
      connection.query(
        `SELECT CONCAT(first_name, " ", last_name) AS full_name, title FROM employee INNER JOIN role ON role.role_id = employee.role_id WHERE title = ?`,
        answers.role,
        (err, res) => {
          if (err) throw err;
          console.table(res);
          init();
        }
      )
    })
  })
}

// prompt and function to add employee
function addEmployeePrompt() {
  let nameid = {};
  connection.query('SELECT emp_id, CONCAT(first_name, " ", last_name) AS full_name, first_name, last_name, employee.role_id, title FROM employee RIGHT JOIN role ON employee.role_id = role.role_id', (err, results) => {
    if (err) throw err;
    results.forEach(({full_name, emp_id}) => {
      nameid[full_name] = emp_id;
    });
    inquirer.prompt([
      {
        type:'input',
        message:'First Name?',
        name: 'firstName'
      },
      {
        type:'input',
        message:'Last Name?',
        name: 'lastName'
      },
      {
        type:'list',
        message:'Role?',
        name: 'role',
        choices() {
            var distinctTitles = [];
            const titles = [];
            results.forEach(({ title }) => {
              titles.push(title);
            });
            distinctTitles = [...new Set(titles.map(x => x))]
            return distinctTitles;
        }
      },
      {
        type:'list',
        message:'Manager?',
        name: 'manager',
        choices() {
          return Object.keys(nameid).filter(x => x !== 'null');
        }
      }
    ])
    .then((answers) => {
        connection.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) 
          VALUES (?,?,(SELECT role_id FROM role WHERE title = ?),(SELECT emp_id FROM employee e WHERE CONCAT(e.first_name, " ", e.last_name) = ?));`,
          [answers.firstName, answers.lastName, answers.role, answers.manager],
          (err) => {
            if (err) throw err;
            console.log('Employee added!');
            init()
          }
        )
    })
  })
}

// prompt and function to delete employee
function deleteEmployee() {
  connection.query('SELECT emp_id, CONCAT(first_name, " ", last_name) AS full_name FROM employee', (err, res) =>  {
    if (err) throw err;
    let nameid = {};
    inquirer.prompt([
      {
        type:'list',
        message:'Who should be removed?',
        name: 'deletee',
        choices() {
          let names = [];
          res.forEach(({full_name, emp_id}) => {
            names.push(full_name);
            nameid[full_name] = emp_id;
          });
          return names; 
        }
      }
    ])
    .then((answers) => {
      connection.query(
        'DELETE FROM employee WHERE emp_id = ?',
        nameid[answers.deletee],
        (err) => {
          if (err) throw err;
          console.log('Employee deleted!');
          init()
        }
      )
    })
  })
}

// prompt and function to update manager
function updateManager() {
  connection.query('SELECT emp_id, CONCAT(first_name, " ", last_name) AS full_name FROM employee', (err, res) =>  {
    if (err) throw err;
    let nameid = {};
    let names = [];
    inquirer.prompt([
      {
        type:'list',
        message:"Whose manager should be updated?",
        name: 'updatee',
        choices() {
          res.forEach(({full_name, emp_id}) => {
            names.push(full_name);
            nameid[full_name] = emp_id;
          });
          return names; 
        }
      },
      {
        type:'list',
        message:"Who is their new manager?",
        name: 'newmgr',
        choices() {return names}
      }
    ])
    .then((answers) => {
      connection.query(
        'UPDATE employee SET manager_id = ? WHERE emp_id = ?',
        [nameid[answers.newmgr], nameid[answers.updatee]],
        (err) => {
          if (err) throw err;
          console.log('Employee updated!');
          init()
        }
      )
    })
  })
}

// prompt and function to update role
function updateRole() {
  let names = {};
  let roles = {};
  connection.query('SELECT emp_id, r.title AS title, r.role_id AS role_id, CONCAT(first_name, " ", last_name) AS full_name FROM employee e RIGHT JOIN role r ON e.role_id = r.role_id', (err, res) =>  {
    if (err) throw err;
    res.forEach(({full_name, emp_id, title, role_id}) => {
      names[full_name] = emp_id;
      roles[title] = role_id;
    });
    inquirer.prompt([
      {
        type:'list',
        message:"Whose role should be updated?",
        name: 'updatee',
        choices() {
          return Object.keys(names).filter(x => x !== 'null');
        }
      },
      {
        type:'list',
        message:"What is their new role?",
        name: 'newRole',
        choices() {
          return Object.keys(roles);
        }
      }
    ])
    .then((answers) => {
      connection.query(
        'UPDATE employee SET role_id = ? WHERE emp_id = ?',
        [roles[answers.newRole], names[answers.updatee]],
        (err) => {
          if (err) throw err;
          console.log('Employee updated!');
          init()
        }
      )
    })
  })
}

// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  welcome()
  // run the start function after the connection is made to prompt the user
  init();
});