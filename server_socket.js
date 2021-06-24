const http = require("http");
const fs = require("fs");
const url = require("url");
const io = require("socket.io");
const mysql = require("mysql");

const db = mysql.createConnection({
    host:'localhost',
    user: "root",
    password: "",
    database: "20210617"
})

// db.query("SELECT * FROM user_table", (err, data) => {
//     if(err) console.log(err)
//     else console.log(data)
// })

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
httpServer.listen(8086);

const wsServer = io(httpServer);
let aSock = []
wsServer.on("connection", sock => {
    aSock.push(sock)
    let cur_username = "";
    let cur_userID = "";
    //注册接口
    sock.on("reg", (user, password) => {
        if(!/^\w{6,32}$/.test(user)){
            sock.emit("reg_ret", 1, "用户名不符合规范")
        } else if(!/^.{6,32}$/.test(password)) {
            sock.emit("reg_ret", 1, "密码不符合规范")
        } else {
            db.query(`select ID from user_table where username='${user}'`, (err, data) => {
                if(err){
                    sock.emit("reg_ret", 1, err)
                } else if(data.length > 0){
                    sock.emit("reg_ret", 1, "输入的用户名已经存在了，请重新输入！")
                } else {
                    db.query(`insert into user_table (username, password, online) values ('${user}', '${password}', 0)`, err => {
                        if(err){
                            sock.emit("reg_ret", 1, err)
                        } else {
                            sock.emit("reg_ret", 0, "注册成功")
                        }
                    })
                }
            })
        }
    })
    //登录接口
    sock.on("login", (user, password) => {
        if(!/^\w{6,32}$/.test(user)){
            sock.emit("login_ret", 1, "用户名不符合规范")
        } else if(!/^.{6,32}$/.test(password)) {
            sock.emit("login_ret", 1, "密码不符合规范")
        } else {
            db.query(`select ID, password from user_table where username = '${user}'`, (err, data) => {
                if(err){
                    sock.emit("login_ret", 1, err)
                } else if(data.length == 0){
                    sock.emit("login_ret", 1, "此用户不存在")
                } else if(data[0].password != password){
                    sock.emit("login_ret", 1, "用户名或密码有误！")
                } else {
                    db.query(`update user_table set online=1 where ID='${data[0].ID}'`, err => {
                        if(err) {
                            sock.emit("login_ret", 1, err)
                        } else {
                            sock.emit("login_ret", 0, "登录成功！")
                            cur_username = user
                            cur_userID = data[0].ID
                        }
                    })
                    
                }
            })
        }
    })
    //发言
    sock.on("msg", txt => {
        if(!txt){
            sock.emit("msg_ret", 1, "消息不能为空！")
        } else {
            //广播给所有人
            aSock.forEach(item => {
                if(item == sock) return
                item.emit("msg", cur_username, txt)
            })
            sock.emit("msg_reg", 0, "发送成功")
        }

    })

    //离线
    sock.on("disconnect", () => {
        db.query(`update user_table set online=0 where ID='${cur_userID}'`, err => {
            if(err) console.log(err)
            
            cur_username = "";
            cur_userID = "";

            aSock = aSock.filter(item => item != sock)
        })
    })
})

console.log("connection successful.")