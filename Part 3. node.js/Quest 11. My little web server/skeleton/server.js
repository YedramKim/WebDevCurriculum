var http = require("http");
var urlParse = require("url");
var qs = require('querystring');

http.createServer(function(req, res) {
	// TODO: 이 곳을 채워넣으세요..!
	var url = req.url;
	url = urlParse.parse(url, true);
	var method = req.method; //GET or POST
	var path = url.pathname;
	var query = url.query;

	if(path === "/foo") {
		res.writeHead(200, {
			"Content-Type" : "text/html"
		});

		if(method === "GET") {
			res.end("Hello, " + query.bar);
		}else if(method === "POST") {
			var body = "";

			req.on('data', function(data) {
				body += data.toString();
			});

			req.on('end', function(){
				body = qs.parse(body);
				res.end("Hello, " + body.bar);
			});
		}
	}else if(path === "/") {
		res.writeHead(200, {
			"Content-Type" : "text/html"
		});
		res.end("Hello World!");
	}else{ // 그 외의 url은 리다이렉트
		res.writeHead(302, {
			"Location" : "/"
		});
		res.end("Redirecting");
	}

}).listen(8080);