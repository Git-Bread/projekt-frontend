let data;

window.onload = async function start() {
    let head = document.getElementById("weatherHeader");
    head.append(document.getElementById("cloudy"));
    data = await getData();
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