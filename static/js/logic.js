// Creating map object
var myMap = L.map("map", {
  center: [40.7, -87.95],
  zoom: 3
});

// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

// Assemble API query URL
var url ="/2018metadata";
console.log(url);

var markers = L.markerClusterGroup();
var json_list_2018 = [];

d3.json(url).then((data) => {
  //console.log(data);

  
  
  data.forEach((company_info)=>{
    //console.log(company_info.longtitude);
    json_list_2018.push(company_info);
    if (company_info.Growth) {
      var growth_format = company_info.Growth.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+"%";
      }else {
        var growth_format =" ";
      }
    if (company_info.Revenue) {
    var revenue_format = '$' + company_info.Revenue.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    } else {
      var revenue_format = " "
    }

    if (company_info.longtitude) {
    markers.addLayer(L.marker([company_info.latitude, company_info.longtitude])
    .bindPopup("<h5><b>"+`Rank: ${company_info.Rank}`+"</b></h5><p><a href="+`${company_info.Website}`+">"+ `${company_info.Website}`+"</a></p><h6>"+`Company Name: ${company_info.Company}`+"</h6><h6><b>"+`City: ${company_info.City} ;  State: ${company_info.State}`+"</b></h6><h6>"+`Growth: ${growth_format}`+"</h6><h6>"+`Revenue: ${revenue_format}`+"</h6>"))
  }
    

    // Add our marker cluster layer to the map
   myMap.addLayer(markers);
  });
    
});

// The Table Card

var columns = ["Rank","Company","Founded","Industry","City","State","Years_on_List","Growth"];
var base_url ="/2018metadata/pages/";
var url_1 ="/2018metadata/pages/1";

var page_count = 1;

function display_table(url){

  d3.json(url).then((data) => {

  var	tbody = d3.select('tbody');

  var rows = tbody.selectAll('tr')
                  .data(data)
                  .enter()
                  .append('tr');
 // console.log(data);
        
  // create a cell in each row for each column
  var cells = rows.selectAll('td')
                .data(function (row) {
                 // console.log(row);
                  return columns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })
              .enter()
              .append('td')
              .text(function (d) { return d.value; });

  });
};

function update_table(url){

  d3.json(url).then((data) => {

  var	tbody = d3.select('tbody');
  tbody.selectAll('tr').remove();

  var rows = tbody.selectAll('tr')
                  .data(data)
                  .enter()
                  .append('tr');
 // console.log(data);
        
  // create a cell in each row for each column
  var cells = rows.selectAll('td')
                .data(function (row) {
                 // console.log(row);
                  return columns.map(function (column) {
                  return {column: column, value: row[column]};
                });
              })
              .enter()
              .append('td')
              .text(function (d) { return d.value; });

  });
};



display_table(url_1);

var pre_page = d3.select("#pre_page");
var next_page = d3.select("#next_page");

next_page.on("click", function() {
  page_count++;
  url = base_url + page_count.toString();
  console.log(url);
  update_table(url);
  
});  

pre_page.on("click", function() {
  if (page_count<=1) {
    update_table(url_1);
    page_count = 1;
  } else {
    page_count--;
    url = base_url + page_count.toString();
    console.log(url);
    update_table(url);
  }
});  

// Build the Industry Chart

function buildDonutChart(plot_url,title,plotId,plot_size){
  
  d3.json(plot_url).then(data =>{
    var label_list = data[0];
    var value_list = data[1]
    
    var data = [{
      values: value_list,
      labels: label_list,
      domain: {column: 0},
      name: title,
      hoverinfo: 'label+percent+value+name',
      hole: .5,
      type: 'pie'
    }];
    
    var layout = {
      title: '',
      annotations: [
        {
          font: {
            size: 20
          },
          showarrow: false,
          text: 'Inc.',
          x: 0.5,
          y: 0.5
        }
      ],
      height: plot_size,
      width: plot_size,
      showlegend: false,
      font: {size: 10}

    };
    
    Plotly.newPlot(plotId, data, layout);



  })
}


function buildBarChart(plot_url,name1,name2,chartId,bar_type,bar_width,f_size){

  d3.json(plot_url).then(data =>{

    var trace1 = {
      x: data[0],
      y: data[1],
      type:"bar",
      name: name1,
      marker: {
        color: 'rgb(49,130,189)',
        opacity: 0.7
    }
  };
  var trace2 = {
    x: data[0],
    y: data[2],
    type:"bar",
    name: name2,
    marker: {
      color: 'rgb(78,153,4)',
      opacity: 0.5
  }};
 

var data = [trace1, trace2];

var layout = {
  xaxis: {
    tickangle: -40
  },
  barmode: bar_type,
  height:450,
  width: bar_width,
  font: {size: f_size}

      
};
Plotly.newPlot(chartId, data, layout); 
  });

}

buildDonutChart("/2018metadata/plot/Industry","Industry Distribution","State_chart",420);
buildDonutChart("/growth_rev_state","Company Numbers in States","chartIndustry",410);

buildBarChart("/industry_growth_rev","Growth(%)","Revenue(M)","Industry_Grow_chart","group",650,8);


buildBarChart("/topten_cities","Companies","Growth(%)","City_chart","stack",420,10);
buildBarChart("/topten_companies","Growth(%)","Revenues(k)","Top_ten_chart","stack",540,10);






