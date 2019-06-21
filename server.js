const express = require('express');
const port = process.env.PORT || 80;
const serveStatic = require("serve-static")
const path = require('path');
app = express();
// app.use(serveStatic(path.join(__dirname, 'dist')));
app.use(express.static(__dirname, '/dist/'));
app.get(/.*/, function(req, res){
    res.sendfile(__dirname, '/dist/index.html')
});
app.listen(port);
console.log("Server started on port " + port);
