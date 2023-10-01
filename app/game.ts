// ##################################################################### //
// ########################## Config Constants ######################### //
// ##################################################################### //

const TextureConfig = {
    Prefix: "../vendor/kenney_tiny-battle/tile_",
    Suffix: ".png",
} as const;

// ------------------------ //

const CarConfig = {
    moveTimeMS: 10,
};

const EnemyConfig = {
    widthVW: 4,
    heightVH: 4,
    spawnCap: 15,
    spawnTimeMS: 1000,
} as const;

const PickupConfig = {
    widthVW: 4,
    heightVH: 4,
    spawnTimeMS: 2000,
    spawnChances: {
        shop: 0.4,
    },
    spawnCaps: {
        shop: 1,
    },
    bgCSS: {
        shop: "yellow",
    },
} as const;

// -------- Levels -------- //

const MeadowConfig = {
    cols: 16,
    rows: 16,
    textureIDs: ["0000", "0001", "0002"],
} as const;

// ##################################################################### //
// ############################### Enums ############################### //
// ##################################################################### //

const PickupTypes = {
    shop: "shop",
} as const;

const Levels = {
    meadow: "meadow",
    shop: "shop",
} as const;

// ##################################################################### //
// ############################### Types ############################### //
// ##################################################################### //

type Entity = { elem: HTMLDivElement; xVW: number; yVH: number };

type Enemy = Entity & {};

type PickupType = (typeof PickupTypes)[keyof typeof PickupTypes];
type Pickup = Entity & { type: PickupType };

type LevelName = (typeof Levels)[keyof typeof Levels];

/** All global game variables to cache when the game is loaded. */
type GameCache = {
    levelsParentElem: HTMLDivElement;
    levelMeadowElem: HTMLDivElement;
    levelShopElem: HTMLDivElement;
    uiGoldElem: HTMLSpanElement;
    enemiesParentElem: HTMLDivElement;
    pickupsParentElem: HTMLDivElement;
    carElem: HTMLDivElement;

    level: LevelName;
    enemies: Enemy[];
    pickups: Pickup[];
    pickupCounts: {
        [key in PickupType]: number;
    };
    carLocation: { xVW: number; yVH: number };
};

/** A function that needs access to a global game variable. */
type GameFunc<Return> = (cache: GameCache, ...args) => Return;

// ##################################################################### //
// ########################## Helper Functions ######################### //
// ##################################################################### //

/**
 * A decorator factory.
 * Manages one global {@link GameCache} object and passes it to functions.
 */

const GAME: <Return>(func: GameFunc<Return>) => (...args) => Return = (() => {
    const globalGameCache: GameCache = {
        levelsParentElem: document.body.querySelector("#levels"),
        levelMeadowElem: document.body.querySelector("#levels > #meadow"),
        levelShopElem: document.body.querySelector("#levels > #shop"),
        uiGoldElem: document.body.querySelector("#gold > .counter"),
        enemiesParentElem: document.body.querySelector("#entities > #enemies"),
        pickupsParentElem: document.body.querySelector("#entities > #pickups"),
        carElem: document.body.querySelector("#car"),

        level: "meadow",
        carLocation: { xVW: 0, yVH: 0 },
        enemies: [],
        pickups: [],
        pickupCounts: {
            shop: 0,
        },
    };

    return (func) => {
        return (...args) => func(globalGameCache, ...args);
    };
})();

// ------------------------

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
// ############################### Levels ############################## //
// ##################################################################### //

/**
 * Switch to a level.
 * Each level is a div in #levels.
 * Toggles .off class to switch levels.
 */

const switchLevel: (levelName: LevelName) => void = GAME(
    (cache: GameCache, levelName: LevelName) => {
        cache.level = levelName;

        // Unhide active level. Hide all other levels.
        for (const levelElem of cache.levelsParentElem.children) {
            if (levelElem.id == levelName) levelElem.classList.remove("off");
            else levelElem.classList.add("off");
        }

        // Hide enemies and pickups if not meadow.
        if (levelName != "meadow") {
            cache.enemiesParentElem.classList.add("off");
            cache.pickupsParentElem.classList.add("off");
        } else {
            cache.enemiesParentElem.classList.remove("off");
            cache.pickupsParentElem.classList.remove("off");
        }
    }
);

/**
 * Create the main combat level.
 */

