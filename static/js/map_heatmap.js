// Creating map object
var myMap_1 = L.map("map_1", {
  center: [40.7, -87.95],
  zoom: 3
});



// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap_1);

// Assemble API query URL
var url ="/2018metadata";
console.log(url);

var markers = L.markerClusterGroup();
var heatArray = [];

d3.json(url).then((data) => {
  console.log(data);
  
  data.forEach((company_info)=>{
    //console.log(company_info.longtitude);
   // json_list_2018.push(company_info);

    
    if (company_info.longtitude) {
   // markers.addLayer(L.marker([company_info.latitude, company_info.longtitude])
    //      .bindPopup(`Rank: ${company_info.Rank}`+"<hr>"+`Company Name: ${company_info.Company}`+"<br>"+`Company Website: ${company_info.Website}`));

    heatArray.push([company_info.latitude, company_info.longtitude]);

    var heat = L.heatLayer(heatArray, {
      radius: 10,
      blur: 15
    }).addTo(myMap_1);
  
    }
    

    // Add our marker cluster layer to the map
  // myMap_1.addLayer(markers);
  });
    
});
