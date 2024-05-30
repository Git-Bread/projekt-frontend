import {currentTemprature, currentTime, currentWeatherSymbol} from "../javascript/current-values.js";
import {populate, cleanup} from "../javascript/text-handling.js";
import {maps} from "../javascript/map.js";


//a few global variables for ease of acess
let lightning;
const dateObject = new Date();
let baseSpot = [62.39129, 17.3063];

//runs the whole packet, reruns on location swap
async function start(firstRun) {
    //variables
    let head = document.getElementById("weatherHeader");
    let location = baseSpot;

    //time format for api, for api restrictions and format visit https://opendata.smhi.se/apidocs/metfcst/get-forecast.html (2024-05-30)
    let month = dateObject.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let hours = dateObject.getHours();
    if (hours < 10) {
        hours = "0" + hours;
    }
    hours = hours + "0000Z";

    //finalised time format
    let time = dateObject.getFullYear() + month + dateObject.getDate() + "T" + hours;

    //urls for diffrent fetches, a location fetch, and a point fetch working togheter with a temprature fetch to assign temprature values on coordinates
    let locationFetch = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/" + location[1] + "/lat/" + location[0] + "/data.json";
    let multipoint = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint.json?downsample=40";
    let multipointTemp = "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/multipoint/validtime/" + time + "/parameter/t/leveltype/hl/level/2/data.json?with-geo=false&downsample=40";

    //awaits
    let data = await getData(locationFetch);
    let multipointData = await getData(multipoint)
    let multipointDataTemp = await getData(multipointTemp)

    //cleanup for search, removes old data
    cleanup();

    //current time needed for proper api usage
    let currentPos = currentTime(data);

    //copies icon from hidden element, probaly better to have it like some loose file somewhere but graphic design and "acessability" was part of the task so keeping it in raw code
    head.append(document.getElementsByClassName(currentWeatherSymbol(data, currentPos))[0].cloneNode(true));

    //adds the current temprature to the header
    let text = document.createElement("p");
    text.innerHTML = "&#8451; " + currentTemprature(data, currentPos);
    head.append(text)

    //populate main box with data
    let box = document.getElementById("currentWeather");
    populate(data, 3, box, true, currentPos);

    //generates map
    if (firstRun) {
        maps(location, multipointData, multipointDataTemp);
        firstRun = false;   
    }
}

//"workhorse" getter for contacting SMHI api to get all weather stuff
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
        console.log("yep");
    }
}

//lightning animation, animates the lightning element to have a random timer for animation with a maximum of 3 seconds
function animationTime() {
    var duration = Math.floor(Math.random() * 3);
    if (duration == 0) { duration = 1 };
    for (let index = 0; index < lightning.length; index++) {
        lightning[index].style.setProperty('--lightning-time', duration + 's');
    }
}


//startup for all script
window.onload = function() {
    //all the action
    start(true);

    //setup for animation of "lightning" element
    lightning = document.getElementsByClassName("lightning");
    setInterval(animationTime, 3000);
};

export {baseSpot, start};