// ##################################################################### //
// ############################# File Paths ############################ //
// ##################################################################### //

const GameTexture = {
    Prefix: "../vendor/kenney_tiny-battle/tile_",
    Suffix: ".png",
} as const;

// ##################################################################### //
// ########################## Helper Functions ######################### //
// ##################################################################### //

/**
 * @param min Inclusive.
 * @param max Exclusive.
 */

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}

function pxToVW(px: number): number {
    return (px / document.body.clientWidth) * 100;
}

function pxToVH(px: number): number {
    return (px / document.body.clientHeight) * 100;
}

// ##################################################################### //
// ########################### User Interface ########################## //
// ##################################################################### //

const BattlefieldConfig = {
    cols: 16,
    rows: 16,
    textureIDs: ["0000", "0001", "0002"],
} as const;

const battlefieldElem: HTMLElement =
    document.body.querySelector("#battlefield");

// Use CSS Grid to position tiles.
battlefieldElem.style.display = "grid";
battlefieldElem.style.gridTemplateRows =
    "repeat(" + BattlefieldConfig.rows.toString() + "1fr)";
battlefieldElem.style.gridTemplateColumns =
    "repeat(" + BattlefieldConfig.cols.toString() + "1fr)";

// Fill grid with tiles having randomized sprites.
for (let i = 0; i < BattlefieldConfig.cols * BattlefieldConfig.rows; i++) {
    const newTile = battlefieldElem.appendChild(document.createElement("div"));
    const textureID =
        BattlefieldConfig.textureIDs[
            getRandomInt(0, BattlefieldConfig.textureIDs.length)
        ];

    // Set sprite.
    newTile.style.backgroundImage =
        'url("' + GameTexture.Prefix + textureID + GameTexture.Suffix + '")';

    // Crop and scale sprite.
    newTile.style.backgroundRepeat = "no-repeat";
    newTile.style.backgroundSize = "100% 100%";
}

// ##################################################################### //
// ########################## Enemy Management ######################### //
// ##################################################################### //

type Enemy = { uid: number; elem: HTMLDivElement; xVW: number; yVH: number };

const EnemyConfig = {
    widthVW: 4,
    heightVH: 4,
    maxSpawns: 15,
} as const;

let enemies: Enemy[] = [];

// Spawn an enemy every 1000 ms.
setInterval(() => {
    let newEnemy: Enemy = {
        uid: enemies.length,
        elem: document.body.appendChild(document.createElement("div")),
        xVW: getRandomInt(15, 86),
        yVH: getRandomInt(15, 86),
    };
    enemies.push(newEnemy);

    // Prevent spawning more than max.
    if (enemies.length >= EnemyConfig.maxSpawns) return;

    // Set appearance.
    newEnemy.elem.style.backgroundColor = "darkgreen";
    newEnemy.elem.style.width = EnemyConfig.widthVW.toString() + "vw";
    newEnemy.elem.style.height = EnemyConfig.heightVH.toString() + "vh";

    // Set sprite origin to center, instead of top left.
    newEnemy.elem.style.transform = "translate(-50%, -50%)";

    // Set position.
    newEnemy.elem.style.position = "absolute";
    newEnemy.elem.style.left = newEnemy.xVW.toString() + "vw";
    newEnemy.elem.style.top = newEnemy.yVH.toString() + "vh";
}, 1000);

// ##################################################################### //
// ######################### Player Controller ######################### //
// ##################################################################### //

const playerElem = document.body.querySelector("#car") as HTMLElement;
let playerPoint: { xVW: number; yVH: number } = { xVW: 0, yVH: 0 };

// Set position.
playerElem.style.position = "absolute";
playerElem.style.left = playerPoint.xVW.toString() + "vw";
playerElem.style.top = playerPoint.yVH.toString() + "vh";

// Set sprite.
playerElem.style.backgroundImage =
    'url("' + GameTexture.Prefix + "0167" + GameTexture.Suffix + '")';

// Crop and scale sprite.
playerElem.style.backgroundRepeat = "no-repeat";
playerElem.style.backgroundSize = "100% 100%";

// Set sprite origin to center, instead of top left.
playerElem.style.transform = "translate(-50%, -50%) rotate(270deg)";

// CAR GO VROOM (vertically).
setInterval(() => {
    if (--playerPoint.yVH < 0) playerPoint.yVH = 100;
    playerElem.style.top = playerPoint.yVH.toString() + "vh";
}, 10);

// Bind player horizontal position to mouse.
document.addEventListener("mousemove", (event) => {
    playerPoint.xVW = pxToVW(event.clientX);
    playerElem.style.left = playerPoint.xVW.toString() + "vw";
});

// Kill enemies that collide with player.
setInterval(() => {
    enemies.forEach((enemy, index) => {
        if (
            playerPoint.xVW > enemy.xVW - EnemyConfig.widthVW &&
            playerPoint.xVW < enemy.xVW + EnemyConfig.widthVW &&
            playerPoint.yVH > enemy.yVH - EnemyConfig.heightVH &&
            playerPoint.yVH < enemy.yVH + EnemyConfig.heightVH
        ) {
            enemy.elem.remove();

            // Update array without breaking iterator.
            enemies[index] = undefined;
        }

        // Remove empty spots in array
        enemies = enemies.filter(Boolean);
    });
}, 10);
