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

// query to get all department names
function showDept() {
  connection.query('SELECT name FROM department', (err, res) => {
    if (err) throw err;
    return(res);
  })
}

// query to get all employee names
function showEmp() {
  connection.query('SELECT name FROM employee', (err, res) => {
    if (err) throw err;
    return(res);
  })
}

// query to find id of employee by name

function addEmployeePrompt() {
  inquirer.prompt(
    {
      type:'input',
      message:'ID #?',
      name: lastName
    },
    {
      type:'input',
      message:'First Name?',
      name: firstName
    },
    {
      type:'input',
      message:'Last Name?',
      name: lastName
    },
    {
      type:'list',
      message:'Role?',
      name: department,
      choices: showDept()
    },
    {
      type:'list',
      message:'Manager?',
      name: manager,
      choices: showEmp()
    }
  )
  // .then((answers) => {

  //   'INSERT INTO employee SET ?',
  //   {
  //     id: answers.id,
  //     first_name: answers.firstName,
  //     last_name: answers.lastName,
  //     department:
  //   }
  // })
}

// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    init();
  });