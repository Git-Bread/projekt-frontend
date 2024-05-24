let lightning;
const dateObject = new Date();


async function start() {
    let head = document.getElementById("weatherHeader");

    let location = [17.3063, 62.39129];
    let data = await getData(location);

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

    //setup for animation of lightning element
    lightning = document.getElementsByClassName("lightning");
    setInterval(animationTime, 3000);
}

async function getData(location) {
    console.log(location);
    try {
        let rawData = await fetch("http://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/" + location[0] + "/lat/" + location[1] +"/data.json");
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

//gets current temprature based of earliest time gotten from api
function currentTemprature(data, time) {
    let temp
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

    //loop through all data, 28 hours worth of display
    for (let index = 0; index < 28; index++) {

        //overall container for a block
        let container = document.createElement("div");
        container.setAttribute("id", "weatherList");

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

        //inconsistent position of temprature data forces this brutish solution
        for (let i = 0; i < data.timeSeries[index].parameters.length; i++) {
            if (data.timeSeries[index].parameters[i].name == "t") {
                info[1].innerHTML = "Temperatur: " + data.timeSeries[index].parameters[i].values[0] + " &#8451;";
            }
        }

        //generall adds
        info[2].innerHTML = "Vindhastighet: " + data.timeSeries[index].parameters[4].values[0] + " m/s";
        info[3].innerHTML = "Nederbörd: " + data.timeSeries[index].parameters[12].values[0] + " - " + data.timeSeries[index].parameters[13].values[0] + " mm/h";
        info[4].innerHTML = "Humiditet: " + data.timeSeries[index].parameters[5].values[0] + "%";

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
}

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

window.onload = function() {
    start();
};