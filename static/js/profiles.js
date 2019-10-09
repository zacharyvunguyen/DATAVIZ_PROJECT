
//Filter Form Initialization

function init_filter(){
  var sel_rank = d3.select("#selRank");
  var sel_state = d3.select("#selState");
  var sel_city = d3.select("#selCity");
  var sel_Founded = d3.select("#selFounded");
  var sel_YearList = d3.select("#selYrs_on_List");
  
  // Use the list of sample names to populate the select options
  // Need start http.server if not use the firefox browser
  
  d3.json("/2018metadata/Rank").then((filtername) => {
    filtername.sort(function(a, b){return a-b});
     
    filtername.forEach((sample) => {
     
      sel_rank
        .append("option")
        .text(sample)
        .property("value", sample);
    })});

  d3.json("/2018metadata/State").then((filtername) => {
    filtername.sort();
    filtername.forEach((sample) => {
        //console.log(sample);
        sel_state
          .append("option")
          .text(sample)
          .property("value", sample);
      })});
  
  d3.json("/2018metadata/City").then((filtername) => {
        filtername.sort();
        filtername.forEach((sample) => {
          //console.log(sample);
          sel_city
            .append("option")
            .text(sample)
            .property("value", sample);
        })});
  

  d3.json("/2018metadata/Founded").then((filtername) => {
    filtername.sort(function(a, b){return b-a});   
    filtername.forEach((sample) => {
          //console.log(sample);
          sel_Founded
            .append("option")
            .text(sample)
            .property("value", sample);
        })})
        
  d3.json("/2018metadata/Years_on_List").then((filtername) => {
      filtername.sort(function(a, b){return b-a});    
      filtername.forEach((sample) => {
            //console.log(sample);
            sel_YearList
              .append("option")
              .text(sample)
              .property("value", sample);
          })})
  
 // Show first info
 BuildProfileInfo(1);
 var rank_1_url = "/rank/1";
 d3.json(rank_1_url).then(function(info) {
    var inti_Lat;
    var inti_Long;
    inti_Lat = parseFloat(info[0]["latitude"]);
    inti_Long = parseFloat(info[0]["longtitude"]);
    BuildProfileMap("/rank/1",inti_Lat,inti_Long,9);

 });
      
}

function BuildProfileInfo(rank){
        rank_profile_url = `/rank/${rank}`;
        var rank_info = d3.select("#Profiles_card").html("");
    
        d3.json(rank_profile_url).then(function(info) {
            
            //console.log(info);
            var revenue_format = "$"+info[0]["Revenue"].toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
            var growth_format = info[0]["Growth"].toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+"%";
           //adding <hr> will cause the problem by using the chrome browser 
            rank_info.append("div").attr("id","infotext")
                    .append("h5").text("Rank: " + `${rank}`)
                    .append("h5").text("Company Name : " +` ${info[0]["Company"]}`)
                    .append("p").text("Founded Year : " + ` ${info[0]["Founded"]}`)
                    .append("p").text("2017 Revenue :   " + ` ${revenue_format}`)
                    .append("p").text("3-Year Growth :   " + ` ${growth_format}`)
                    .append("p").text("Industry :" + ` ${info[0]["Industry"]}`)
                    .append("p").text("City :" + ` ${info[0]["City"]}`+" , State :"+`${info[0]["State"]}`)
                    .append("p").text("Employees  :"+ `${info[0]["Workers"]}`)
                    .append("p").text("Year(s) on the Inc. List : " + ` ${info[0]["Years_on_List"]}`)
                    .append("p").text("Company Website :")
                    .append("a").attr("href",`${info[0]["Website"]}`).text(`${info[0]["Website"]}`);
                    
        });
    
    }


function buildBarChart(data,name1,name2,chartId,bar_type,bar_width,f_size,description){
    var num = data[0].length;
    //console.log(data);

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
    title: `Total ${num} Company(ies)`+ description,
    xaxis: {
      tickangle: -40
    },
    barmode: bar_type,
    height:450,
    width: bar_width,
    font: {size: f_size}
  
        
  };
  Plotly.newPlot(chartId, data, layout); 
    }
  
  
    
function optionChanged_years(year) {
    years_filter_url = `/years_on/${year}/0`;
    d3.json(years_filter_url).then(function(info) {
        var inti_Lat;
        var inti_Long;
        inti_Lat = parseFloat(info[0]["latitude"]);
        inti_Long = parseFloat(info[0]["longtitude"]);
        BuildProfileMap(years_filter_url,inti_Lat,inti_Long,3);

        var info_list =[];
        info.forEach(item =>{
            info_list.push([item["Industry"],item["Growth"],item["Revenue"]/(100000)]);
        
        });
        //transpose
        if (info_list.length === 1) {
            plot_list = [[info_list[0][0]],[info_list[0][1]],[info_list[0][2]]];

        } else {
        var plot_list = info_list.map(function(col, i){
            return info_list.map(function(row){
                return row[i];
            });
        });}
         //console.log(plot_list);
        d3.select("#infotext").remove();

 
        buildBarChart(plot_list,"Growth(%)","Revenue(10k)","Profiles_card","stack","410","8",`stayed in ${year} years on the list.`);


});
}

