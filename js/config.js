/*
 * Harrier Carrier - configuration
 * Tuning numbers, deck layout and the stats of every aircraft type.
 */

var musicEnabled = true;
var FullGameEnabled = true;
var googlePlayLink = "https://play.google.com/store/apps/details?id=garmadon.harriercarriercoldwar";

//=========================== TUNING ====================================

var recoveryLineBonus = 250;          // fuel/shield/ammo given by catching recovery cable 1/2/3
var fuelDecrease = 0.25;              // fuel used per frame while in combat
var usaMissileDelaySize = 60;         // frames per missile-delay chevron (USA)
var ussrMissileDelaySize = 120;       // frames per missile-delay chevron (USSR)
var usaMissileDamage = 300;
var ussrMissileDamage = 150;
var missileHitArray = [true, false];  // 50% hit chance
var missileSpeedArray = [0.5, 0, 0.5, 1];
var hudFloatDirection = [30, 20, 10, -10, -20, -30];
var shieldRefreshRate = 5;            // recharge per frame on the deck pads
var fuelRefreshRate = 5;
var ammoRefreshRate = 5;
var usaFullHealth = 1500;
var hudCounterThreshold = 2400;       // frames between HUD flickers
var waveCounterDelayThreshold = 100;  // frames between the end of a level and the next
var slowMotionMultiplier = 1;

// Take-off timings, in frames at normal speed (fast-forward shortens them in proportion).
// VTOL and catapult take-offs add up to the same total, so aircraft reach the battle
// stack in the order they were launched.
var TAKEOFF = {
    catapultWait: 30,   // on the catapult before it fires
    catapultRun: 70,    // catapult run and climb away
    vtolRise: 30,       // VTOL rise to hover height
    vtolHover: 20,      // VTOL hover before leaving
    vtolLeave: 50       // VTOL accelerating away
};

//=========================== DECK LAYOUT ===============================
// Deck grid is 4 wide (x 0-3) by 8 long (y 0-7)

var cursorPosCorrection = 112;
var catapultCoords = [3, 1];          // position of catapult on deck
var catapultTrackCoords = [3, 0];     // position of catapult track on deck
var fuelCoords = [1, 0];              // purple pad
var shieldCoords = [1, 2];            // yellow pad
var ammoCoords = [1, 4];              // red pad
var liftCoords = [3, 7];

var deckOffsetX = 15;                 // where deck X starts in units of isoBaseSize
var deckOffsetY = 12;                 // where deck Y starts in units of isoBaseSize
var deckWidth = 4;
var deckHeight = 8;

var isoBaseSize = 32;                 // size of isometric sprites
var isoGameSize = 64;                 // gameboard size (i.e. 2 * 2 sprites of deckspace)
var deckSpriteIsoZ = 80;              // Z is set to keep deck sprites above the deck level

//=========================== AIRCRAFT ==================================

// Level data refers to USA aircraft by index into this list
var spriteTypeArray = ['harrier', 'tomcat', 'hawkeye', 'seaking', 'warthog', 'foxbat_defect', 'huey', 'u2'];

// Facing, by direction index 0-3: north, east, south, west (sprite frame suffix)
var directionArray = ['_n', '_e', '_s', '_w'];

// Every value an aircraft's action can take
var spriteActionArray = [
    // on deck
    'sit_on_deck',
    'move_on_deck',
    'busy_moving_on_deck',
    // vertical take off and landing
    'hover_up',
    'hover_level',
    'hover_leave',
    'hover_return',
    'hover_level_return',
    'hover_down',
    // catapult take off and cable landing
    'ready_for_takeoff',
    'takeoff',
    'landing',
    // in the air
    'away_from_carrier',
    'in_combat',
    'return_to_carrier',
    // gone
    'dead',
    'crashing',
    'crashed',
    'ditched'
];

