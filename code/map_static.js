mapboxgl.accessToken = 'pk.eyJ1IjoiaXNrYW5kYXJibHVlIiwiYSI6ImNpazE3MTJldjAzYzZ1Nm0wdXZnMGU2MGMifQ.i3E1_b9QXJS8xXuPy3OTcg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [73.8567, 18.5204],
    zoom: 11
});

var popup = new mapboxgl.Popup({
    closeOnClick: false,
    closeButton: false
});

var legend = document.getElementById('legend');
var intervalLabel = document.getElementById('interval');

// Will contain the layers we wish to interact with on
// during map mouseover and click events.
var layerIDs = [];

var timeDelays = [
  [4.107, '#00A2E5'],
  [2.346, '#1F8ABE'],
  [1.567, '#3F7398'],
  [0.970, '#5F5C72'],
  [0.489, '#7F454C'],
  [0.177, '#9F2E26'],
  [0.00, '#BF1700']
];


var intervals = [
    "630", //06:30
    "830",
    '930',
    '1030',
    '1130',
    '160', //16:00
    '180',
    '190',
    '200',
    '2100',
    '0'
];

function filterBy(interval, mean_dist, index) {
    // Clear the popup if displayed.
    popup.remove();

    var filters = [
        "all",
        ["==", "interval", interval],
        [">=", "mean_dist", mean_dist[0]]
    ];

    if (index !== 0) filters.push(["<", "mean_dist", timeDelays[index - 1][0]]);
    map.setFilter('circle-' + index, filters);
    map.setFilter('label-' + index, filters);

    // Set the label to the interval name
    intervalLabel.textContent = interval;
}


map.on('load', function() {

        map.addSource('mean_dist', {
            'type': 'geojson',
            'data': 'super_merge2.geojson'
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

        // Apply layer styles
        timeDelays.forEach(function(mean_dist, i) {
            var layerID = 'circle-' + i;
            layerIDs.push(layerID);

            map.addLayer({
                "id": layerID,
                "type": "circle",
                "source": "mean_dist",
                "paint": {
                    "circle-opacity": 0.5,
                    "circle-radius": Math.sqrt(Math.abs(mean_dist[0]*1000)*2),
                    "circle-color": {
                          property: 'cat',
                          type: 'categorical',
                          stops:[
                            ['0', '#00A2E5'],
                            ['1', '#1F8ABE'],
                            ['2', '#3F7398'],
                            ['3', '#5F5C72'],
                            ['4', '#7F454C'],
                            ['5', '#9F2E26'],
                            ['6', '#BF1700']]
                        }
                }
            });

            map.addLayer({
                "id": "label-" + i,
                "type": "symbol",
                "source": "mean_dist",
                "layout": {
                    "text-field": "",
                    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                    "text-size": 12
                },
                "paint": {
                    "text-color": "#FFF8DC"
                }
            });

            // Set filter to first interval in list +
            // timeDelay rating. 0 = '630' e.g. 06:30
            filterBy(parseInt(intervals[0]), mean_dist, i);

            // Add legend bar
            var bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.width = 100 / timeDelays.length + '%';
            bar.style.backgroundColor = mean_dist[1];
            legend.insertBefore(bar, legend.firstChild);
        });


        document.getElementById('slider').addEventListener('input', function(e) {
            var interval = parseInt(e.target.value, 10);

            timeDelays.forEach(function(mean_dist, i) {

                filterBy(parseInt(intervals[interval]), mean_dist, i);
            });

        });

        map.on('mousemove', function(e) {
            var features = map.queryRenderedFeatures(e.point, { layers: layerIDs });
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        });

        map.on('click', function(e) {
            var features = map.queryRenderedFeatures(e.point, { layers: layerIDs });
            if (!features.length) {
                popup.remove();
                return;
            }

            var feature = features[0];


            var link = document.createElement('a');
            link.textContent =  feature.properties.destinatio + ': ' + Math.round(feature.properties.mean_dist * 100) / 100 + ' km';
            link.textConent = feature.properties.destination

            // Use wrapped coordinates to ensure longitude is within (180, -180)
            var coords = feature.geometry.coordinates;
            var ll = new mapboxgl.LngLat(coords[0], coords[1]);
            var wrapped = ll.wrap();

            // Center the map to its point.
            map.flyTo({ center: wrapped });
            popup.setLngLat(wrapped)
                .setHTML(link.outerHTML)
                .addTo(map);
        });
    });