const mysql = require("mysql2");


const connection = mysql.createConnection(
    {
        user:"root",
        host:"localhost",
        password:"123456",
        database:"ghewarefinance",
    }
)

connection.connect((err)=>{
    if(err){
        console.warn("error");
    }else{
        console.warn("connecting");
    }

})

module.exports = connection;