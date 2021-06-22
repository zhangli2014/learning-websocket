const http = require("http");
const fs = require("fs");

let server = http.createServer(function (req, res) {
    fs.readFile(`www${req.url}`, (err, data) => {
        if(err) {
            fs.readFile('http_errors/404.html', (err, data) => {
                if(err){
                    
                } else {
                    res.write(data)
                }
            })
            // res.writeHeader(404);
            // res.write("Not Found!");
        } else {
            res.write(data);            
        }
        res.end();
    })
  
});
server.listen("8080");

console.log("success connected!");
