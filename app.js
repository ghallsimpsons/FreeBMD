// var connString = 'postgres://zntxnoglkwslwi:yOyhl4tIsGg1FzI4u0wTchC0HU@ec2-54-204-38-16.compute-1.amazonaws.com:5432/desc87qe0bn276';

// var pg = require('pg');
// var express = require("express");
// var app = express();
// app.use(express.logger());


// app.get('/', function(request, response) {
// 	response.send('hell is heroku');
// });

// // app.get('/:secret', function(request, response) {
// // 	var secret = request.params.secret;
// // 	pg.connect(connString, function(err, client, done) {
// // 		if(err) response.send("Could not connect to DB: " + err);
// // 		client.query('SELECT environment FROM sessions WHERE secret = $1', [secret], function(err, result) {
// // 			done();
// // 			if(err) return response.send(err);
// // 			response.render('index', { env: result.rows });
// // 		});

// // 	});
// // });

// var port = Number(process.env.PORT || 5000);
// app.listen(port, function() {
// 	console.log("Listening on " + port);
// });


// web.js
var express = require("express");
var app = express();

app.use(
     "/",
     express.static(__dirname)
);

app.get('/:secret', function(request, response) {
	var secret = request.params.secret;
	response.send(secret);
};

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});