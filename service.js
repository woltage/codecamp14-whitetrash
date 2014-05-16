var http = require("http");
var fs = require('fs');

var FILE_NAME = "roskikset.json";

exports.getSomeShit = function() {
	return {value: "OK"};
}

exports.updateJson = function() {

	http.get({
		host: "tampere.navici.com",
		port: 80,
		path: "/tampere_wfs_geoserver/opendata/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=opendata:WFS_ROSKIS&outputFormat=json&srsName=EPSG:4326"
	},
	function(response) {
		var responseText = "";
		
		response.on('data', function(chunk) {
			responseText += chunk;
		});

		response.on('end', function(){

			var parsed = {};

			console.log(responseText);
			var json = JSON.parse(responseText);
			
			json.features.forEach(function(feature) {
				parsed[feature.properties.ROSKIS_ID] = { 
					coordinates: feature.geometry.coordinates,
					count: 0
				};
			});

			saveData(parsed, function() {
				console.log("ok");
			})

		});
	});
}

function saveData(data, callback) {
	fs.writeFile(FILE_NAME, JSON.stringify(data), function(err) {
		if (err) {
			console.log(err);
			callback();
		}
		else {
			console.log("saved: ",data);
			callback();
		}
	});
};

exports.getCurrentData = function (callback) {
	fs.readFile(FILE_NAME, function(err, fileData) {
		var data;
		if (err || !fileData) {
			callback(null);
		}
		else {
			data = JSON.parse(fileData);
			callback(data);
		}
	});
}