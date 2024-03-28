const mysql=require('mysql');

var connection = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'123456789',
    database:'vacCenter'

});

module.exports=connection;
