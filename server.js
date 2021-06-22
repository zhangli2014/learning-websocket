const http = require("http");
const fs = require("fs");
const io = require("socket.io");
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

const httpServer = http.createServer((req, res)=>{
    fs.readFile(`www${req.url}`, (err, data) => {
        if(err) {
            res.writeHeader(404);
            res.write("Not Found!");
        } else {
            res.write(data);            
        }
        res.end();
    })
});
httpServer.listen(8085);

const wsServer = io(httpServer);


wsServer.on("connection", sock => {
    sock.emit("emitMessage", "some message")
    sock.on("test1", function(a,b,c){
        console.log(a,b,c)
    })
})

console.log("connection successful.")