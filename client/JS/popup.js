
/*get the default values for the preference*/
var walking_distance=200;
var biking_distance=3;
var fuel_consumption=5;
var carbon_emission=10;

function preference(){
    swal({  title: 'Preference',
        html:'<p>Provide your preference for the route search</p>'+
        '<div class="container-fluid"><div class="row"><div class="col-md-6"> <label>No.of passanger : </label></div><div class="col-md-6"><input type=number value="1" class="text-field"></div></div> ' +
        '<fieldset><legend></legend>'+

        '<div class="row"><div class="col-md-6"><label>Max. walking distance(m) :</label></div> <div class="row"><div class="col-md-6"><input type=number value="'+walking_distance+'" class="text-field" id="walking_distance"></div></div> '+

        '<div class="row"><div class="col-md-6"><label>Walking speed : </label></div>' +
        '<div class="col-md-6"><select class="text-field"><option>Fast</option><option>Medium</option><option>Slow</option></select></div></div>'+

        '<div class="row"><div class="col-md-6"><label>Max. biking distance(km/h) :</label></div>' +
        '<div class="col-md-6"><input type=number value="'+biking_distance+'" class="text-field" id="biking_distance"></div></div> '+

        '<div class="row"><div class="col-md-6"><label>Biking speed :</label></div>' +
        '<div class="col-md-6"><select class="text-field"><option>Fast</option><option>Medium</option><option>Slow</option></select></div></div>'+

        '<fieldset><legend></legend>'+
        '<div class="row"><div class="col-md-6"><label>Car Type : </label></div>' +
        '<div class="col-md-6"><select class="text-field">' +
        '<option>Petrol</option><option>Diesel</option><option>Electric</option></select><br></div></div>'+

        '<div class="row"><div class="col-md-6"><label>Car size : </label></div>' +
        '<div class="col-md-6"><select class="text-field"><option>Small</option><option>Medium</option><option>Large</option></select></div></div>'+

        '<div class="row"><div class="col-md-6"><label>Fuel Consumption(L/100km) : </label></div>' +
        '<div class="col-md-6"><input type=number value="'+fuel_consumption+'" class="text-field" id="fuel_consumption"></div></div>'+

        '<div class="row"><div class="col-md-6"><label>CO<sub>2</sub> emission(g/km) : </label></div>' +
        '<input type=number value="'+carbon_emission+'" class="text-field" id="carbon_emission"><br></div></div></div></fieldset>'

        ,
        showCancelButton: true,
        cancelButtonText:"Cancel",
        cancelButtonColor:"#5375E5",
        confirmButtonText: 'Ok' },


        function(isConfirm) {
            if(isConfirm){
              walking_distance=document.getElementById("walking_distance").value;
              biking_distance=document.getElementById("biking_distance").value;
              fuel_consumption=document.getElementById("fuel_consumption").value;
              carbon_emission=document.getElementById("carbon_emission").value;
            }else{

            }
        }
    
    );
}
function info(){
    swal({   title: 'Southwest Finland Routing',
        html:     'Discover the journey to your destinaton.<br> ' +
        '<br><img src=images/car80.svg style="width: 30px; height:30px;"> '+
        '<img src=images/vehicle12.svg style="width: 30px; height:30px;"> '+
        '<img src=images/bike15.svg style="width: 40px; height:40px;"> ' +
        '<img src=images/man-silhouette1.svg style="width: 40px; height:40px;"> '+
        '<p><br>Based on your search and preference you set, different possible routes are searched. ' +
        'You can see the details of your journey for bus, car, bike and walking. You can also be able to view your route in map.' +
        'Route which does not fit your preference is simply discarded and not displayed in the result</p>'+
        '<br><img src=images/tree101.svg style="width: 50px; height:50px;">'+
        '<p><br>Based on your preferance and your journey, the amount of carbondioxide(co2) produced is calculated.' +
        ' It is indicated by the tree - one tree indicator indicates that one healthy tree is required to compensate the' +
        ' carbon you have emitted throughout your journey. Calculation on your public bus journey is based on 18persons/bus ' +
        'assumption.There is no carbon emmision on bike and walking route.<br>'+
        '<img src=images/gsmlogo.png style="width: 80px; height:40px;"> '+
        '<img src=images/cip.png style="width: 60px; height:40px;">'


    });
}

function highlightnow(){
    $("#time_now").hide('slow');
    $("#date").hide('slow');
    $("#now").css("background","#50C347");
    $("#later").css("background","#8E8E8E");



}
function highlightlater(){

    $("#time_now").show('slow');
    $("#date").show('slow');
    $("#later").css("background","#50C347");
    $("#now").css("background","#8E8E8E");


    var date=new Date();
    var day=date.getDate();
    var month=date.getMonth()+1;
    var year=date.getFullYear();

    var hour=date.getHours();
    var min=date.getMinutes();

    $("#time_now").val(hour+":"+min);
    $("#date").val(day+"/"+month+"/"+year);
}

