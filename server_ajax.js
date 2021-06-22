const http = require("http");
const fs = require("fs");
const url = require("url");
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

    let {pathname, searchParams} = new URL(req.url, "http://localhost:8085")

    const newSearchParams = new URLSearchParams(searchParams)
    let user = newSearchParams.get("user");
    let password = newSearchParams.get("password");

    if(pathname == '/reg'){
        // 看看用户名和密码是否符合6-32位要求：
        if(!/^\w{6,32}$/.test(user)){
            res.write(JSON.stringify({
                code: 1,
                msg: '用户名不符合规范'
            }))
            res.end();
        } else if(!/^.{6,32}$/.test(password)){
            res.write(JSON.stringify({
                code: 1,
                msg: '密码不符合规范'
            }))
            res.end();
        } else {
            // 看看用户名有没有重复的：
            db.query(`select * from user_table where username='${user}'`, (err, data) => {
                if(err) {
                    console.log(err)
                    res.end();
                } else {
                    if(data.length > 0){
                        res.write(JSON.stringify({
                            code: 1,
                            msg: "输入的用户名已经存在了，请重新输入！"
                        }))
                        res.end();
                    } else {
                        db.query(`insert into user_table (username, password, online) values ('${user}', '${password}', 0)`, err => {
                            if(err) {
                                console.log(err)
                                res.end();
                            } else {
                                res.write(JSON.stringify({
                                    code: 0,
                                    msg: "注册成功"
                                }))
                                res.end();
                            }
                        })
                    }
                }
            })
        }             
    } else if (pathname == '/login'){
        if(!/^\w{6,32}$/.test(user)){
            res.write(JSON.stringify({
                code: 1,
                msg: '用户名不符合规范'
            }))
            res.end();
        } else if(!/^.{6,32}$/.test(password)){
            res.write(JSON.stringify({
                code: 1,
                msg: '密码不符合规范'
            }))
            res.end();
        } else {
            db.query(`select ID, password from user_table where username='${user}'`, (err,data) => {
                if(err){
                    console.log(err)
                    res.end();
                } else if(data.length == 0){
                    res.write(JSON.stringify({
                        code: 1,
                        msg: '此用户不存在'
                    }))
                    res.end();
                } else if(data[0].password != password){
                    res.write(JSON.stringify({
                        code: 1,
                        msg: '用户名或密码有误！'
                    }))
                    res.end();
                } else {
                    // 先更新在线状态
                    db.query(`update user_table set online=1 where ID = '${data[0].ID}'`, err => {
                        if(err){
                            console.log(err)
                        } else {
                            res.write(JSON.stringify({
                                code: 0,
                                msg: '登录成功'
                            }))
                            res.end();
                        }
                    })
                    
                }
            })
        }

    } else {
        fs.readFile(`www${req.url}`, (err, data) => {
            if(err) {
                res.writeHeader(404);
                res.write("Not Found!");
            } else {
                res.write(data);            
            }
            res.end();
        })
    }  
});
httpServer.listen(8085);

console.log("connection successful.")