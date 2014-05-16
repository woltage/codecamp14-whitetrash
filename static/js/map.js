var map;

$(document).ready(function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(data) {
            mapInit(data.coords.latitude, data.coords.longitude);
        });
    } else {
        error('Sad banda :,(');
    }
});


function mapInit(lat, lng) {

    getLocations();
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

function getLocations() {
    console.log("getting markers");
    $.ajax({
        type: "GET",
        url: "/roskikset",
        dataType: "json",
        success: function(json){
            console.log("fetched markers");
            Object.keys(json).slice(0, 30).forEach(function(key) {
                console.log(key);
                console.log(json[key]);
                addMarker(json[key].coordinates[0], json[key].coordinates[1]);
                addAcceptZone(json[key].coordinates[0], json[key].coordinates[1]);

            });
        },
        error: function(err){
            console.log(err);
        }
    });
}
