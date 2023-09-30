// ##################################################################### //
// ########################## Config Constants ######################### //
// ##################################################################### //

const PlayerConfig = {
    moveTimeMS: 10,
};

const TextureConfig = {
    Prefix: "../vendor/kenney_tiny-battle/tile_",
    Suffix: ".png",
} as const;

const BattlefieldConfig = {
    cols: 16,
    rows: 16,
    textureIDs: ["0000", "0001", "0002"],
} as const;

const EnemyConfig = {
    widthVW: 4,
    heightVH: 4,
    maxSpawns: 15,
    spawnTimeMS: 1000,
} as const;

const PickupConfig = {
    widthVW: 4,
    heightVH: 4,
    spawnTimeMS: 2000,
    shopChance: 0.4,
} as const;

const PickupTypes = {
    shop: "shop",
} as const;

// ##################################################################### //
// ############################### Types ############################### //
// ##################################################################### //

type Entity = { elem: HTMLDivElement; xVW: number; yVH: number };

type Enemy = Entity & {};

type PickupType = (typeof PickupTypes)[keyof typeof PickupTypes];
type Pickup = Entity & { type: PickupType };

/** All global game variables to cache when the game is loaded. */
type GameCache = {
    battlefieldElem: HTMLDivElement;
    playerElem: HTMLDivElement;
    playerLocation: { xVW: number; yVH: number };
    enemies: Enemy[];
    pickups: Pickup[];
    goldCounterElem: HTMLSpanElement;
};

/** A function that needs access to a global game variable. */
type GameFunc<Return> = (cache: GameCache) => Return;

// ##################################################################### //
// ########################## Helper Functions ######################### //
// ##################################################################### //

/**
 * A decorator factory.
 * Manages one global {@link GameCache} object and passes it to functions.
 */

const GAME: <Return>(func: GameFunc<Return>) => () => Return = (() => {
    const globalGameCache: GameCache = {
        battlefieldElem: document.body.querySelector("#battlefield"),
        playerElem: document.body.querySelector("#car"),
        playerLocation: { xVW: 0, yVH: 0 },
        pickups: [],
        enemies: [],
        goldCounterElem: document.body.querySelector("#gold-counter"),
    };

    return (func) => {
        return () => func(globalGameCache);
    };
})();

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
// ################################# UI ################################ //
// ##################################################################### //

/**
 * Create the area with player and enemies.
 */

export const initBattlefield: () => void = GAME((cache: GameCache) => {
    // Use CSS Grid to position tiles.
    cache.battlefieldElem.style.display = "grid";
    cache.battlefieldElem.style.gridTemplateRows =
        "repeat(" + BattlefieldConfig.rows.toString() + ", 1fr)";
    cache.battlefieldElem.style.gridTemplateColumns =
        "repeat(" + BattlefieldConfig.cols.toString() + ", 1fr)";

    // Fill grid with tiles having randomized sprites.
    for (let i = 0; i < BattlefieldConfig.cols * BattlefieldConfig.rows; i++) {
        const newTile = cache.battlefieldElem.appendChild(
            document.createElement("div")
        );
        const textureID =
            BattlefieldConfig.textureIDs[
                getRandomInt(0, BattlefieldConfig.textureIDs.length)
            ];

        // Set sprite.
        newTile.style.backgroundImage =
            'url("' +
            TextureConfig.Prefix +
            textureID +
            TextureConfig.Suffix +
            '")';

        // Crop and scale sprite.
        newTile.style.backgroundRepeat = "no-repeat";
        newTile.style.backgroundSize = "100% 100%";
    }

    // Hide cursor over battlefield.
    cache.battlefieldElem.style.cursor = "none";
});

// ##################################################################### //
// ############################### Spawns ############################## //
// ##################################################################### //

/**
 * Spawn an enemy or pickup.
 */

