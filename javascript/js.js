let lightning;
const dateObject = new Date();
let map;
let baseSpot = [62.39129, 17.3063];

//the whole thing pretty much
async function start() {
    console.log("ran")
    console.log(baseSpot)
    let head = document.getElementById("weatherHeader");
    let location = baseSpot;
    //time format for api
    let month = dateObject.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let hours = dateObject.getHours();
    if (hours < 10) {
        hours = "0" + hours;
    }
    hours = hours + "0000Z";

    let time = dateObject.getFullYear() + month + dateObject.getDate() + "T" + hours;
    let locationFetch = "http://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/" + location[1] + "/lat/" + location[0] + "/data.json";
    let multipoint = "http://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint.json?downsample=40";
    let multipointTemp = "http://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint/validtime/" + time + "/parameter/t/leveltype/hl/level/2/data.json?with-geo=false&downsample=40";
    let data = await getData(locationFetch);
    let multipointData = await getData(multipoint)
    let multipointDataTemp = await getData(multipointTemp)

    //cleanup for search
    cleanup();

    //gets current times index in data
    let currentPos = currentTime(data);

    //copies icon from hidden element, probaly better to have it like some loose file somewhere but wanted to showcase my immense graphical talents *Semi-Sarcastic
    head.append(document.getElementsByClassName(currentWeatherSymbol(data, currentPos))[0].cloneNode(true));

    //current temprature
    let text = document.createElement("p");
    text.innerHTML = "&#8451; " + currentTemprature(data, currentPos);
    head.append(text)

    //populate main box
    let box = document.getElementById("currentWeather");
    populate(data, 3, box, true, currentPos);

    //generate map
    if (!map) {
        maps(location, multipointData, multipointDataTemp);   
    }

}

function cleanup() { 
    let box = document.getElementById("currentWeather");
    while(box.firstElementChild) {
        box.firstElementChild.remove();
    }
    let head = document.getElementById("weatherHeader");
    while (head.firstElementChild) {
        head.firstElementChild.remove();
    }
    let forecast = document.getElementById("forecastBox");
    while (forecast.firstElementChild) {
        forecast.firstElementChild.remove();
    }
 }

//gets data with fetch call
async function getData(url) {
    try {
        let rawData = await fetch(url);
        if(!rawData.ok) {
            console.log("problem with fetch content")
        }
        let data = await rawData.json();
        return data;
    }
    catch(error) {
        console.log("it broke")
    }
}

//using leaflet for map
function maps(loc, position, positionTemp) {
    //inital code mostly from leaflet (https://leafletjs.com/examples/quick-start/) values customized
    map = L.map('map').setView(loc, 7);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 7,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let cord1, cord2;
    for (let index = 0; index < position.coordinates.length; index++) {
        cord2 = position.coordinates[index][0];
        cord1 = position.coordinates[index][1]
        L.marker([cord1, cord2], {
            icon: L.divIcon({
                className: 'text-labels',   // Set class for CSS styling
                html: '<span>' + positionTemp.timeSeries[0].parameters[0].values[index] + " &#8451;" +'</span>'
            }),
        }).addTo(map);;
    }
    L.control.scale().addTo(map);
}

function move(location) {
    location = location[0];

    let error = document.getElementById("error");
    if (error.firstElementChild) {
        while (error.firstElementChild) {
           error.firstElementChild.remove();
        } 
    }
    if (36.229429 < location[2] | location[2] < 2.250475 | 52.50044 > location[1] | location[1] > 70.083754) {
        let message = document.createElement("p");
        message.innerHTML = ("Invalid plats vald, välj en plats närmare/i scandinavien");
        error.append(message);
        return false;
    }
    baseSpot[0] = Number(location[1].substring(0, 8));
    baseSpot[1] = Number(location[2].substring(0, 8));
    start();
    map.flyTo([location[1], location[2]], 8);
    let marker = L.marker([location[1], location[2]]).addTo(map);
    marker.bindPopup(location[0]).openPopup();
    return true;
}

window.search = function search(val) {
    let fetch = fetchSearch("https://nominatim.openstreetmap.org/search?format=json&q=" + val)
    if (fetch) {
        changeTitle(val);
    }
}

function changeTitle(val) {
    let value = val[0].toUpperCase() + val.substring(1);
    console.log(value);
    document.getElementById("titleName").innerHTML = value;
}

