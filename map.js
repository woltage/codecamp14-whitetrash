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
    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(lat, lng),
        disableDefaultUI: true
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

}