/*
 * Stats for every aircraft type.
 *   flight       'vtol' takes off vertically, 'catapult' uses the catapult and lands on the cables
 *   shieldMax / fuelMax / ammoMax
 *   missileDelay chevrons between shots (1 = bullets)
 *   ammoSize     damage multiplier per shot (0.25 = bullets, 2 = the Bear's big missile)
 *   name, info1, info2  info panel text
 *   intel        what the Foxbat defector reports about this type
 * A missing value is undefined, exactly as the original switch statements returned.
 */
var AIRCRAFT_STATS = {
    // USA
    harrier:       { flight: 'vtol',     shieldMax: 500,  fuelMax: 500,  ammoMax: 500, missileDelay: 5, ammoSize: 1,    name: 'AV-8B Harrier',    info1: 'Small all-rounder VTOL',     info2: 'fighter-bomber' },
    hawkeye:       { flight: 'catapult', shieldMax: 250,  fuelMax: 1000, ammoMax: 0,   missileDelay: 0, ammoSize: 0,    name: 'E-2 Hawkeye',      info1: 'Decrease missile delay of',  info2: 'armed craft by 1 chevron' },
    tomcat:        { flight: 'catapult', shieldMax: 750,  fuelMax: 300,  ammoMax: 1000, missileDelay: 4, ammoSize: 1,   name: 'F-14 Tomcat',      info1: 'Fast, powerful interceptor', info2: 'but short-ranged' },
    warthog:       { flight: 'catapult', shieldMax: 1000, fuelMax: 500,  ammoMax: 975, missileDelay: 1, ammoSize: 0.25, name: 'A-10 Thunderbolt', info1: 'Heavy-armour. 30mm Gatling', info2: 'cannon never misses' },
    seaking:       { flight: 'vtol',     shieldMax: 750,  fuelMax: 750,  ammoMax: 0,   missileDelay: 0, ammoSize: 0,    name: 'SH-3 Seaking',     info1: 'Electronic missile-jamming', info2: 'VTOL helicopter' },
    foxbat_defect: { flight: 'catapult', shieldMax: 750,  fuelMax: 250,  ammoMax: 750, missileDelay: 3, ammoSize: 1,    name: 'MiG-25 Foxbat',    info1: 'DEFECTOR. Can gather intel', info2: 'on enemies future movements' },
    huey:          { flight: 'vtol',     shieldMax: 250,  fuelMax: 150,  ammoMax: 0,   missileDelay: 0, ammoSize: 0,    name: 'UH-1 Bell Huey',   info1: 'Multi-role chopper doing',   info2: 'evac. Ditch it ASAP' },
    u2:            { flight: 'catapult', shieldMax: 50,   fuelMax: 1500, ammoMax: 0,   missileDelay: 0, ammoSize: 0,    name: 'U2',               info1: '',                           info2: '' },

    // USSR
    mig17:   { shieldMax: 250,  missileDelay: 5, ammoSize: 1, name: 'MiG-17 Fresco',   info1: 'Small 1950s 1st Gen',        info2: 'jet-fighter', intel: '17' },
    mig21:   { shieldMax: 500,  missileDelay: 4, ammoSize: 1, name: 'MiG-21 Fishbed', info1: 'Medium 1960s 3rd Gen',       info2: 'jet-fighter', intel: '21' },
    fulcrum: { shieldMax: 750,  missileDelay: 3, ammoSize: 1, name: 'MiG-29 Fulcrum', info1: 'Large 1970s 4th Gen',        info2: 'jet-fighter', intel: '29' },
    foxbat:  { shieldMax: 1000, missileDelay: 2, ammoSize: 1, name: 'MiG-25 Foxbat',  info1: 'V.fast, heavy, short range', info2: 'WILL DEFECT IF ISOLATED!', intel: '25' },
    bear:    { shieldMax: 1350, missileDelay: 5, ammoSize: 2, name: 'TU-95 Bear',     info1: 'Long-range bomber',          info2: 'Beware of its ICBM!', intel: '95' },

    // a USSR Foxbat that is flying over to the USA side
    foxbat_defecting: { ammoMax: 0, missileDelay: 0 }
};