export const initMeadowLevel: () => void = GAME((cache: GameCache) => {
    // Use CSS Grid to position tiles.
    cache.levelMeadowElem.style.display = "grid";
    cache.levelMeadowElem.style.gridTemplateRows =
        "repeat(" + MeadowConfig.rows.toString() + ", 1fr)";
    cache.levelMeadowElem.style.gridTemplateColumns =
        "repeat(" + MeadowConfig.cols.toString() + ", 1fr)";

    // Fill grid with tiles having randomized sprites.
    for (let i = 0; i < MeadowConfig.cols * MeadowConfig.rows; i++) {
        const newTile = cache.levelMeadowElem.appendChild(
            document.createElement("div")
        );
        const textureID =
            MeadowConfig.textureIDs[
                getRandomInt(0, MeadowConfig.textureIDs.length)
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
});

/**
 * Create the level where car spends gold on upgrades.
 * Switch to this level when car hits a shop pickup.
 */

export const initShop: () => void = GAME((cache: GameCache) => {});

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

    return newEntity;
}

/**
 * Spawn an enemy periodically on meadow level.
 */

export const initEnemySpawner: () => void = GAME((cache: GameCache) => {
    setInterval(() => {
        if (cache.level != "meadow") return;
        if (cache.enemies.length >= EnemyConfig.spawnCap) return;

        let newEnemy: Enemy = spawnEntity({
            bgCSS: "darkgreen",
            widthVW: EnemyConfig.widthVW,
            heightVH: EnemyConfig.heightVH,
        });

        cache.enemies.push(newEnemy);
        cache.enemiesParentElem.appendChild(newEnemy.elem);
    }, EnemyConfig.spawnTimeMS);
});

/**
 * Spawn a pickup periodically.
 * List of pickups:
 * - Shop: Teleport to shop level.
 */

export const initPickupSpawner: () => void = GAME((cache: GameCache) => {
    const pickupTypes = Object.keys(PickupTypes) as PickupType[];
    let pickupChances = { ...PickupConfig.spawnChances };
    let totalChance = 0;

    // Scale chances to 1.0.
    for (const key in pickupChances) totalChance += pickupChances[key];
    for (const key in pickupChances) pickupChances[key] /= totalChance;

    // Spawn pickups on a loop.
    setInterval(
        (totalChance: number) => {
            let diceRoll = Math.random();
            let pickupType: PickupType;
            let newPickup: Pickup;

            // Roll random type.
            for (const key in pickupChances) {
                // Match dice roll with corresponding pickup type.
                if ((totalChance -= pickupChances[key]) > diceRoll) continue;
                // That pickup already maxed. Reroll.
                if (cache.pickupCounts[key] >= PickupConfig.spawnCaps[key])
                    continue;
                // Dont spawn shop pickups on shop level. Reroll.
                if (key == "shop" && cache.level == "shop") continue;

                // Valid roll found.
                pickupType = PickupTypes[key];
            }

            // No valid rolls found.
            if (!pickupType) return;

            // Spawn a new entity.
            newPickup = {
                ...spawnEntity({
                    bgCSS: "yellow",
                    widthVW: PickupConfig.widthVW,
                    heightVH: PickupConfig.heightVH,
                }),
                type: pickupType,
            };
            cache.pickups.push(newPickup);
            cache.pickupsParentElem.appendChild(newPickup.elem);
            cache.pickupCounts[pickupType]++;
        },

        PickupConfig.spawnTimeMS,
        totalChance
    );
});

// ##################################################################### //
// ######################### Player Controller ######################### //
// ##################################################################### //

/**
 * Create player controller.
 * Car drives up forever. Loops around to bottom.
 * Kills enemies on collision.
 */

export const initCar: () => void = GAME((cache: GameCache) => {
    // Set position.
    cache.carElem.style.position = "absolute";
    cache.carElem.style.left = cache.carLocation.xVW.toString() + "vw";
    cache.carElem.style.top = cache.carLocation.yVH.toString() + "vh";

    // Set sprite.
    cache.carElem.style.backgroundImage =
        'url("' + TextureConfig.Prefix + "0167" + TextureConfig.Suffix + '")';

    // Crop and scale sprite.
    cache.carElem.style.backgroundRepeat = "no-repeat";
    cache.carElem.style.backgroundSize = "100% 100%";

    // Set sprite origin to center, instead of top left.
    cache.carElem.style.transform = "translate(-50%, -50%) rotate(270deg)";

    /** Do something when car collides. */
    function checkCollision({
        entities,
        entityWidthVW,
        entityHeightVH,
        doCollision,
        removeCollided = true,
    }: {
        entities: Entity[];
        entityWidthVW: number;
        entityHeightVH: number;
        doCollision: (entity: Entity) => void;
        removeCollided?: Boolean;
    }) {
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];

            if (
                cache.carLocation.xVW > entity.xVW - entityWidthVW &&
                cache.carLocation.xVW < entity.xVW + entityWidthVW &&
                cache.carLocation.yVH > entity.yVH - entityHeightVH &&
                cache.carLocation.yVH < entity.yVH + entityHeightVH
            ) {
                doCollision(entity);

                if (removeCollided) {
                    entity.elem.remove();
                    entities.splice(i, 1);
                }
            }
        }
    }

    // CAR GO VROOM
    // Move car upwards every tick.
    // Loop around to bottom when it reaches top.
    // Check car collision every tick and do stuff.

    setInterval(() => {
        if (--cache.carLocation.yVH < 0) cache.carLocation.yVH = 100;
        cache.carElem.style.top = cache.carLocation.yVH.toString() + "vh";

        // Kill enemies on collision if level is meadow.
        if (cache.level == "meadow")
            checkCollision({
                entities: cache.enemies,
                entityWidthVW: EnemyConfig.widthVW,
                entityHeightVH: EnemyConfig.heightVH,
                doCollision: () => {
                    // +1 gold per kill
                    let gold = Number(cache.uiGoldElem.innerHTML);
                    cache.uiGoldElem.innerHTML = (++gold).toString();
                },
            });

        // Do stuff on pickup collision if level is meadow.
        if (cache.level == "meadow")
            checkCollision({
                entities: cache.pickups,
                entityWidthVW: PickupConfig.widthVW,
                entityHeightVH: PickupConfig.heightVH,
                doCollision: (pickup: Pickup) => {
                    cache.pickupCounts[pickup.type]--;
                    switch (pickup.type) {
                        case "shop":
                            switchLevel("shop");
                    }
                },
            });
    }, CarConfig.moveTimeMS);

    // Bind car horizontal position to mouse.
    document.addEventListener("mousemove", (event) => {
        cache.carLocation.xVW = pxToVW(event.clientX);
        cache.carElem.style.left = cache.carLocation.xVW.toString() + "vw";
    });
});
