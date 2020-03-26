var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');


function templateHTML(title, list, body, control) {
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
    ${control}
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
          var template = templateHTML(title, list,
            `<h2>${title}</h2>${description}`,
          '');
          response.writeHead(200);
          response.end(template);
        });

      } else {
        fs.readdir('./data', function(error, fileList){
          var list = templateList(fileList);
          fs.readFile(`data/${title}`,'utf8', function(err, description){

            var template = templateHTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
            );
            response.writeHead(200);
            response.end(template);
          });
        });
      }


    }
    else if(pathname === "/create"){
      fs.readdir('./data', function(error, fileList){
        title = 'WEB - create';
        description = 'Hello, Node.js';
        var list = templateList(fileList);
        var template = templateHTML(title, list, `
            <form action="/create_process" method="post">
              <p>
                <input type="text" name="title" placeholder="제목 입력해주셈">
              </p>
              <p>
                <textarea type="text" name="description" placeholder="설명해주셈"></textarea>
              </p>
              <p>
                <input type="submit" >
              </p>

            </form>
          `,
          ''
        );
        response.writeHead(200);
        response.end(template);
      });
    }
    else if(pathname === "/create_process") {
      var body = '';
      request.on('data', function(data){ // (?) 쿼리 데이터 객체들을 각각 가져오는 과정
        body += data; //
      });
      request.on('end',function(){ // 쿼리 데이터를 다 가져오면 호출됨
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end('success');
        });
      });

    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, fileList){
        var list = templateList(fileList);
        fs.readFile(`data/${title}`,'utf8', function(err, description){

          var template = templateHTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p>
                <input type="text" name="title" placeholder="제목 입력해주셈" value="${title}">
              </p>
              <p>
                <textarea type="text" name="description" placeholder="설명해주셈">${description}</textarea>
              </p>
              <p>
                <input type="submit" >
              </p>

            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });

    } else if(pathname === "/update_process"){
      var body = '';
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`,`data/${title}`,function(error){
          fs.writeFile(`data/${title}`,description,`utf8`,function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
          });

        });
        console.log(post);
      });
    }
    else {
      response.writeHead(404);
      response.end('Not found');
    }



});
app.listen(3000);
