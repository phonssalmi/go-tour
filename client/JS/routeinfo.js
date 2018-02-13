function viewroute(){

    swal({  title: 'Your route information',
        html:'<p class="popup_heading">Alternative routes found : 2 </p><br>'+
        '<div class="container-fluid"><div class="row"><div class="col-md-12"><table id="table_route_info">' +
        '<div class=""><tr><th><img src="images/vehicle12.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th><th>Terminal</th></tr>' +
        '<tr><th><td>20.4 km </td><td>19.8minutes </td><td>345 g</td><td>Tykistokatu<a href="http://www.foli.fi/sites/foli.prod-cms.tiera.fi/files/Linjat%203%20ja%2030_7.pdf"> timetable</td></td></tr>' +
        '<tr><th><td>21.6 km </td><td>20 minutes </td><td>425 g</td><td>3 Lemminkaisenkatu<a href="http://www.foli.fi/sites/foli.prod-cms.tiera.fi/files/Linjat%203%20ja%2030_7.pdf"> timetable</td></tr>' +
        '<tr><th><img src="images/car80.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th><th>Parking</th></tr>' +
        '<tr><th><td>20.4 km </td><td>15 minutes </td><td>345 g</td></tr>' +
        '<tr><th><td>21.6 km </td><td>16 minutes </td><td>425 g</td></tr>' +
        '<tr><th><img src="images/bike15.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th></tr>' +
        '<tr><th><td>20.4 km </td><td>1h 15 minutes </td><td>0g</td></tr>' +
        '<tr><th><td>21.6 km </td><td>1h 22 minutes </td><td>0g</td></tr>' +
        '<tr><th><img src="images/man-silhouette1.svg" style="height:20px; width: 20px;" </th><th>Distance</th><th>Duration</th><th>Carbon emission</th></tr>' +
        '<tr><th><td>20.4 km </td><td>2h 45 minutes </td><td>0 g</td></tr>' +
        '<tr><th><td>21.6 km </td><td>2h 56 minutes </td><td>0 g</td></tr>' +
        '</table></div></div> ' +

        '</table></div></div> ' +



        '</table></div></div> ',

        confirmButtonText: 'Ok' });



}