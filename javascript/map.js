//using leaflet for map, function creates map
function maps(loc, position, positionTemp) {
    //inital code mostly from leaflet (https://leafletjs.com/examples/quick-start/) values customized
    //creates a map and sets positon, base position being sundsvall, also limits zoom out range to make the temprature readable
    map = L.map('map').setView(loc, 7);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 7,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //cords needs swapping around due to SMHI api structure
    let cord1, cord2;

    //sets temprature on map at matching coordinates, more elegant solution would be to only display certain "positions of intrest" with temprature data, but that needs a block of locations which im not gonna do for this assignment
    for (let index = 0; index < position.coordinates.length; index++) {
        cord2 = position.coordinates[index][0];
        cord1 = position.coordinates[index][1]

        //generates a marker
        L.marker([cord1, cord2], {
            icon: L.divIcon({
                className: 'text-labels',   // Set class for CSS styling
                html: '<span>' + positionTemp.timeSeries[0].parameters[0].values[index] + " &#8451;" + '</span>'
            }),
        }).addTo(map);;
    }
    L.control.scale().addTo(map);
}

//pans the map to new location
function move(location) {
    location = location[0];

    //error handling
    let error = document.getElementById("error");
    if (error.firstElementChild) {
        //makes sure theres no duplicate errors
        while (error.firstElementChild) {
            error.firstElementChild.remove();
        }
    }

    //checks if the coordinates are within the temprature coordinates fetched from smhi, since there is no data outside said coordinates, and outprints the error on screen
    if (36.229429 < location[2] | location[2] < 2.250475 | 52.50044 > location[1] | location[1] > 70.083754) {
        let message = document.createElement("p");
        message.innerHTML = ("Invalid plats vald, välj en plats närmare/i scandinavien");
        error.append(message);
        return false;
    }

    //formating of coordinates for api compatability, cant handle full "lenght" coordinates
    baseSpot[0] = Number(location[1].substring(0, 8));
    baseSpot[1] = Number(location[2].substring(0, 8));

    //re-initialises page content based of new spot
    start();

    //moves map
    map.flyTo([location[1], location[2]], 8);

    //marker for current position, might not be needed but felt usefull
    let marker = L.marker([location[1], location[2]]).addTo(map);
    marker.bindPopup(location[0]).openPopup();
    return true;
}