function spawnEntity({
    bgCSS,
    widthVW,
    heightVH,
}: {
    bgCSS: string;
    widthVW: number;
    heightVH: number;
}): Entity {
    let newEntity: Entity = {
        elem: document.body.appendChild(document.createElement("div")),
        xVW: getRandomInt(15, 86),
        yVH: getRandomInt(15, 86),
    };

    // Set appearance.
    newEntity.elem.style.background = bgCSS;
    newEntity.elem.style.width = widthVW.toString() + "vw";
    newEntity.elem.style.height = heightVH.toString() + "vh";

    // Set sprite origin to center, instead of top left.
    newEntity.elem.style.transform = "translate(-50%, -50%)";

    // Set position.
    newEntity.elem.style.position = "absolute";
    newEntity.elem.style.left = newEntity.xVW.toString() + "vw";
    newEntity.elem.style.top = newEntity.yVH.toString() + "vh";

    // Hide cursor over entity.
    newEntity.elem.style.cursor = "none";

    return newEntity;
}

/**
 * Spawn an enemy periodically.
 */

export const initEnemySpawner: () => void = GAME((cache: GameCache) => {
    setInterval(() => {
        if (cache.enemies.length >= EnemyConfig.maxSpawns) return;

        let newEnemy: Enemy = spawnEntity({
            bgCSS: "darkgreen",
            widthVW: EnemyConfig.widthVW,
            heightVH: EnemyConfig.heightVH,
        });
        cache.enemies.push(newEnemy);
    }, EnemyConfig.spawnTimeMS);
});

/**
 * Spawn a pickup periodically.
 * List of pickups:
 * - Shop: Teleport to shop level.
 */

export const initPickupSpawner: () => void = GAME((cache: GameCache) => {
    setInterval(() => {
        const pickupTypes = Object.keys(PickupTypes) as PickupType[];
        let newPickup: Pickup = {
            ...spawnEntity({
                bgCSS: "almond",
                widthVW: PickupConfig.widthVW,
                heightVH: PickupConfig.heightVH,
            }),
            type: pickupTypes[getRandomInt(0, pickupTypes.length)],
        };
        cache.pickups.push(newPickup);

        // Depending on pickup type, do stuff when player collides.
        switch (newPickup.type) {
            case "shop":
        }
    });
});

// ##################################################################### //
// ######################### Player Controller ######################### //
// ##################################################################### //

/**
 * Create player controller.
 * Car drives up forever. Loops around to bottom.
 * Kills enemies on collision.
 */

export const initPlayer: () => void = GAME((cache: GameCache) => {
    // Set position.
    cache.playerElem.style.position = "absolute";
    cache.playerElem.style.left = cache.playerLocation.xVW.toString() + "vw";
    cache.playerElem.style.top = cache.playerLocation.yVH.toString() + "vh";

    // Set sprite.
    cache.playerElem.style.backgroundImage =
        'url("' + TextureConfig.Prefix + "0167" + TextureConfig.Suffix + '")';

    // Crop and scale sprite.
    cache.playerElem.style.backgroundRepeat = "no-repeat";
    cache.playerElem.style.backgroundSize = "100% 100%";

    // Set sprite origin to center, instead of top left.
    cache.playerElem.style.transform = "translate(-50%, -50%) rotate(270deg)";

    // CAR GO VROOM (vertically).
    setInterval(() => {
        if (--cache.playerLocation.yVH < 0) cache.playerLocation.yVH = 100;
        cache.playerElem.style.top = cache.playerLocation.yVH.toString() + "vh";
    }, 10);

    // Bind player horizontal position to mouse.
    document.addEventListener("mousemove", (event) => {
        cache.playerLocation.xVW = pxToVW(event.clientX);
        cache.playerElem.style.left =
            cache.playerLocation.xVW.toString() + "vw";
    });

    // Kill enemies that collide with player.
    setInterval(() => {
        cache.enemies?.forEach((enemy, index) => {
            if (
                cache.playerLocation.xVW > enemy.xVW - PickupConfig.widthVW &&
                cache.playerLocation.xVW < enemy.xVW + EnemyConfig.widthVW &&
                cache.playerLocation.yVH > enemy.yVH - EnemyConfig.heightVH &&
                cache.playerLocation.yVH < enemy.yVH + EnemyConfig.heightVH
            ) {
                enemy.elem.remove();

                // Update array without breaking iterator.
                cache.enemies[index] = undefined;

                // +1 gold per kill
                let gold = Number(cache.goldCounterElem.innerHTML);
                cache.goldCounterElem.innerHTML = (++gold).toString();
            }
        });

        // Remove empty spots in array.
        cache.enemies = cache.enemies.filter(Boolean);
    }, PlayerConfig.moveTimeMS);

    // Hide cursor over car.
    cache.playerElem.style.cursor = "none";
});
