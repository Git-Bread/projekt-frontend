var lightning;
window.onload = async function start() {
    let head = document.getElementById("weatherHeader");
    let data = await getData();
    head.append(document.getElementById(currentWeatherSymbol(data)));
    let text = document.createElement("p");
    text.innerHTML = "&#8451; " + currentTemprature(data);
    head.append(text)
    let box = document.getElementById("currentWeather");
    populate(data, 2, box, true);

    lightning = document.getElementsByClassName("lightning");
}

async function getData() {  
    try {
        let rawData = await fetch("https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/16/lat/58/data.json");
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
function currentTemprature(data) {
    let temp = data.timeSeries[0].parameters[0].values[0]
    return temp;
}

//populates object with info based on a set of data, a cap of amount of days in case of smaller, and an object to populate with said data, and headline if that is wanted
function populate(data, cap, box, headline) {
    let date;
    let runtime = 0;

    //loop through all data
    for (let index = 0; index < data.timeSeries.length; index++) {
        //only get for today and tomorow
        if (runtime == cap) {
            continue;
        }

        //overall container for a block
        let container = document.createElement("div");
        container.setAttribute("id", "weatherList");

        //create index for later pushing
        let info = [];

        //populating index with values
        for (let index = 0; index < 5; index++) {
            let container = document.createElement("p");
            if (index != 0) {
                container.setAttribute("class", "extra");   
            }
            info.push(container)
        }

        //readable time array without excess T
        var time = data.timeSeries[index].validTime.split('T');

        //overlay for days
        if (headline) {
            if (!date | date != time[0]) {
                if (!date) {
                    box.append(document.createElement("h3").innerHTML = "Idag, " + getDay(0))
                }
                else {
                    box.append(document.createElement("h3").innerHTML = "Imorn, " + getDay(1));
                }
                date = time[0];
                runtime++;
            }   
        }

        //removes time post HH-MM
        time[1] = time[1].substring(0, time[1].length - 4);

        //populating info array
        info[0].innerHTML = "Tid: " + time[1];
        info[1].innerHTML = "Temperatur: " + data.timeSeries[index].parameters[0].values[0] + " &#8451;";
        info[2].innerHTML = "Vindhastighet: " + data.timeSeries[index].parameters[4].values[0] + " m/s";
        info[3].innerHTML = "Nederbörd: " + data.timeSeries[index].parameters[12].values[0] + " - " + data.timeSeries[index].parameters[13].values[0] + " mm/h";
        info[4].innerHTML = "Humiditet: " + data.timeSeries[index].parameters[5].values[0] + "%";

        //populating container
        for (let index = 0; index < info.length; index++) {
            container.append(info[index]);
        }

        //push container content into box
        box.append(container);
    }
}

//returns day based of current day and extra integer
function getDay(extraVal) {
    const date = new Date();
    let day = date.getDay();
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
function currentWeatherSymbol(data) {
    let symbol;
    ///TODO IF PERFECT
    //SNOW
    //THUNDER WITH AND WITHOUT WATER
    switch (data.timeSeries[0].parameters[18].values[0]) {
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
    return symbol + "-icon";
}

//lightning animation
function animationTime() {
    var duration = Math.floor(Math.random() * 3);
    if (duration == 0) {duration = 1};
    for (let index = 0; index < lightning.length; index++) {
        lightning[index].style.setProperty('--lightning-time', duration + 's');
    }
}

setInterval(animationTime, 3000);