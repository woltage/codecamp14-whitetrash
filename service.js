var http = require("http");
var fs = require('fs');
var gju = require('geojson-utils');

var FILE_NAME = "roskikset.json";

exports.updateJson = function(callback) {

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

			var json = JSON.parse(responseText);
			
			exports.getCurrentData(function(currentData) {
				if (!currentData) {
					currentData = {};
				}

				console.log(currentData);
				json.features.forEach(function(feature) {

					var existingTrash = currentData[feature.properties.ROSKIS_ID];

					if (existingTrash) { // Update coordinates
						console.log("Updating old trash:" + feature.properties.ROSKIS_ID);
						currentData[feature.properties.ROSKIS_ID].coordinates = feature.geometry.coordinates.reverse();
					}
					else {
						console.log("Creating new trash: " + feature.properties.ROSKIS_ID);
						currentData[feature.properties.ROSKIS_ID] = { 
						coordinates: feature.geometry.coordinates.reverse(),
						count: 0 }
					}
				});
				saveData(currentData, function(updatedData) {
					console.log("ok");
					callback(updatedData);
				});
			});
		});
	});
}

exports.markTrash = function(id, callback) {
	this.getCurrentData(function(data) {
		var trash = data[id];
		if (!trash) {
			console.log("Trying to get trash with invalid id: " + id);
			callback(null);
		}
		else {
			data[id].count = trash.count+1;
			data[id].time = new Date();
			saveData(data, callback);
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
};

exports.trash = function(coordinates, callback) {
	exports.getCurrentData(function(data) {
        if (data) {
            var closestTrashId = closestTrashIdTo(coordinates, data, 1)[0];
            data[closestTrashId.id].count = data[closestTrashId.id].count +1;
            //data[closestTrashId].count = data[closestTrashId].count + 1;
            saveData(data, function(savedData) {
                var responseData = {
                    success: true,
                    trashId: closestTrashId.id,
                    count: data[closestTrashId.id].count,
                    dist: parseInt(closestTrashId.dist)
                };

                if (closestTrashId.dist > 50) {
                    responseData.success = false;
                }
                callback(responseData);
            });
        }
        else {
            callback({success: false, dist: "???"})
        }
    });

};

function saveData(data, callback) {
	fs.writeFile(FILE_NAME, JSON.stringify(data), function(err) {
		if (err) {
			console.log(err);
			callback();
		}
		else {
			//console.log("saved: ",data);
			callback(data);
		}
	});
};

function distance(p1, p2) {
    return gju.pointDistance({type: 'Point', coordinates: p1},
                             {type: 'Point', coordinates: p2})
}

function distancesTo(point, data) {
    return Object.keys(data).map(function(key) {
        var o = {};
        for (var attrname in data[key]) { o[attrname] = data[key][attrname]; }
        o.dist = distance(point, data[key].coordinates);
    	o.id = key;
        return o;
    });
}

function closestTrashIdTo(point, trashes, limit) {
    return distancesTo(point, trashes).sort(function (a, b) {
        return a.dist - b.dist;
    }).slice(0,limit);
}

exports.getNearestTrashes = function(point, limit, cb) {
    exports.getCurrentData(function (data) {
        cb(closestTrashIdTo(point, data, limit));
    });
}
