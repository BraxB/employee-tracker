const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: process.env.PORT || 3306,
  
    // Your username
    user: 'root',
  
    // Be sure to update with your own MySQL password!
    password: '',
    database: 'employeetracker',
});

const init = () => {
    inquirer.prompt(
        {
            type:'list',
            message:'What would you like to do?',
            name:'actionChoice',
            choices:['View All Employees','View All Employees By Department', 'View All Employees by Role', 'Add an Employee', 'Remove an Employee', 'Update Employee Role', 'Update Employee Manager']
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

        }
        else if (answers.actionChoice === 'View All Employees by Role') {
          // statement to view employees by role.
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
        }
        else if (answers.actionChoice === 'Update Employee Manager') {
          // statement to update employee's manager
        }
      })
}

function addEmployeePrompt() {
  connection.query('SELECT emp_id, CONCAT(first_name, " ", last_name) AS full_name, first_name, last_name, employee.role_id, title FROM employee RIGHT JOIN role ON employee.role_id = role.role_id', (err, results) => {
    if (err) throw err;
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
          const choiceArray = [];
            results.forEach(({ full_name }) => {
              choiceArray.push(full_name)
            });
            return choiceArray;
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

// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  init();
});