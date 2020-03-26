var http = require('http');
var fs = require('fs');
var url = require('url');


function templateHTML(title, list, body) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}

    ${body}
  </body>
  </html>
  `;
}

function templateList(fileList){
  var list = '<ul>'
  var i = 0;
  while(i < fileList.length){
    list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`
    i++;
  }
  list += '</ul>'
  return list;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var title = queryData.id;

    if(pathname === '/'){
      if(title === undefined){
        fs.readdir('./data', function(error, fileList){
          title = 'Welcome';
          description = 'Hello, Node.js';
          var list = templateList(fileList);


          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
          response.writeHead(200);
          response.end(template);

        })

      } else {
        fs.readdir('./data', function(error, fileList){
          var list = templateList(fileList);
          fs.readFile(`data/${title}`,'utf8', function(err, description){

            var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
            response.writeHead(200);
            response.end(template);
          });
        });
      }


    } else {
      response.writeHead(404);
      response.end('Not found');
    }







});
app.listen(3000);
