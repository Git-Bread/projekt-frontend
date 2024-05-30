import {getDay, currentWeatherSymbol} from "../javascript/current-values.js";

//gets all information containers and cleans them out
function cleanup() {
    let box = document.getElementById("currentWeather");
    while (box.firstElementChild) {
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

//changes part of the page title based of location
function changeTitle(val) {
    let value = val[0].toUpperCase() + val.substring(1);
    document.getElementById("titleName").innerHTML = value;
}

//populates object with info based on a set of data, a cap of amount of days in case of smaller, and an object to populate with said data, and headline if that is wanted.
//current pos to mark current time period, kinda nice.
function populate(data, cap, box, headline, currentPos) {
    let date;
    let runtime = 0;

    //loop through all data within 28 hours from earliest time fetched
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

        //overlay for days, displays "today" and "tomorow" times, could probaly be improved with a "heavier" loop based of time parameter of api response
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

        //removes time post HH-MM (hours-minutes)
        time[1] = time[1].substring(0, time[1].length - 4);

        //populating info array
        info[0].innerHTML = "Tid: " + time[1];

        //inconsistent positions of returns in api (first time seeing that) forces me to dubble check the names before adding them.. whooo recursion
        //cant use static positions due to before mentioned randomness
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

        //contaner box
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

    //loops through ALL of the api response
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

export {populate, cleanup, changeTitle};