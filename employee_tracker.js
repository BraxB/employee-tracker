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

const initialize = () => {
    inquirer.prompt(
        {
            type:'list',
            message:'What would you like to do?',
            name:'actionChoice',
            choices:['View All Employees','View All Employees By Department', 'View All Employees by Role', 'Add an Employee', 'Remove an Employee', 'Update Employee Role', 'Update Employee Manager']
        })
      }
//       .then( answers => {
//         if (answers.actionChoice === 'View All Employees') {
//           // print the employees table
//         }
//         else if (answers.actionChoice === 'View All Employees By Department')
//       })
// }

// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    console.table([
        {
          name: 'foo',
          age: 10
        }, {
          name: 'bar',
          age: 20
        }
      ]);
  });