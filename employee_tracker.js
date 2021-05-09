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
        else if (answers.actionChoice === 'View All Employees By Role') {
          // statement to view employees by role.
        }
        else if (answers.actionChoice === 'Add an Employee') {
          // statement to add an employee.
          addEmployeePrompt()
        }
        else if (answers.actionChoice === 'Remove an employee') {
          // statement to remove an employee
        }
        else if (answers.actionChoice === 'Update Employee Role') {
          // statement to update an employee's role
        }
        else if (answers.actionChoice === 'Update Employee Manager') {
          // statement to update employee's manager
        }
      })
}

// query to get employee ID based on manager input
function getEmpId() {
  connection.query(
    'SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) AS full_name = ?', answers.manager, (err, res) => {
      if (err) throw err;
      return(res);
    }
  )
}

// query to get role ID based on role name input
function getRoleId() {
  connection.query(
    'SELECT id FROM role WHERE title = ?', answers.role, (err, res) => {
      if (err) throw err;
      return(res);
    }
  )
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
        let mgrid = getEmpId();
        let roleid = getRoleId();
        connection.query(
          'INSERT INTO employee SET ?',
          {
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: roleid,
            manager: mgrid
          },
          (err) => {
            if (err) throw err;
            console.log('Employee added!');
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