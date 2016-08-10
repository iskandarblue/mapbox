mapboxgl.accessToken = 'pk.eyJ1IjoiaXNrYW5kYXJibHVlIiwiYSI6ImNpazE3MTJldjAzYzZ1Nm0wdXZnMGU2MGMifQ.i3E1_b9QXJS8xXuPy3OTcg';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [73.8567, 18.5204],
    zoom: 11.15
});

map.on('load', function() {
    // Add a GeoJSON source containing place coordinates and information.
    map.addSource("places", {
        "type": "geojson",
        "data": "pune_hotspots.geojson"
    });
    map.addSource('origins', {
      "type": "geojson",
      "data": "convex.geojson"
    });

    map.addLayer({
        "id": "origins",
        "type": "fill",
        "source": "origins",
            "layout": {},
            "paint": {
                "fill-color": "#00FF00",
                "fill-opacity": 0.2,

            }
    });

    // Add a layer showing the places.
    map.addLayer({
        "id": "places",
        "type": "circle",
        "source": "places",
        "paint": {
            "circle-color" : 'rgba(255, 0, 0, 1)',
            "circle-radius": 6,
            "circle-opacity": 0.5
        }
    });
});

// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['places'] });
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

    if (!features.length) {
        popup.remove();
        return;
    }

    var feature = features[0];

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(feature.geometry.coordinates)
        .setHTML(feature.properties.name)
        .addTo(map);
});