async function fetchSearch(url) {
    try {
        let rawData = await fetch(url);
        if (!rawData.ok) {
            console.log("problem with fetch content")
        }
        let data = await rawData.json();
        let map = data.map(function (data) {
            return [data.display_name, data.lat, data.lon];
        });
        move(map);
    }
    catch (error) {
        console.log("it broke" + error)
    }
}

//gets current temprature based of earliest time gotten from api
function currentTemprature(data, time) {
    let temp;
    for (let i = 0; i < data.timeSeries[time].parameters.length; i++) {
        if (data.timeSeries[time].parameters[i].name == "t") {
            temp = data.timeSeries[time].parameters[i].values[0];
        }
    }
    return temp;
}

//populates object with info based on a set of data, a cap of amount of days in case of smaller, and an object to populate with said data, and headline if that is wanted.
//current pos to mark current time period, kinda nice, skipinterwall selects the intervall of ignored entries for non current day
function populate(data, cap, box, headline, currentPos) {
    let date;
    let runtime = 0;

    //loop through all data, 28 hours worth of display, smaller loop for 2 day firecast
    for (let index = 0; index < 28; index++) {

        //overall container for a block
        let container = document.createElement("div");
        container.setAttribute("class", "weatherList");

        //create index for later pushing
        let info = [];

        //populating index with values
        for (let index = 0; index < 5; index++) {
            let container = document.createElement("p");
            if (index > 1) {
                container.setAttribute("class", "extra");   
            }
            info.push(container)
        }

        //marks current
        if (index == currentPos) {
            container.setAttribute("id", "currentTimePeriod");
        }

        //readable time array without excess T
        var time = data.timeSeries[index].validTime.split('T');

        //overlay for days
        if (headline) {
            if (!date | date != time[0]) {
                //only get for within cap
                runtime++;
                if (runtime == cap) {
                    break;
                }
                
                h3 = document.createElement("h3");
                if (!date) {
                    h3.innerHTML = "Idag, " + getDay(0);
                }
                else {
                    h3.innerHTML = "Imorn, " + getDay(1);
                }
                box.append(h3);
                date = time[0];
            }   
        }

        //removes time post HH-MM
        time[1] = time[1].substring(0, time[1].length - 4);

        //populating info array
        info[0].innerHTML = "Tid: " + time[1];   

        //inconsistent positions of returns in api (first time seeing that) forces me to dubble check the names before adding them.. whooo recursion
        for (let i = 0; i < data.timeSeries[index].parameters.length; i++) {
            if (data.timeSeries[index].parameters[i].name == "t") {
                info[1].innerHTML = "Temperatur: " + data.timeSeries[index].parameters[i].values[0] + " &#8451;";
                continue
            }
            else if (data.timeSeries[index].parameters[i].name == "ws") {
                info[2].innerHTML = "Vindhastighet: " + data.timeSeries[index].parameters[i].values[0] + " m/s";
                continue
            }
            else if (data.timeSeries[index].parameters[i].name == "pmin") {
                info[3].innerHTML = "Nederbörd: " + data.timeSeries[index].parameters[i].values[0];
                continue
            }
            else if (data.timeSeries[index].parameters[i].name == "pmax") {
                info[3].innerHTML = info[3].innerHTML + " - " + data.timeSeries[index].parameters[i].values[0] + " mm/h";
                continue
            }
            else if (data.timeSeries[index].parameters[i].name == "r") {
                info[4].innerHTML = "Humiditet: " + data.timeSeries[index].parameters[i].values[0] + "%";
            }
        }

        let textContainer = document.createElement("div");

        //probaly more efficient to not send a giant object but hey it works, adds svg files relevant
        let copy = document.getElementsByClassName(currentWeatherSymbol(data, index))[0].cloneNode(true);
        container.append(copy);

        //populating container
        for (let index = 0; index < info.length; index++) {
            textContainer.append(info[index]);
        }
        
        container.append(textContainer);

        //push container content into box
        box.append(container);
    }

    //larger loop for week forecast
    let currentDate;
    let timeGroup = [];
    let timeNumbers = [];
    for (let index = 0; index < data.timeSeries.length; index++) {
        let time;
        if (timeGroup.length < 10) {
            time = data.timeSeries[index + 1].validTime;
        }
        else {
            time = data.timeSeries[index].validTime;
        }
        time = time.split('T')[0];
        if (time != currentDate) {
            timeNumbers.push(time);
            timeGroup.push(data.timeSeries[index]);
            currentDate = time;
        }
    }
    for (let index = 0; index < timeGroup.length; index++) {
        let container = document.createElement("div");
        let info = [];
        for (let i = 0; i < 4; i++) {
            let box = document.createElement("p");
            info.push(box);
        }
        info[0].innerHTML = timeNumbers[index];
        for (let i = 0; i < timeGroup[index].parameters.length; i++) {
            if (timeGroup[index].parameters[i].name == "t") {
                info[1].innerHTML = "Temperatur: " + timeGroup[index].parameters[i].values[0] + " &#8451;";
            }
            else if (timeGroup[index].parameters[i].name == "pmin") {
                info[2].innerHTML = "Nederbörd: " + timeGroup[index].parameters[i].values[0];
            }
            else if (timeGroup[index].parameters[i].name == "pmax") {
                info[2].innerHTML = info[2].innerHTML + " - " + timeGroup[index].parameters[i].values[0] + " mm/h";
            }
        }
        //probaly more efficient to not send a giant object but hey it works, adds svg files relevant
        let copy = document.getElementsByClassName(currentWeatherSymbol(data, index))[0].cloneNode(true);
        container.append(copy);
        let textContainer = document.createElement("div");
        for (let i = 0; i < 4; i++) {
            textContainer.append(info[i]);
        }
        container.append(textContainer);
        document.getElementById("forecastBox").append(container);
    }
}

