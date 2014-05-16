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
        zoom: 14,
        center: new google.maps.LatLng(lat, lng),
        disableDefaultUI: true
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

}


function addMarker(lat,lng) {
    marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: map,
        icon: '/static/img/roskis-icon.png',
    });
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

            });
        },
        error: function(err){
            console.log(err);
        }
    });
}
