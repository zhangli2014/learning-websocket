const mysql = require("mysql");

const db = mysql.createConnection({
    host:'localhost',
    user: "root",
    password: "",
    database: "20210617"
})

db.query("SELECT * FROM user_table", (err, data) => {
    if(err) console.log(err)
    else console.log(data)
})
