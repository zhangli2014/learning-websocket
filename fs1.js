const http = require("http");
const fs = require("fs");

let server = http.createServer(function (req, res) {
  fs.readFile("1.txt", (err, data)=>{
    if(err){
      console.log(err)
    } else {
      fs.writeFile("2.txt", data, (err) => {
        if(err) throw err

        console.log("write file succussful.")
      })
      res.write(data)
      res.end();
    }
  });
  
});
server.listen("8080");

console.log("success connected!");
