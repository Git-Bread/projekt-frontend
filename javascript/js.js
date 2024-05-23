var lightning;
window.onload = async function start() {
    let head = document.getElementById("weatherHeader");
    let data = await getData();
    head.append(document.getElementById(currentWeatherSymbol(data)));
    let text = document.createElement("p");
    text.innerHTML = "&#8451; " + currentTemprature(data);
    head.append(text)


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