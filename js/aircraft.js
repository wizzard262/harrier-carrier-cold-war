/*
 * Harrier Carrier - aircraft
 * The aircraft data objects, aircraft stats lookups, and tests on deck positions.
 */

//=========================== AIRCRAFT OBJECTS ==========================

/*
 * A USA aircraft (one entry in sprite_deck), on deck or in the air.
 *   type       'harrier', 'tomcat' ... (see spriteTypeArray)
 *   direction  0-3: north, east, south, west
 *   x, y       deck square (0-3, 0-7)
 *   destX, destY  deck square it is moving to
 *   shield, fuel, ammo
 *   action     what it is doing (see spriteActionArray)
 *   sprite     its isometric Phaser sprite
 *   counter    frame counter used by the current action (timers, missile delay)
 *   guid       unique id, also stored on its sprites
 *   slot       its altitude slot in the battle stack (usaProfiles), or null
 */
function createAircraft(type, direction, x, y, shield, fuel, ammo, action, slot) {
    return {
        type: type,
        direction: direction,
        x: x,
        y: y,
        destX: 0,
        destY: 0,
        shield: shield,
        fuel: fuel,
        ammo: ammo,
        action: action,
        sprite: null,
        counter: null,
        guid: guid(),
        slot: slot
    };
}

/*
 * A USA aircraft in the battle stack (usaProfiles[slot]).
 *   rollCounter / roll  barrel-roll animation after dodging a missile ('up', 'level', 'down')
 *   chevron / chevronBlue  missile delay chevrons, and the Hawkeye bonus chevrons
 */
function createUsaProfile(type, sprite, guidValue, chevron, chevronBlue) {
    return {
        type: type,
        sprite: sprite,
        rollCounter: 0,
        roll: 'level',
        guid: guidValue,
        chevron: chevron,
        chevronBlue: chevronBlue
    };
}

/*
 * A USSR attacker (ussrProfiles[slot]).
 *   rollCounter   barrel roll timer; a Foxbat also uses it to count how long it has been isolated
 *   missileCounter  frames since its last missile (starts negative to delay the first shot)
 */
function createUssrProfile(type, sprite, chevron) {
    return {
        type: type,
        sprite: sprite,
        rollCounter: 0,
        roll: 'level',
        guid: guid(),
        missileCounter: -250,
        shield: GetTypeShieldMax(type),
        chevron: chevron
    };
}

// The aircraft with this guid, or undefined
function findAircraft(guidValue) {
    for (var i = 0; i < sprite_deck.length; i++) {
        if (sprite_deck[i].guid == guidValue) {
            return sprite_deck[i];
        }
    }
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

//=========================== AIRCRAFT STATS ============================

function GetTypeStat(type, stat) {
    var stats = AIRCRAFT_STATS[type];
    return stats ? stats[stat] : undefined;
}

function GetTypeShieldMax(type) { return GetTypeStat(type, 'shieldMax'); }
function GetTypeFuelMax(type) { return GetTypeStat(type, 'fuelMax'); }
function GetTypeAmmoMax(type) { return GetTypeStat(type, 'ammoMax'); }
function GetTypeMissileDelay(type) { return GetTypeStat(type, 'missileDelay'); }
function GetTypeAmmoSize(type) { return GetTypeStat(type, 'ammoSize'); }
function GetTypeText(type) { return GetTypeStat(type, 'name'); }
function GetTypeText2(type) { return GetTypeStat(type, 'info1'); }
function GetTypeText3(type) { return GetTypeStat(type, 'info2'); }
function GetTypeIntelText(type) { return GetTypeStat(type, 'intel'); }

function isHoverFlightType(type) {
    return GetTypeStat(type, 'flight') === 'vtol';
}

function isNormalFlightType(type) {
    return GetTypeStat(type, 'flight') === 'catapult';
}

//=========================== DECK POSITIONS ============================

function isOnCatapult(x, y) {
    return catapultCoords[0] == x && catapultCoords[1] == y;
}

function isOnCatapultTrack(x, y) {
    return catapultTrackCoords[0] == x && catapultTrackCoords[1] == y;
}

function isOnShield(x, y) {
    return shieldCoords[0] == x && shieldCoords[1] == y;
}

function isOnFuel(x, y) {
    return fuelCoords[0] == x && fuelCoords[1] == y;
}

function isOnAmmo(x, y) {
    return ammoCoords[0] == x && ammoCoords[1] == y;
}

function isOnRunway(x, y) {
    return x == 1 && (y == 6 || y == 7 || y == 8);
}

function isOnLift(x, y) {
    return liftCoords[0] == x && liftCoords[1] == y;
}

// Actions where the aircraft occupies its deck square
function isOnDeck(action) {
    return action == 'sit_on_deck' ||
        action == 'move_on_deck' ||
        action == 'busy_moving_on_deck' ||
        action == 'hover_down' ||
        action == 'hover_level_return' ||
        action == 'hover_return';
}

// Actions where the aircraft is finished flying for this level
function isLandedOnDeck(action) {
    return action == 'sit_on_deck' ||
        action == 'move_on_deck' ||
        action == 'busy_moving_on_deck' ||
        action == 'ditched' ||
        action == 'dead';
}

// Nothing is on, or heading to, this deck square
function isDeckSpaceAvailable(x, y) {
    var deckSpaceAvailable = true;
    sprite_deck.forEach(function (aircraft) {
        if ((aircraft.x == x && aircraft.y == y) || ((aircraft.destX == x && aircraft.destY == y) && isOnDeck(aircraft.action))) {
            deckSpaceAvailable = false;
        }
    });
    return deckSpaceAvailable;
}

function IsCatapultLaunch(fuel, x, y, xTo, yTo) {
    return fuel > 0 && isOnCatapult(x, y) && x == xTo && y == yTo;
}

function IsUsaAllOnDeck() {
    var allPlanesLanded = true;
    sprite_deck.forEach(function (aircraft) {
        if (!isLandedOnDeck(aircraft.action) && aircraft.type != 'u2') { // U2 does not land
            allPlanesLanded = false;
        }
    });
    return allPlanesLanded;
}

// The next free slot at the top of the battle stack
function GetFirstSlot() {
    var firstSlot = 0;
    for (var i = 0; i < usaProfiles.length; i++) {
        if (usaProfiles[i]) {
            firstSlot++;
        }
    }
    return firstSlot > 3 ? 3 : firstSlot;
}
