var map;
var latitude;
var longitude;
$(document).ready(function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(data) {
            latitude = data.coords.latitude;
            longitude = data.coords.longitude;
            mapInit(latitude, longitude);
        });
        navigator.geolocation.watchPosition(function (data) {
            if (userMarker) {
                userMarker.setPosition(new google.maps.LatLng(data.coords.latitude, data.coords.longitude));
                console.log(userMarker);
            }
            if (map) {
                map.panTo(new google.maps.LatLng(data.coords.latitude, data.coords.longitude));
            }
        });
    } else {
        error('Sad banda :,(');
    }

    $('#markTrash').click(function(){
        console.log("click");
        $.post("/trash", { lat:latitude, lon:longitude}).done(function(data) {
            if (data.success) {
                alert("Roskakori: " + data.trashId +"\nEtäisyys: " + data.dist + " metriä\nRoskia: " + data.count);
            }
            else {
                alert("Roskakori: " + data.trashId +"\nEtäisyys: " + data.dist + " metriä\n\nOlet liian kaukana!");
            }
            console.log(data);
        });
    });
});

var map = null;

function mapInit(lat, lng) {

    getLocations(lat, lng);
    var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(lat, lng),
        disableDefaultUI: true
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    google.maps.event.addListener(map, 'zoom_changed', function() {
        console.log(map.getZoom());
    });

}

var userMarker = null;

function addUser(lat,lng) {
    userMarker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: map,
        icon: '/static/img/user-marker.png',
    });
}

function addMarker(lat,lng,isNearest) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: map,
        icon: isNearest ? '/static/img/roskis-closest-icon.png' : '/static/img/roskis-icon.png',
    });
}

function addAcceptZone(lat,lng) {
    var acceptZone = {
      strokeColor: '#1C75BC',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#1C75BC',
      fillOpacity: 0.35,
      center: new google.maps.LatLng(lat, lng),
      map: map,
      radius: 50
    };
    var circle = new google.maps.Circle(acceptZone);
}

function getLocations(lat, lng) {
    console.log("getting markers");
    $.ajax({
        type: "GET",
        url: "/nearestTrashes",
        dataType: "json",
        data: {lat: lat, lon: lng},
        success: function(json){
            console.log("fetched markers");
            addUser(lat, lng);
            json.slice(0, 1).forEach(function(trash) {
                addMarker(trash.coordinates[0], trash.coordinates[1], trash.dist < 50);
                addAcceptZone(trash.coordinates[0], trash.coordinates[1]);
                document.getElementById("markTrash").disabled = trash.dist >= 50;
            });
            json.slice(1,10).forEach(function(trash) {
                addMarker(trash.coordinates[0], trash.coordinates[1], false);
                addAcceptZone(trash.coordinates[0], trash.coordinates[1]);
            });
        },
        error: function(err){
            console.log(err);
        }
    });
}
