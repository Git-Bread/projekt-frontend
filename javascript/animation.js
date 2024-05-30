//lightning animation, animates the lightning element to have a random timer for animation with a maximum of 3 seconds
function animationTime() {
    var duration = Math.floor(Math.random() * 3);
    if (duration == 0) { duration = 1 };
    for (let index = 0; index < lightning.length; index++) {
        lightning[index].style.setProperty('--lightning-time', duration + 's');
    }
}