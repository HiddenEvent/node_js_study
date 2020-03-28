var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');


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
          var list = template.list(fileList);
          var html = template.html(title, list,
            `<h2>${title}</h2>${description}`,
          '');
          response.writeHead(200);
          response.end(html);
        });

      } else {
        fs.readdir('./data', function(error, fileList){
          var filteredId = path.parse(title).base;
          var list = template.list(fileList);
          fs.readFile(`data/${filteredId}`,'utf8', function(err, description){
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1','h2']
            });
            var html = template.html(title, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              `<a href="/create">create</a>
              <a href="/update?id=${sanitizedTitle}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
              </form>

              `
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      }


    }
    else if(pathname === "/create"){
      fs.readdir('./data', function(error, fileList){
        title = 'WEB - create';
        description = 'Hello, Node.js';
        var list = template.list(fileList);
        var html = template.html(title, list, `
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
        response.end(html);
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
        var filteredId = path.parse(title).base;
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end('success');
        });
      });

    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, fileList){
        var list = template.list(fileList);
        var filteredId = path.parse(title).base;
        fs.readFile(`data/${filteredId}`,'utf8', function(err, description){

          var html = template.html(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${filteredId}">
              <p>
                <input type="text" name="title" placeholder="제목 입력해주셈" value="${filteredId}">
              </p>
              <p>
                <textarea type="text" name="description" placeholder="설명해주셈">${description}</textarea>
              </p>
              <p>
                <input type="submit" >
              </p>

            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${filteredId}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
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
        var filteredId = path.parse(id).base;
        var filteredTitle = path.parse(title).base;
        fs.rename(`data/${filteredId}`,`data/${filteredTitle}`,function(error){
          fs.writeFile(`data/${filteredTitle}`,description,`utf8`,function(err){
              response.writeHead(302, {Location: `/?id=${filteredTitle}`});
              response.end();
          });

        });
      });
    } else if(pathname === "/delete_process"){
      var body = '';
      request.on('data', function(data){
        body += data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
        })


      });
    }
    else {
      response.writeHead(404);
      response.end('Not found');
    }



});
app.listen(3000);
