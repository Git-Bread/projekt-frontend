window.onload = async function start() {
    let head = document.getElementById("weatherHeader");
    head.append(document.getElementById("cloudy"));
    await load();
}

async function load() {
    let val = await fetch("GET", "/api/category/pmp3g/version/2/parameter.json");
    console.log(val);
}