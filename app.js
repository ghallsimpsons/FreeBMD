// app.js
var pg = require('pg');
var express = require("express");
var app = express();

var connString = 'postgres://zntxnoglkwslwi:yOyhl4tIsGg1FzI4u0wTchC0HU@ec2-54-204-38-16.compute-1.amazonaws.com:5432/desc87qe0bn276';

app.use(express.json());

app.use("/",
     express.static(__dirname)
);

app.post('/save', function(request, response) {
	// if(request.method == 'POST') {
	console.log("[200]" + request.method + "to" + request.url);

	console.log(request.body.secret);
});

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

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});