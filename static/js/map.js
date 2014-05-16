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
    } else {
        error('Sad banda :,(');
    }

    $('#markTrash').click(function(){
        console.log("click");
        $.post("/trash", { lat:latitude, lon:longitude}).done(function(data) {
            alert("Roskakori: " + data.trashId + "\nRoskia: " + data.count);
            console.log(data);
        });
    });
});


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


function addMarker(lat,lng) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: map,
        icon: '/static/img/roskis-icon.png',
    });
}

function addAcceptZone(lat,lng) {
    var acceptZone = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
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
            json.forEach(function(trash) {
                addMarker(trash.coordinates[0], trash.coordinates[1]);
                addAcceptZone(trash.coordinates[0], trash.coordinates[1]);
            });

        },
        error: function(err){
            console.log(err);
        }
    });
}