function time(){
    swal({  title: 'Travel time',
        html:'Please provide your travel time'+
        '<br><div id="time"><label id="now" onclick="highlightnow()">NOW</label><label id="later" onclick="highlightlater()">LATER</label></div>'+
        '<input type=text value="1" class="text-field" id="time_now"><input type=text value="1" class="text-field" id="date">',

        confirmButtonText: 'Ok' });

}
function viewroute(){

    var total_distance=0;
    //determine from and destination address
    var route=document.getElementsByTagName("input");
    var bus_route=route[0].innerHTML;
    var input_from=route[0].value;
    var from=input_from.split(",")[0];
    var input_destination=route[1].value;
    var destination=input_destination.split(",")[0];

    //distance and time
    var info=document.getElementsByTagName("h3")[0].innerHTML;
    var distance=info.split(",")[0];


    if(distance.split(" ")[1]=="km"){

      total_distance=(distance.split(" ")[0])*1000;

    }
    else{

       total_distance=distance.split(" ")[0];
    }


    //on average a bus produces 3.4 gram co2 per mile-- taken from statistic
    //so 1600m=3.4 gram and 1m=0.002125g
    //so we get the emission in the m and km.
    var bus_carbon=(total_distance*0.002125).toFixed(2);
    var time=info.split(",")[1];

    //get the co2 emission for car from preference.
    //the emission is 1000m=carbon_emission
    //so 1m=carbon_emission/1000;
    var co2_emission=carbon_emission/1000;
    var car_carbon=(total_distance*co2_emission).toFixed(2);


    //in city areas, average speed of passenger bus is about 25km/hour
    //so 25000m=60min; 1m=60/25000;
    var avg_bus_speed=60/25000;
    var bus_time=(total_distance*avg_bus_speed).toFixed(2);
    var bus_min=bus_time.split(".")[0] + " min";
    var bus_sec=bus_time.split(".")[1]+" s";
    var final_bus_time=bus_min +" "+ bus_sec;

    //in city areas, average speed of a car is about 60km/hour
    //so 60000m=60min; 1m=60/60000;
    var avg_car_speed=60/60000;
    var car_time=(total_distance*avg_car_speed).toFixed(2);
    var car_min=car_time.split(".")[0] + " min";
    var car_sec=car_time.split(".")[1]+" s";
    var final_car_time=car_min +" "+ car_sec;


    //from stat, average speed of a bike is 15.5km/hour
    //so 15500m=60min so 1m=60/15500

    var avg_bike_speed=60/15500;
    var bike_time=(total_distance*avg_bike_speed).toFixed(2);
    var bike_min=bike_time.split(".")[0] + " min";
    var bike_sec=bike_time.split(".")[1]+" s";
    var final_bike_time=bike_min +" "+ bike_sec;


    //from stat the average walking speed of human is about 5km/hour
    //so 5000m=60min;  1m=60/5000m;
    var avg_walking_speed=60/5000;
    var walking_time=(total_distance*avg_walking_speed).toFixed(2);
    var walking_min=walking_time.split(".")[0] + " min";
    var walking_sec=walking_time.split(".")[1]+" s";
    var final_walking_time=walking_min +" "+ walking_sec;



    swal({  title: 'Your route information',

        html:'<p><b>From:</b> '+from +' '+
        '<p><b>Destination:</b> '+ destination+'</p>'+
        '<p class="popup_heading">Routes found  '+ route.length + ' </p><br>'+
        '<div class="container-fluid"><div class="row"><div class="col-md-12"><table id="table_route_info">' +
        '<div class=""><tr><th><img src="images/vehicle12.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th><th>Terminal</th></tr>' +
        '<tr><th><td>'+ distance+' </td><td>'+final_bus_time+' </td><td>'+ bus_carbon+' g</td><td>Tykistokatu<a href="http://www.foli.fi/sites/foli.prod-cms.tiera.fi/files/Linjat%203%20ja%2030_7.pdf" target="_blank"> timetable</td></td></tr>' +
        '<tr><th><img src="images/car80.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th><th>Parking</th></tr>' +
        '<tr><th><td>'+ distance+' </td><td>'+final_car_time +' </td><td>'+car_carbon+' g</td></tr>' +

        '<tr><th><img src="images/bike15.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th></tr>' +
        '<tr><th><td>'+distance+' </td><td>'+final_bike_time+' </td><td>0 g</td></tr>' +
        '<tr><th><img src="images/man-silhouette1.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th></tr>' +
        '<tr><th><td>'+distance+' </td><td>'+final_walking_time+' </td><td>0 g</td></tr>' +

        '</table></div></div> ' +

        '</table></div></div> ' +



        '</table></div></div> ',

        confirmButtonText: 'Ok' });



}