function optionChanged_founded(founded){
    founded_filter_url = `/founded_year/${founded}/0`;
    d3.json(founded_filter_url).then(function(info) {
        var inti_Lat;
        var inti_Long;
        inti_Lat = parseFloat(info[0]["latitude"]);
        inti_Long = parseFloat(info[0]["longtitude"]);
        BuildProfileMap(founded_filter_url,inti_Lat,inti_Long,3);

        var info_list =[];
        info.forEach(item =>{
            info_list.push([item["Industry"],item["Growth"],item["Revenue"]/(100000)]);
        
        });
        //transpose
        if (info_list.length === 1) {
            plot_list = [[info_list[0][0]],[info_list[0][1]],[info_list[0][2]]];

        } else {
        var plot_list = info_list.map(function(col, i){
            return info_list.map(function(row){
                return row[i];
            });
        });}
        //console.log(plot_list);
        d3.select("#infotext").remove();

 
        buildBarChart(plot_list,"Growth(%)","Revenue(10k)","Profiles_card","stack","410","8",`founded in ${founded}.`);


        

});

  }

function optionChanged_state(state_l){
    state_filter_url = `/state_l/${state_l}/0`;
    d3.json(state_filter_url).then(function(info) {
        var inti_Lat;
        var inti_Long;
        inti_Lat = parseFloat(info[0]["latitude"]);
        inti_Long = parseFloat(info[0]["longtitude"]);
        BuildProfileMap(state_filter_url,inti_Lat,inti_Long,6);

        var info_list =[];
        console.log(info);
        info.forEach(item =>{
            info_list.push([item["Industry"],item["Growth"],item["Revenue"]/(100000)]);
        
        });
        console.log(info_list);
        
        //transpose
        if (info_list.length === 1) {
            plot_list = [[info_list[0][0]],[info_list[0][1]],[info_list[0][2]]];

        } else {
        var plot_list = info_list.map(function(col, i){
            return info_list.map(function(row){
                return row[i];
            });
        });}
        console.log(plot_list);
        d3.select("#infotext").remove();

 
        buildBarChart(plot_list,"Growth(%)","Revenue(10k)","Profiles_card","stack","410","8",`in ${state_l}.`);


});

  
}

function optionChanged_city(city){
    city_filter_url = `/city/${city}/0`;
    d3.json(city_filter_url).then(function(info) {
        var inti_Lat;
        var inti_Long;
        inti_Lat = parseFloat(info[0]["latitude"]);
        inti_Long = parseFloat(info[0]["longtitude"]);
        
        BuildProfileMap(city_filter_url,inti_Lat,inti_Long,8);
        
        var info_list =[];
        info.forEach(item =>{
            info_list.push([item["Industry"],item["Growth"],item["Revenue"]/(100000)]);
        
        });
        //transpose
        if (info_list.length === 1) {
            plot_list = [[info_list[0][0]],[info_list[0][1]],[info_list[0][2]]];

        } else {
        var plot_list = info_list.map(function(col, i){
            return info_list.map(function(row){
                return row[i];
            });
        });}
         //console.log(plot_list);
        d3.select("#infotext").remove();

 
        buildBarChart(plot_list,"Growth(%)","Revenue(10k)","Profiles_card","stack","410","8",`in ${city}.`);

});


  
}

function optionChanged_rank(rank){

    BuildProfileInfo(rank);
    var rank_url = "/rank/"+`${rank}`;
    d3.json(rank_url).then(function(info) {
         var inti_Lat;
         var inti_Long;
         inti_Lat = parseFloat(info[0]["latitude"]);
         inti_Long = parseFloat(info[0]["longtitude"]);
         
         BuildProfileMap(rank_url,inti_Lat,inti_Long,10);

 });
 
  }



//Profile Map
function BuildProfileMap(profile_url,lat,long,zoomnum) {
    
    //Before initializing map check for is the map is already initiated or not


    var container = L.DomUtil.get('map');
        if(container != null){
                container._leaflet_id = null;
            }


    
    var myMap = L.map("map", {
    center: [lat, long],
    zoom: zoomnum
    });
   
  
  // Adding tile layer to the map
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap);
  
  var markers = L.markerClusterGroup();
  
  d3.json(profile_url).then((data) => {
    
    data.forEach((company_info)=>{
      //console.log(company_info.longtitude);
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
  
}


init_filter();