//gets current time based of date object
function currentTime(data) {
    let target = dateObject.getHours() + ":00";
    //in case value is lower than double digit
    if (target.length < 5) {
        target = "0" + target;
    }
    for (let index = 0; index < data.timeSeries.length; index++) {
        //readable time array without excess T
        var time = data.timeSeries[index].validTime.split('T');
        //removes time post HH-MM
        time[1] = time[1].substring(0, time[1].length - 4);
        if (time[1] == target) {
            return index;
        }
    }
}

//returns day based of current day and extra integer
function getDay(extraVal) {
    let day = dateObject.getDay();
    day = day + extraVal;
    let val;
    switch (day) {
        case 1:
            val = "Måndag"
            break;
        case 2:
            val = "Tisdag"
            break;
        case 3:
            val = "Onsdag"
            break;
        case 4:
            val = "Torsdag"
            break;
        case 5:
            val = "Fredag"
            break;
        case 6:
            val = "Lördag"
            break;
        case 0:
            val = "Söndag"
            break;
        default:
            val = "error"
            break;
    }
    return val;
}

//gets current weather based of earliest time gotten from api
function currentWeatherSymbol(data, time) {
    let symbol;
    ///TODO IF PERFECT
    //SNOW
    //THUNDER WITH AND WITHOUT WATER
    switch (data.timeSeries[time].parameters[18].values[0]) {
        case 1:
            symbol = "sun"
            break;
        case 2:
            symbol = "sun"
            break;
        case 3:
            symbol = "cloudy"
            break;
        case 4:
            symbol = "cloudy"
            break;
        case 5:
            symbol = "bad-weather"
            break;
        case 6:
            symbol = "bad-weather"
            break;
        case 7:
            symbol = "fog"
            break;
        case 8:
            symbol = "rain"
            break;
        case 9:
            symbol = "rain"
            break;
        case 10:
            symbol = "rain"
            break;
        case 11:
            symbol = "thunder"
            break;
        case 18:
            symbol = "rain"
            break;
        case 19:
            symbol = "rain"
            break;
        case 20:
            symbol = "rain"
            break;
        case 21:
            symbol = "thunder"
            break;
        default:
            symbol = "sun";
            console.log("DEFAULTED DUE TO NEW WEATHER FORMAT OR LAZY IMPLEMENTATION");
            break;
    }
    return symbol;
}

//lightning animation
function animationTime() {
    var duration = Math.floor(Math.random() * 3);
    if (duration == 0) {duration = 1};
    for (let index = 0; index < lightning.length; index++) {
        lightning[index].style.setProperty('--lightning-time', duration + 's');
    }
}

//revs engine
window.onload = function() {
    start();

    //setup for animation of lightning element
    lightning = document.getElementsByClassName("lightning");
    setInterval(animationTime, 3000);
};