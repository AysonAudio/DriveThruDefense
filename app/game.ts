// ##################################################################### //
// ############################# File Paths ############################ //
// ##################################################################### //

const GameTex = {
    prefix: "../vendor/kenney_tiny-battle/tile_",
    suffix: ".png",
} as const;

// ##################################################################### //
// ########################## Helper Functions ######################### //
// ##################################################################### //

/**
 * @param min Inclusive.
 * @param max Exclusive.
 */

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}

// ##################################################################### //
// ########################### User Interface ########################## //
// ##################################################################### //

const Battlefield = {
    Elem: document.body.querySelector("#Battlefield.Elem") as HTMLElement,
    Width: 16,
    Height: 16,
    Tex: ["0000", "0001", "0002"],
} as const;

// Use CSS Grid to position tiles.
Battlefield.Elem.style.display = "grid";
Battlefield.Elem.style.gridTemplateRows = `repeat(${Battlefield.Height}, 1fr)`;
Battlefield.Elem.style.gridTemplateColumns = `repeat(${Battlefield.Width}, 1fr)`;

// Generate random art tiles.
for (let i = 0; i < Battlefield.Width * Battlefield.Height; i++) {
    const newTile = Battlefield.Elem.appendChild(document.createElement("div"));
    const tex = Battlefield.Tex[getRandomInt(0, Battlefield.Tex.length)];

    // Crop and scale tile sprite.
    newTile.style.backgroundImage = `url("${GameTex.prefix}${tex}${GameTex.suffix}")`;
    newTile.style.backgroundRepeat = "no-repeat";
    newTile.style.backgroundSize = "100% 100%";
}

// ##################################################################### //
// ########################### Enemy Spawning ########################## //
// ##################################################################### //

type Enemy = { elem: HTMLDivElement; x: number; y: number };

const enemyWidth = 2;
const enemyHeight = 2;
const maxEnemies = 15;
const enemies: Enemy[] = [];

// Spawn an enemy every 1000 ms.
setInterval(() => {
    let newEnemy: Enemy;

    if (enemies.length > maxEnemies) return;

    newEnemy = {
        elem: document.body.appendChild(document.createElement("div")),
        x: getRandomInt(15, 86),
        y: getRandomInt(15, 86),
    };
    enemies.push(newEnemy);

    newEnemy.elem.style.backgroundColor = "darkgreen";

    newEnemy.elem.style.width = enemyWidth.toString() + "vw";
    newEnemy.elem.style.height = enemyHeight.toString() + "vh";

    newEnemy.elem.style.position = "absolute";
    newEnemy.elem.style.left = newEnemy.x.toString() + "vw";
    newEnemy.elem.style.top = newEnemy.y.toString() + "vh";

    // Set sprite origin to center instead of top left.
    newEnemy.elem.style.transform = "translate(-50%, -50%)";
}, 1000);

// ##################################################################### //
// ############################### Combat ############################## //
// ##################################################################### //

const car = document.body.querySelector("#car") as HTMLElement;
let carX = 0;
let carY = 95;

car.style.position = "absolute";
car.style.top = carY.toString() + "vh";
car.style.left = "40vw";

// Crop and scale tile sprite.
car.style.backgroundImage = `url("${GameTex.prefix}0167${GameTex.suffix}")`;
car.style.backgroundRepeat = "no-repeat";
car.style.backgroundSize = "100% 100%";

// Set sprite origin to center instead of top left.
car.style.transform = "translate(-50%, -50%) rotate(270deg)";

// CAR GO VROOM.
setInterval(() => {
    if (--carY < 0) carY = 100;
    car.style.top = carY.toString() + "vh";

    // Check enemy collision
    for (const enemy of enemies) {
        if (carX > enemy.x - enemyWidth) {
        }
    }
}, 10);

// Align car horizontal position with mouse, but not vertical.
document.addEventListener("mousemove", (event) => {
    carX = event.clientX;
    car.style.left = carX.toString() + "px";
});
