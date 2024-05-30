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

//gets current time based of date object
function currentTime(data) {
    let target = dateObject.getHours() + ":00";

    //in case value is lower than double digit
    if (target.length < 5) {
        target = "0" + target;
    }

    for (let index = 0; index < data.timeSeries.length; index++) {
        //readable time string without excess T
        var time = data.timeSeries[index].validTime.split('T');

        //removes time post HH-MM (hours-minutes)
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
    //THUNDER WITH AND WITHOUT RAIN
    //switch values based of SMHI api, imperfect due to lack of symbols created for this assignment
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