
// put the Url in variables.
var Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var plates_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the Url
d3.json(Url).then(function (data) {
// Once the response is got, send the data.features and data.features object to the createFeatures function.
  createFeatures(data.features);
});

// define the variables plates and perform a GET request to the plates_URL and then add them
var plates = new L.LayerGroup();

d3.json(plates_URL).then(function(data) {
  L.geoJson(data, {
    color: "#FFA500",
    weight: 4,
  }).addTo(plates);
  
  plates.addTo(myMap);

});

function createFeatures(earthquakeData) {

  // Define a function that will run once for each feature in the features array.
  // Give each feature a popup that describes the place, magnitude and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  // Run the geojsonMarkerOptions function by Creating a circle marker layer .
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions(feature));
    }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: config.API_KEY
    })

  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: config.API_KEY
    })

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: config.API_KEY
    });

  // Create a baseMaps object.
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    "Tectonic Plates": plates,
    "Earthquakes": earthquakes
  };

  // Create the map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellite,plates, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var info = L.control({position: 'bottomright'});

  info.onAdd = function(){
    var div = L.DomUtil.create("div","legend");
    return div;
    }

    info.addTo(myMap);

    document.querySelector(".legend").innerHTML=showLegend();

    }

    // Creating a function for the circle color based on the magnitude

 function chooseColor(mag){
    switch(true){
        case (-10 <= mag && mag <= 10):
            return "#00ffbf";
        case (10 <= mag && mag <= 30):
            return "#bfff00";
        case (30 <= mag && mag <= 50):
            return "#ffbf00";
        case (50 <= mag && mag <= 70):
            return "#ff8000";
        case (70 <= mag && mag <= 90):
            return "#ff4000";
        default:
            return "#a50000";
    };
 }

 // Creating a function for the legend using the magnitude interval
 function showLegend(){
    var legendInfo = [{
        limit: "Mag: -10-10",
        color: "#00ffbf"
    },{
        limit: "Mag: 10-30",
        color: "#bfff00"
    },{
        limit:"Mag: 30-50",
        color:"#ffbf00"
    },{
        limit:"Mag: 50-70",
        color:"#ff8000"
    },{
        limit:"Mag: 70-90",
        color:"#ff4000"
    },{
        limit:"Mag: 90+",
        color:"#a50000"
    }];

    var header = "<h3>Magnitude</h3><hr>";

    var strng = "";
   
    for (i = 0; i < legendInfo.length; i++){
        strng += "<p style = \"background-color: "+legendInfo[i].color+"\">"+legendInfo[i].limit+"</p> ";
    }
    
    return header+strng;

}

 function geojsonMarkerOptions(feature) {
  // Use the magnitude for the radius and depth for the color of each circle.
  return {
    radius: feature.properties.mag * 5,
    fillColor: chooseColor(feature.geometry.coordinates[2]),
    color: "black",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };
};