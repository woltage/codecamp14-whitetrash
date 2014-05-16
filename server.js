var PORT = 3000;

var express = require('express');
var app = express();

var service = require("./service");

var bodyParser = require('body-parser');
app.use(bodyParser()); 

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get("/", function(req, res) {
	res.render('index');
});
app.get("/map", function(req, res) {
	res.render('map');
});

app.get('/update', function(req, res) {
	service.updateJson(function(updatedData) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(updatedData));
		res.end();
	});
});

app.get("/roskikset", function(req, res) {
	service.getCurrentData(function(data) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(data));
		res.end();
	})
});

app.get('/mark/:id', function(req, res) {
	service.markTrash(req.param('id'), function(updatedData) {
		//console.log(updatedData);
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(updatedData));
		res.end();
	});
});

app.get('/nearestTrashes', function(req, res) {
    service.getNearestTrashes([req.query.lat,req.query.lon], 10, function (data) {
		res.writeHead(200, {"Content-Type": "application/json"});
		res.write(JSON.stringify(data));
		res.end();
    });
});

app.post('/trash', function(req, res) {
	console.log(req.body);
	var lat = req.body.lat;
	var lon = req.body.lon;
	if (!lat || !lon) {
		writeHead(500);
		res.end();
	}
	else {
		service.trash([lat, lon], function(data) {
			res.writeHead(200, {"Content-Type": "application/json"});
			res.write(JSON.stringify(data));
			res.end();
		});
	}

});

app.use("/static/", express.static(__dirname + '/static'));
app.listen(PORT);
console.log('Listening on port ' + PORT);