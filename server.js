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

function respondJson(res, updatedData) {
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(updatedData));
    res.end();
}
app.get('/update', function(req, res) {
	service.updateJson(function(updatedData) {
        respondJson(res, updatedData);
    });
});

app.get("/roskikset", function(req, res) {
	service.getCurrentData(function(data) {
        respondJson(res, data);
	})
});

app.get('/mark/:id', function(req, res) {
	service.markTrash(req.param('id'), function(updatedData) {
        respondJson(res, updatedData);
	});
});

app.get('/nearestTrashes', function(req, res) {
    service.getNearestTrashes([req.query.lat,req.query.lon], 10, function (data) {
        respondJson(res, data);
    });
});

app.post('/trash', function(req, res) {
	console.log(req.body);
	var lat = req.body.lat;
	var lon = req.body.lon;
	if (!lat || !lon) {
        respondJson(res, {success: false});
	}
	else {
		service.trash([lat, lon], function(data) {
            respondJson(res, data);
		});
	}

});

app.use("/static/", express.static(__dirname + '/static'));
var PORT = Number(process.env.PORT || 3000);
app.listen(PORT, function() {
    console.log("Listening on " + PORT);
});
