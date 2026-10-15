/*
 * Harrier Carrier - game state
 *
 * The aircraft:
 *   sprite_deck   every USA aircraft, on deck or in the air (see createAircraft in aircraft.js)
 *   usaProfiles   the USA battle stack: 4 altitude slots, 0 = lowest (see createUsaProfile)
 *   ussrProfiles  the attacking USSR sub-wave, by slot (see createUssrProfile)
 *   usaMissiles / ussrMissiles  missile and bullet sprites in flight
 */

var sprite_deck = [];
var usaProfiles = [];
var ussrProfiles = [];
var usaMissiles = [];
var ussrMissiles = [];

// Progress through the levels and the state of the current battle
var Battle = {
    ussrWave: 0,              // current level (0 = DEFCON 1, -1 = random level)
    ussrSubwave: -1,          // current sub-wave of the level (first loop starts at 0)
    ussrWaveFullHealth: 0,    // USSR health bar: total shields of the level's aircraft
    ussrWaveHealth: 0,
    ussrWaveUpdate: false,    // a new sub-wave needs to be sent in
    waveCounterDelay: 0,      // frames waited between levels
    usaHealth: usaFullHealth, // USA health bar: the carrier
    usaHealthDelta: 0,        // damage to show on the health bars this frame
    ussrHealthDelta: 0,
    usaAlive: true,
    resetting: false,         // a level is being (re)started from the menu
    levelCompleted: true,
    isRandomLevel: 0,         // -4 easy, -5 medium, -6 hard random level
    selectedLevel: undefined, // last menu selection
    missileDelayUnitModifier: 0, // Hawkeyes in combat: each removes a missile-delay chevron
    foxbatIntel: false,       // a Foxbat defector is in combat and reporting intel
    foxbatIntelReceived: [false, false, false, false], // per slot: did this sub-wave's intel get through (rolled once per sub-wave)
    landingSequenceRunning: false
};

// Game speed (fast-forward buttons): tween durations are multiplied by tweenMultiplier,
// per-frame movement by tweenInverseMultiplier
var Speed = {
    tweenMultiplier: 1,
    tweenInverseMultiplier: 1
};

// Tutorial (levels 1 and 2) progress
var Tutorial = {
    touchIconPosition: 0,     // index into touchIconTutorial
    ffwdIcon: false,          // fast-forward hint shown
    ffwdIcon2: 0,             // times the fast-forward hint has cycled
    russianInfoIcon: false    // "tap the Russian plane" hint shown
};

var water = [];               // animated sea tiles
var cursorPos;                // 3D position of the pointer on the deck

// Display objects, created in create() and the Draw/Setup functions
var UI = {
    // groups start undefined: sprites added to an undefined group go to the world (null would throw)
    isoGroup: undefined,      // isometric deck sprites
    isoGroupTutorial: undefined, // deck squares the tutorial wants tapped (drawn on top)
    graphicsStatusGroup: undefined,
    usaProfileGroup: undefined, // (never created: profiles go to the world)
    ussrProfileGroup: undefined,
    textGroup: undefined,
    ffwdGroup: undefined,

    graphicsProfile: null,    // per-frame drawing: profile status bars, menu selection
    graphicsStatusBars: null, // per-frame drawing: info panel status bars
    graphicsInsigniaPanel: null,

    // deck selection
    currentPositionIndicator: null, // green square
    currentPositionIndicatorBox: null, // green wireframe box
    newPositionIndicatorBox: null,  // blue wireframe box
    spriteButtons: [],        // VTOL take-off buttons
    moveIndicators: [],       // squares an aircraft can move to
    chosenPath: [],

    // per-frame decorations on the battle stack
    hawkEyeChevrons: [],
    seakingJammers: [],
    foxbatIntelTexts: [],
    foxbatIntelMorseCodes: [],

    // info panel (bottom right)
    spriteInfoPanelProfile: null,
    spriteInfoPanelBackground: null,
    spriteInsigniaPanel: null,
    spriteInfoPanelGuid: null, // USA aircraft shown in the info panel
    spriteInfoPanelSlot: null, // USSR slot shown in the info panel
    missileChevronStatusBar: null,
    infoPanelTitleText: null,
    infoPanelAmmoText: null,
    infoPanelShieldText: null,
    infoPanelFuelText: null,
    infoPanelTextFireRate: null,
    infoPanelText2: null,
    infoPanelText3: null,
    infoPanelLevelText1: null,
    infoPanelLevelText2: null,
    infoPanelLevelText3: null,
    infoPanelLevelText4: null,
    infoPanelLevelText5: null,
    infoPanelLevelText6: null,

    // big titles and the recovery-cable texts
    mainTitleLine1Text: null,
    mainTitleLine2Text: null,
    mainTitleLine3Text: null,
    recoveryAmmoText: null,
    recoveryShieldText: null,
    recoveryFuelText: null,
    recoveryBolterText: null,

    // scenery and animations
    admiral: null,
    mouthAnimation: null,
    fireAnimation: null,
    flagAnimation: null,
    flagAnimationVictory: null,
    hudSprite: null,
    hudCounter: 1000,
    cloud_1: null,
    cloud_2: null,
    cloud_3: null,
    cloud_4: null,
    sea_5: null,
    deck_1: null,
    cold_war: null,

    // health bars
    usaHealthBar: null,
    ussrHealthBar: null,
    usaHealthBarDelta: null,
    ussrHealthBarDelta: null,

    // menus and controls
    burger_menu: null,
    pause_menu: null,
    full_game_menu: null,
    ffwd_1: null,
    ffwd_2: null,
    ffwd_3: null,
    touchIcon: null,
    touchIconFfwd: null,
    spriteTakeoffArrow: null
};
