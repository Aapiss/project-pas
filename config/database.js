const mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_pas'
});

connection.connect(function(error) {
    if(!!error) {
        console.log(error);
    } else {
        console.log('Connected');
    }
});

module.exports = connection;