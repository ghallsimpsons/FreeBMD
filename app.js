// app.js
var connString = 'postgres://zntxnoglkwslwi:yOyhl4tIsGg1FzI4u0wTchC0HU@ec2-54-204-38-16.compute-1.amazonaws.com:5432/desc87qe0bn276';

var pg = require('pg');
var express = require("express");
var cons = require('consolidate');
var app = express();

app.engine('html', cons.hogan);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.use(express.bodyParser());

app.get('/', function(request, response) {
	return response.render('index', {});
});
app.get('/test', function(request, response) {
	return response.render('test', {});
});


//
app.post('/save', function(request, response) {
	// if(request.method == 'POST') {
	console.log("[200]" + request.method + "to" + request.url);

	console.log(request.body.secret + '\n' + request.body.env);

	pg.connect(connString, function(err, client, done) {
		if(err) response.send("Could not connect to DB: " + err);

		client.query('UPDATE sessions SET environment=$1 WHERE secret = $2', [request.body.env, request.body.secret], function(err, result) {
			done();
			if(err) return response.send(err);
			response.writeHead(200, "OK", {'Content-Type': 'text/html'});
		    response.end();
		});
	});

});



app.post('/fork', function(request, response) {
	
	var token = Math.floor(Math.random()*10000).toString()
		secret = Math.floor(Math.random()*10000).toString(),
		env = request.body.env;

	console.log("Fork request");

	// Connect to DB and copy environment with new secret

	pg.connect(connString, function(err, client, done) {
		if(err) response.send("Could not connect to DB: " + err);

		// TODO: check that secret does not overwrite another secret
		//
		// client.query('SELECT environment FROM sessions WHERE secret = $1', [secret], function(err, result) {
		// 	done();
		// 	if(err) return response.send(err);
		// 	if(result.rows.length == 0) 
		// });

		client.query('INSERT INTO sessions VALUES($1, $2, $3, current_timestamp, current_timestamp)', [token, secret, env], function(err, result) {
			done();
			if(err) return response.send(err);
			return response.redirect("/notebook/" + secret);
		});
	});

});


app.get('/notebook/:secret', function(request, response) {
	var secret = request.params.secret;
	pg.connect(connString, function(err, client, done) {
		if(err) response.send("Could not connect to DB: " + err);

		client.query('SELECT environment FROM sessions WHERE secret = $1', [secret], function(err, result) {
			done();
			if(err) return response.send(err);
			if(result.rows.length == 0) return response.redirect("/");
			var _env = result.rows[0].environment;
			console.log(_env);
			return response.render('index',{env: _env});
		});
	});
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
