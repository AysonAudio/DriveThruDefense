
const texPrefix = "../vendor/kenney_tiny-battle/tile_";
const texSuffix = ".png";

// ##################################################################### //
// ########################## Helper Functions ######################### //
// ##################################################################### //

/**
 * @param min Inclusive
 * @param max Exclusive
 */
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}



// ##################################################################### //
// ########################### User Interface ########################## //
// ##################################################################### //

const battlefield: HTMLElement = document.body.querySelector("#battlefield");
const battlefieldWidth = 16;
const battlefieldHeight = 16;
const battlefieldTex = ["0000", "0001", "0002"];

// Setup battlefield
battlefield.style.display = "grid";
battlefield.style.gridTemplateRows = `repeat(${battlefieldHeight}, 1fr)`;
battlefield.style.gridTemplateColumns = `repeat(${battlefieldWidth}, 1fr)`;

// Generate random battlefield tiles
for (let i = 0; i < battlefieldWidth * battlefieldHeight; i++) {
    const newTile = battlefield.appendChild(document.createElement("div"));
    const tex = battlefieldTex[getRandomInt(0, battlefieldTex.length)];
    newTile.style.backgroundImage = `url("${texPrefix}${tex}${texSuffix}")`;
    newTile.style.backgroundRepeat = "no-repeat";
    newTile.style.backgroundSize = "100% 100%";
}



// ##################################################################### //
// ############################### Combat ############################## //
// ##################################################################### //

const car: HTMLElement = document.body.querySelector("#car");
car.style.backgroundImage = `url("${texPrefix}0167${texSuffix}")`;
car.style.backgroundImage = "no-repeat";
car.style.backgroundSize = "100% 100%";
car.style.transform = "translate(-50%, -50%) rotate(270deg)";
car.style.position = "absolute";

let carX = 0;
let carY = 95;
car.style.top = carY.toString() + "vh";
car.style.left = "40vw";

setInterval(() => {
    if (--carY < 0) carY = 100;
    car.style.top = carY.toString() + "vh";
}, 10);

document.addEventListener("mousemove", (event) => {
    carX = event.clientX;
    car.style.left = carX.toString() + "px";
})
