// app.js
var pg = require('pg');
var express = require("express");
var app = express();

var connString = 'postgres://zntxnoglkwslwi:yOyhl4tIsGg1FzI4u0wTchC0HU@ec2-54-204-38-16.compute-1.amazonaws.com:5432/desc87qe0bn276';


app.use(
     "/",
     express.static(__dirname)
);

app.get('/:secret', function(request, response) {
	var secret = request.params.secret;
	pg.connect(connString, function(err, client, done) {
		if(err) response.send("Could not connect to DB: " + err);

		client.query('SELECT environment FROM sessions WHERE secret = $1', [secret], function(err, result) {
			done();
			if(err) return response.send(err);
			if(result.rows.length == 0) return response.redirect("/");
			return response.send(result.rows[0]);
		});
	});
});

app.get('/save', function(request, response) {
	if(request.method == 'POST') {

		console.log("[200]" + req.method + "to" + req.url);

		request.on('data', function(chunk) {
			console.log("Recieved body data:");
			console.log(chunk.toString());
		});

		response.writeHead(200, "OK", {'Content-Type':'text/html'});
		response.end();
	} else {
		console.log("[405]" + req.method + "to" + req.url);
		response.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
	    response.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
  	}
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});