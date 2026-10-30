/// <reference path="phaser.js" />

// using canvas here just because it runs faster for the body debug stuff
var game = new Phaser.Game(800, 1000, Phaser.AUTO, 'test', null, true, true);

var BasicGame = function (game) { };

BasicGame.Boot = function (game) {
    // nothing here
};

var currentPositionIndicator; // blue square
var currentPositionIndicatorBox; // blue wireframe box
var newPositionIndicatorBox; // green wireframe box
var isoBaseSize = 32;
var isoGameSize = 64;
var deckSpriteIsoZ = 80;
var isoGroup;
var usaProfileGroup;
var ussrProfileGroup;
var water = [];
var whitewater = [];
var whitewater_counter = [];

var lift = [];
var deck = [];
var deck_plates = [];
var tower = [];
var spriteButtons = [];
var moveIndicators = [];
var chosenPath = [];

var catapult = [3, 1]; //position of catapult on deck
var catapultLine;

var tileLift;
var deckOffsetX = 17;
var deckOffsetY = 13;

var hangarOffsetX = 19;
var hangarOffsetY = 15;

var buttonDeckToggle;
var deckIsUp = false;
var deckMoving = false;
var buttonLiftToggle;
var liftIsUp = false;
var liftMoving = false;
var landingSequenceRunning = false;

var ussrProfiles = [];
var usaProfiles = [];

var usaMissiles = [];
var ussrMissiles = [];

var ussrWave = 1;
var ussrHealthRecharge = false;
var ussrHealth = 100;
var usaHealth = 100;

//text
var recoveryAmmoText;
var recoveryShieldText;
var recoveryFuelText;
var recoveryBolterText;
var mainTitleLine1Text;
var mainTitleLine2Text;

var graphicsProfile;
var clouds;
var recoveryLineBonus = 25;
var fuelDecrease = 0.01;

var missileDelay = 200;
var missileDamage = 30;

var tileArray = [];
tileArray[0] = 'nothing';
tileArray[1] = 'water';
tileArray[2] = 'button';
tileArray[3] = 'nw_corner';
tileArray[4] = 'w_wall';
tileArray[5] = 'n_wall';
tileArray[6] = 'sw_corner';
tileArray[7] = 's_wall';
tileArray[8] = 'floor';
tileArray[9] = 'ne_corner';
tileArray[10] = 'se_corner';
tileArray[11] = 'e_wall';
tileArray[12] = 'white_water';
tileArray[13] = 'deck_block';
tileArray[14] = 'lift_block';
tileArray[15] = 'lift_hatch_1';
tileArray[16] = 'lift_hatch_2';
tileArray[17] = 'lift_back';
tileArray[18] = 'deck_thin';
tileArray[19] = 'lift_hatch_west';
tileArray[20] = 'tower';
tileArray[21] = 'harrier_n';
tileArray[22] = 'harrier_e';
tileArray[23] = 'harrier_s';
tileArray[24] = 'harrier_w';
tileArray[25] = 'half_water';
tileArray[26] = 'usa_health';
tileArray[27] = 'ussr_health';
tileArray[28] = 'usa_health_delta';
tileArray[29] = 'ussr_health_delta';
tileArray[30] = 'seaking_profile_1';
tileArray[31] = 'seaking_profile_2';
tileArray[32] = 'missile_profile_1';
tileArray[33] = 'missile_profile_2';
tileArray[34] = 'explosion';
//tileArray[36] = 'foxbat_profile';
//tileArray[37] = 'bear_profile';
tileArray[38] = 'white_lines';
tileArray[39] = 'catapult_west';
tileArray[40] = 'catapult_east';
tileArray[41] = 'catapult_west_brown';
tileArray[42] = 'catapult_east_brown';
tileArray[43] = 'blue_box';
tileArray[44] = 'green_box';

tileArray[45] = 'mig21_profile_level';
tileArray[46] = 'mig21_profile_up';
tileArray[47] = 'mig21_profile_down';

tileArray[48] = 'harrier_profile_level';
tileArray[49] = 'harrier_profile_up';
tileArray[50] = 'harrier_profile_down';

tileArray[51] = 'tomcat_profile_level';
tileArray[52] = 'tomcat_profile_up';
tileArray[53] = 'tomcat_profile_down';

tileArray[54] = 'hawkeye_profile_level';
tileArray[55] = 'hawkeye_profile_up';
tileArray[56] = 'hawkeye_profile_down';

tileArray[57] = 'warthog_s';
tileArray[58] = 'corsair_s';
tileArray[59] = 'prowler_s';
tileArray[60] = 'lightning_s';

tileArray[61] = 'white_lines_cable_red';
tileArray[62] = 'white_lines_cable_yellow';
tileArray[63] = 'white_lines_cable_purple';

tileArray[64] = 'green_square';
tileArray[65] = 'red_square';
tileArray[66] = 'purple_square';
tileArray[67] = 'yellow_square';
tileArray[68] = 'red_square';

tileArray[69] = 'usa_missile_1';
tileArray[70] = 'ussr_missile_1';

tileArray[71] = 'fulcrum_profile_level';
tileArray[72] = 'fulcrum_profile_up';
tileArray[73] = 'fulcrum_profile_down';

tileArray[74] = 'bear_profile_level';
tileArray[75] = 'bear_profile_up';
tileArray[76] = 'bear_profile_down';

var spriteActionArray = [];
//deck
spriteActionArray[0] = 'sit_on_deck';
spriteActionArray[1] = 'move_on_deck';
spriteActionArray[1] = 'busy_moving_on_deck';

//hover
spriteActionArray[2] = 'hover_up';
spriteActionArray[3] = 'hover_level';
spriteActionArray[4] = 'hover_down';
spriteActionArray[5] = 'hover_leave';
spriteActionArray[6] = 'hover_return';
spriteActionArray[7] = 'ready_for_takeoff';
spriteActionArray[8] = 'takeoff';
spriteActionArray[9] = 'landing';
spriteActionArray[10] = 'away_from_carrier';
spriteActionArray[11] = 'in_combat';
spriteActionArray[12] = 'return_to_carrier';

var spriteTypeArray = [];
spriteTypeArray[0] = 'harrier';
spriteTypeArray[1] = 'tomcat';
spriteTypeArray[2] = 'hawkeye';
spriteTypeArray[3] = 'seaking';

var directionArray = [];
directionArray[0] = "_n";
directionArray[1] = "_e";
directionArray[2] = "_s";
directionArray[3] = "_w";

//(x 0-3) / y (0-8)
// type, direction, x, y, destinationX, destinationY, shield, fuel, ammo, action, sprite, counter, guid, fightSlot
var sprite_deck = [

            [0, 0, 2, 2, 0, 0, 50, 50, 50, 'sit_on_deck', null, null, guid()],
            [0, 3, 0, 2, 0, 0, 34, 44, 24, 'sit_on_deck', null, null, guid()],
            [0, 1, 0, 3, 4, 0, 44, 14, 34, 'sit_on_deck', null, null, guid()],
            [0, 2, 0, 4, 0, 0, 04, 14, 44, 'sit_on_deck', null, null, guid()],
            [0, 3, 0, 5, 0, 0, 14, 24, 44, 'sit_on_deck', null, null, guid()],
            [0, 1, 0, 6, 0, 0, 24, 34, 34, 'sit_on_deck', null, null, guid()],
            [0, 2, 0, 7, 0, 0, 34, 44, 24, 'sit_on_deck', null, null, guid()],
            [0, 3, 0, 8, 0, 0, 44, 14, 14, 'sit_on_deck', null, null, guid()],
            [0, 1, 2, 4, 0, 0, 44, 44, 14, 'sit_on_deck', null, null, guid()],

            [1, 1, 3, 4, 0, 0, 50, 25, 50, 'sit_on_deck', null, null, guid()],
            [1, 0, 3, 1, 0, 0, 50, 25, 50, 'sit_on_deck', null, null, guid()],
            [2, 1, 2, 0, 0, 0, 25, 50, 0, 'sit_on_deck', null, null, guid()],
            [2, 0, 0, 1, 0, 0, 25, 50, 0, 'sit_on_deck', null, null, guid()],

];


var tiles_deck = [
    [0, 0, 13, 13, 13, 19, 19, 13],
    [0, 13, 13, 13, 13, 19, 19, 40, 39],
    [0, 13, 13, 13, 13, 19, 19, 40, 39],
    [0, 13, 13, 13, 13, 19, 19, 42, 41],
    [0, 13, 13, 13, 13, 19, 19, 42, 41],
    [0, 13, 13, 13, 13, 19, 19, 13, 13],
    [13, 13, 13, 13, 13, 19, 19, 13, 13],
    [13, 13, 13, 13, 13, 19, 19, 13, 13],
    [0, 13, 13, 13, 13, 19, 19, 13, 13],
    [0, 13, 13, 13, 13, 19, 19, 13, 13],
    [0, 13, 13, 13, 13, 19, 19, 13, 13],
    [0, 13, 13, 13, 13, 19, 19, 13, 13],
    [0, 13, 13, 13, 13, 19, 19, 13, 13],
    [13, 13, 13, 38, 38, 19, 19, 13, 13],
    [13, 13, 13, 63, 63, 19, 19, 13, 13],
    [0, 13, 13, 38, 38, 19, 19, 18, 13],
    [0, 13, 13, 62, 62, 19, 19, 15, 16],
    [0, 13, 13, 38, 38, 19, 19],
    [0, 13, 13, 61, 61, 19, 19],
    [0, 0, 13, 13, 13, 13, 13, 13],
];

var tiles_hangar = [
		[0, 0, 3, 5, 5, 5, 5, 9, 0],
		[0, 3, 8, 8, 8, 8, 8, 8, 9],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
        [0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 4, 8, 8, 8, 8, 8, 8, 11],
		[0, 6, 8, 8, 8, 8, 8, 8, 10],
		[0, 0, 6, 7, 7, 7, 7, 10, 0]
];

var tiles_sea = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

];

var size = 32;

var i = 0;
var tile;
var graphicsProfile;
var usaHealthBar;
var ussrHealthBar;
var usaHealthBarDelta;
var ussrHealthBarDelta;

var missileObject;

BasicGame.Boot.prototype =
{
    preload: function () {
        game.time.advancedTiming = true;
        game.debug.renderShadow = false;
        game.stage.disableVisibilityChange = true;

        game.plugins.add(new Phaser.Plugin.Isometric(game));

        game.load.atlasJSONHash('tileset', 'assets/tileset.png', 'assets/tileset.js');
        game.load.image('clouds', 'assets/clouds.png');

        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        game.iso.anchor.setTo(0.528, 0.14);

        //=== fonts
        game.load.bitmapFont('fontYellow', 'assets/font/font_yellow.png', 'assets/font/font.xml');
        game.load.bitmapFont('fontRed', 'assets/font/font_red.png', 'assets/font/font.xml');
        game.load.bitmapFont('fontPurple', 'assets/font/font_purple.png', 'assets/font/font.xml');
        game.load.bitmapFont('fontBlue', 'assets/font/font_blue.png', 'assets/font/font.xml');


    },
    create: function () {

        clouds = game.add.sprite(0, 0, 'clouds');
        clouds.scale.setTo(4, 4);

        isoGroup = game.add.group();

        DrawSea();
        DrawHangar();
        DrawDeck();
        DrawLift(deckOffsetX + 6, 30, 7);
        DrawDeckSprites();
        SetupDeckToggle();
        SetupLiftToggle();
        UpdateProfileStackUssr();

        game.iso.simpleSort(isoGroup);

        //contains the plane shield, ammo,fuel bars
        graphicsProfile = game.add.graphics(0, 0);

        DrawRecoveryText();
        DrawHealthBars();
        DrawMainTitle();
    },
    update: function () {

        UpdateUsaHealthBar(GetUsaHealthDelta());
        UpdateUssrHealthBar(GetUssrHealthDelta());
        UpdateProfileStackUsa();
        UpdateMissileUsa();
        UpdateMissileUssr();
        WaterAnimate();
        graphicsProfile.clear();
        AnimateProfile(ussrProfiles, 'ussr');
        AnimateProfile(usaProfiles, 'usa');

        if (deckMoving) {
            if (deckIsUp) {
                DeckUp();
            }
            else {
                DeckDown();
            }
        }

        if (liftMoving) {
            if (liftIsUp) {
                LiftUp();
            }
            else {
                LiftDown();
            }
        }

        for (var j = 0; j < sprite_deck.length; j++) {
            var sd = sprite_deck[j];

            if (sd[9] == 'hover_level') {
                sd[10].isoZ += game.rnd.pick([0, -0.5, 0.5]); // hover wobble
                sd[11] += 1;
                if (sd[11] + game.rnd.pick([0, 20, -20]) >= 80) {
                    sd[9] = 'hover_leave';
                    sd[11] = null;
                }
            }

            if (sd[9] == 'hover_leave') {
                sd[10].bringToTop();
                sd[11] += 1; //counter increases leaving speed (accelerates)

                if (sd[1] == 0) { // north
                    sd[10].isoY -= 0.2 * sd[11];
                }
                if (sd[1] == 1) { // east
                    sd[10].isoX += 0.2 * sd[11];
                }
                if (sd[1] == 2) { // south
                    sd[10].isoY += 0.2 * sd[11];
                }
                if (sd[1] == 3) { // west
                    sd[10].isoX -= 0.2 * sd[11];
                }
            }

            if (sd[9] == 'hover_leave' && sd[11] >= 100) {
                sd[11] = null;
                sd[9] = 'away_from_carrier';
                sd[13] = getFirstSlot();

                if (sd[1] == 0) { // north
                    sd[10].isoY = 0;
                    sd[10].loadTexture('tileset', spriteTypeArray[sd[0]] + '_s');
                    sd[1] = 2; //face about
                }
                else if (sd[1] == 1) { // east
                    sd[10].isoX = 1500;
                    sd[10].loadTexture('tileset', spriteTypeArray[sd[0]] + '_w');
                    sd[1] = 3; //face about
                }
                else if (sd[1] == 2) { // south
                    sd[10].isoY = 1500;
                    sd[10].loadTexture('tileset', spriteTypeArray[sd[0]] + '_n');
                    sd[1] = 0; //face about
                }
                else if (sd[1] == 3) { // west
                    sd[10].isoX = -100;
                    sd[10].loadTexture('tileset', spriteTypeArray[sd[0]] + '_e');
                    sd[1] = 1; //face about
                }
            }

            //set return plane to carrier
            if (sd[9] == 'return_to_carrier') {

                if (isNormalFlightType(spriteTypeArray[sd[0]])) {
                    sd[9] = 'landing';

                    //set landing start position
                    sd[10].isoX = 785;
                    sd[10].isoY = 1900;
                    sd[10].isoZ = 200;
                    sd[10].bringToTop();

                    //set recovery line will hit
                    catapultLine = game.rnd.pick([0, 1, 2, 3]);
                }

                if (isHoverFlightType(spriteTypeArray[sd[0]])) {
                    sd[9] = 'hover_return';
                    //todo: set return coords
                }
            }

            if (sd[9] == 'hover_return') {
                if (sd[1] == 0) { // from north
                    var delta = 0.02 * (sd[10].isoY - ((2 * sd[5]) + deckOffsetY + 1.5) * isoBaseSize) + 1;
                    sd[10].isoY -= delta;
                    if (delta < 1.02) {
                        sd[9] = 'hover_level_return';
                        sd[11] = 0;
                    }
                }
                if (sd[1] == 1) { // from east
                    var delta = 0.02 * ((((2 * sd[4]) + deckOffsetX + 1.5) * isoBaseSize) - sd[10].isoX) + 1;
                    sd[10].isoX += delta;
                    if (delta < 1.02) {
                        sd[9] = 'hover_level_return';
                        sd[11] = 0;
                    }
                }
                if (sd[1] == 2) { // from south
                    var delta = 0.02 * ((((2 * sd[5]) + deckOffsetY + 1.5) * isoBaseSize) - sd[10].isoY) + 1;
                    sd[10].isoY += delta;
                    if (delta < 1.02) {
                        sd[9] = 'hover_level_return';
                        sd[11] = 0;
                    }
                }
                if (sd[1] == 3) { //from west
                    var delta = 0.02 * (sd[10].isoX - ((2 * sd[4]) + deckOffsetX + 1.5) * isoBaseSize) + 1;
                    sd[10].isoX -= delta;
                    if (delta < 1.02) {
                        sd[9] = 'hover_level_return';
                        sd[11] = 0;
                    }
                }
            }

            if (sd[9] == 'hover_level_return') {
                sd[10].isoZ += game.rnd.pick([0, -0.5, 0.5]); // hover wobble
                sd[11] += 1;
                if (sd[11] + game.rnd.pick([0, 20, -20]) >= 80) {
                    sd[9] = 'hover_down';
                    sd[11] = null;
                }
            }

            if (sd[9] == 'hover_down') {
                sd[10].isoZ -= 1;  //hover down 
                if (sd[10].isoZ <= deckSpriteIsoZ) { //hover limit 
                    sd[9] = 'sit_on_deck';
                    sd[11] = 0;
                    sd[10].inputEnabled = true;
                }
            }

            if (sd[9] == 'ready_for_takeoff' && sd[11] == 0) {
                sd[1] = 0;  //set to head north   
                sd[10].loadTexture('tileset', spriteTypeArray[sd[0]] + '_n');
                sd[10].inputEnabled = false;
                sd[10].useHandCursor = false;
                sd[11] = 1;

            }

            //delay the catapult launch
            if (sd[9] == 'ready_for_takeoff' && sd[11] < 30) {
                sd[11] += 1;
            }

            //catapult launch
            if ((sd[9] == 'ready_for_takeoff' || sd[9] == 'takeoff') && sd[11] >= 30 && sd[11] < 100) {
                sd[9] = 'takeoff';
                sd[11] += 1;
                sd[10].isoX += 10;
                sd[10].isoZ += 10;
            }

            //set normal flight away from carrier
            if (sd[9] == 'takeoff' && sd[11] >= 100) {
                sd[11] = 0;
                sd[9] = 'away_from_carrier';
                sd[13] = getFirstSlot();
            }

            if (sd[9] == 'landing') {
                var delta = 0.02 * (sd[10].isoY - (16 + (2 * catapultLine) + deckOffsetY) * isoBaseSize) + 1;
                sd[10].isoY -= delta;
                sd[10].isoZ -= 0.02;

                if (delta < 2 && !landingSequenceRunning) {
                    landingSequenceRunning = true;
                    //=== show recovery line text, then fade out
                    switch (catapultLine) {
                        case 1:
                            var maxFuel = GetTypeFuelMax(spriteTypeArray[sd[0]]);
                            sd[7] = (sd[7] + recoveryLineBonus >= maxFuel) ? maxFuel : sd[7] + recoveryLineBonus;
                            break;
                        case 2:
                            var maxShield = GetTypeShieldMax(spriteTypeArray[sd[0]]);
                            sd[6] = (sd[6] + recoveryLineBonus >= maxShield) ? maxShield : sd[6] + recoveryLineBonus;
                            break;
                        case 3:
                            var maxAmmo = GetTypeAmmoMax(spriteTypeArray[sd[0]]);
                            console.log(maxAmmo);
                            console.log(sd[8] + recoveryLineBonus);
                            sd[8] = (sd[8] + recoveryLineBonus >= maxAmmo) ? maxAmmo : sd[8] + recoveryLineBonus;
                            break;
                    }

                    game.time.events.add(Phaser.Timer.SECOND * 0.2, function () {
                        recoveryAmmoText.visible = true;
                        var tweenRecoveryAmmoText = game.add.tween(recoveryAmmoText);

                        if (catapultLine == 3) {
                            recoveryAmmoText.fontSize = 64;
                            recoveryAmmoText.alpha = 1;
                            recoveryAmmoText.hit = true;
                            recoveryAmmoText.text = 'ammo +' + recoveryLineBonus.toString();
                        }
                        else {
                            recoveryAmmoText.fontSize = 32;
                            recoveryAmmoText.alpha = 0.5;
                            recoveryAmmoText.text = 'ammo';
                        }

                        tweenRecoveryAmmoText.to({ x: 100 }, catapultLine == 3 ? 1500 : 1000, Phaser.Easing.Linear.None, false, 0);
                        tweenRecoveryAmmoText.start();
                        tweenRecoveryAmmoText.onComplete.add(function (sprite, tween) {
                            sprite.visible = false;
                            if (sprite.hit) {
                                landingSequenceRunning = false;
                            }

                        });
                    });

                    if (catapultLine != 3) {
                        game.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
                            recoveryShieldText.visible = true;
                            var tweenRecoveryShieldText = game.add.tween(recoveryShieldText);
                            if (catapultLine == 2) {
                                recoveryShieldText.fontSize = 64;
                                recoveryShieldText.alpha = 1;
                                recoveryShieldText.hit = true;
                                recoveryShieldText.text = 'shield +25';
                            }
                            else {
                                recoveryShieldText.fontSize = 32;
                                recoveryShieldText.alpha = 0.5;
                                recoveryShieldText.text = 'shield';
                            }

                            tweenRecoveryShieldText.to({ alpha: 0 }, catapultLine == 2 ? 1500 : 1000, Phaser.Easing.Linear.None, false, 0);
                            tweenRecoveryShieldText.start();
                            tweenRecoveryShieldText.onComplete.add(function (sprite, tween) {
                                sprite.visible = false;
                                if (sprite.hit) {
                                    landingSequenceRunning = false;
                                }
                            });
                        });
                    }

                    if (catapultLine != 3 && catapultLine != 2) {
                        game.time.events.add(Phaser.Timer.SECOND * 0.6, function () {
                            recoveryFuelText.visible = true;
                            var tweenRecoveryFuelText = game.add.tween(recoveryFuelText);
                            if (catapultLine == 1) {
                                recoveryFuelText.fontSize = 64;
                                recoveryFuelText.alpha = 1;
                                recoveryFuelText.hit = true;
                                recoveryFuelText.text = 'fuel +25';
                            }
                            else {
                                recoveryFuelText.fontSize = 32;
                                recoveryFuelText.alpha = 0.5;
                                recoveryFuelText.text = 'fuel';
                            }

                            tweenRecoveryFuelText.to({ alpha: 0 }, catapultLine == 1 ? 1500 : 1000, Phaser.Easing.Linear.None, false, 0);
                            tweenRecoveryFuelText.start();
                            tweenRecoveryFuelText.onComplete.add(function (sprite, tween) {
                                sprite.visible = false;
                                if (sprite.hit) {
                                    landingSequenceRunning = false;
                                }
                            });
                        });
                    }

                    //bolter
                    if (catapultLine == 0) {
                        game.time.events.add(Phaser.Timer.SECOND * 0.8, function () {
                            recoveryBolterText.visible = true;
                            recoveryBolterText.alpha = 1;
                            var tweenRecoveryBolterText = game.add.tween(recoveryBolterText);

                            tweenRecoveryBolterText.to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, false, 0);
                            tweenRecoveryBolterText.start();
                            tweenRecoveryBolterText.onComplete.add(function (sprite, tween) {
                                sprite.visible = false;
                                landingSequenceRunning = false;
                            });
                        });
                    }

                }
                if (delta < 1.02 && catapultLine != 0) {

                    sd[9] = 'sit_on_deck';
                    sd[11] = 0;
                    sd[10].inputEnabled = true;

                    //repostion on deck, chooses 1 of 3 cables
                    sd[2] = 1;
                    sd[3] = 5 + catapultLine;

                    //repostion sprite
                    sd[10].isoX = (sd[2] + (0.5 * (deckOffsetX + 1.5))) * isoGameSize;
                    sd[10].isoY = (sd[3] + (0.5 * (deckOffsetY + 1.5))) * isoGameSize;
                    sd[10].isoZ = deckSpriteIsoZ;
                }
                //bolter
                if (delta < 1.02 && catapultLine == 0) {
                    sd[9] = 'ready_for_takeoff';
                    sd[11] = 31
                }
            }

            if (sd[9] == 'hover_up') {
                sd[10].inputEnabled = false;
                sd[10].useHandCursor = false;
                sd[10].isoZ += 1;  //hover rise 
                if (sd[10].isoZ >= 200) { //hover limit 
                    sd[9] = 'hover_level';
                    sd[11] = 0;
                }
            }

            if (sd[9] == 'move_on_deck') {

                // deck moving sprites
                //see: https://github.com/qiao/PathFinding.js
                var pathGridDeck = new PF.Grid(4, 9);

                //cannot move to  front square of catapult
                pathGridDeck.setWalkableAt(3, 0, false);

                for (var i = 0; i < sprite_deck.length; i++) {
                    if (isOnDeck(sprite_deck[i][9]))
                        pathGridDeck.setWalkableAt(sprite_deck[i][2], sprite_deck[i][3], false);
                }
                var pathChosen = null;

                var destinationAvailable = true;
                var gridExpendableDeck = pathGridDeck.clone();
                var finder = new PF.AStarFinder();
                pathChosen = null;
                pathChosen = finder.findPath(sd[2], sd[3], sd[4], sd[5], gridExpendableDeck);

                //if not reachable, set destination reachable anyway for another search, and we can still approach it (but not move onto it)
                //todo: this can cause 2 planes to go onto catapult at same time, also causes launcher to be trampled on catapult. FIX these.
                if (pathChosen.length <= 1) {
                    destinationAvailable = false;
                    var gridExpendableDeck2 = pathGridDeck.clone();
                    gridExpendableDeck2.setWalkableAt(sd[4], sd[5], true);
                    pathChosen = null;
                    pathChosen = finder.findPath(sd[2], sd[3], sd[4], sd[5], gridExpendableDeck2);
                }

                //=== if destination reachable, (of if not reachable, we can approach it)
                if (pathChosen.length > 2 || (pathChosen.length > 1 && destinationAvailable)) {
                    //set piece to occupy next space
                    var isoX = sd[10].isoX + (pathChosen[1][0] - sd[2]) * isoGameSize;
                    var isoY = sd[10].isoY + (pathChosen[1][1] - sd[3]) * isoGameSize;

                    //set sprite direction

                    //n
                    if (sd[3] > pathChosen[1][1])
                        sd[1] = 0;
                    //e
                    if (sd[2] < pathChosen[1][0])
                        sd[1] = 1;

                    //s
                    if (sd[3] < pathChosen[1][1])
                        sd[1] = 2;
                    //w					
                    if (sd[2] > pathChosen[1][0])
                        sd[1] = 3;

                    sd[10].loadTexture('tileset', spriteTypeArray[sd[0]] + directionArray[sd[1]]);
                    sd[10].guid = sd[12];
                    sd[2] = pathChosen[1][0];
                    sd[3] = pathChosen[1][1];
                    sd[9] = 'busy_moving_on_deck';

                    sd[10].xTo = sd[2];
                    sd[10].yTo = sd[3];

                    var tweenPiece = game.add.tween(sd[10]);
                    tweenPiece.to({
                        isoX: isoX,
                        isoY: isoY
                    }, 500, null, false);
                    tweenPiece.start();

                    tweenPiece.onComplete.add(function (sprite, tween) {
                        var deckArrayElement = findElement(sprite_deck, 12, sprite.guid);
                        deckArrayElement[9] = 'move_on_deck';
                        deckArrayElement[2] = sprite.xTo;
                        deckArrayElement[3] = sprite.yTo;
                    }, this);
                }
            }

            if (sd[9] == 'ready_for_takeoff' && sd[11] == 0) {
                sd[1] = 0;  //set to head north   
                sd[10].loadTexture('tileset', spriteTypeArray[sd[0]] + '_n');
                sd[11] = 1;
                sd.inputEnabled = false;
            }
        }
        game.iso.simpleSort(isoGroup);
    },
    render: function () {
        game.debug.text(game.time.fps || '--', 400, 14, "#a7aebe");
    }
};

function getFirstSlot() {

    var firstSlot = 0;

    for (var i = 0; i < usaProfiles.length; i++) {
        if (usaProfiles[i]) {
            firstSlot++;
        }
    }
    return firstSlot > 3 ? 3 : firstSlot;
}

function WaterAnimate() {
    water.forEach(function (w) {

        w.isoZ = (10 * Math.sin((game.time.now - (w.isoY * 9)) * 0.0008)) + (-1 * Math.sin((game.time.now + (w.isoX * 30)) * 0.002)) - 10;
        w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.2), 0.9, 1);
        if (w.isoY > 800 && w.isoX > 570 & w.isoX < 810 && game.rnd.pick([
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]) == 0)
            whitewater.push(w);
    });

    for (var i = 0; i < whitewater.length; i++) {
        whitewater[i].loadTexture('tileset', 'white_water');
        if (game.rnd.pick([
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]) == 0) {
            whitewater[i].loadTexture('tileset', 'water');
            whitewater.splice(i, 1);
            break;
        }
    }
}

function LiftUp() {
    if (lift[0].isoZ < 69) {

        lift.forEach(function (l) {
            l.isoZ += 3;
        });
        game.iso.simpleSort(isoGroup);
    }
    else {
        liftIsMoving = false;
    }
}

function LiftDown() {
    if (lift[0].isoZ > 6) {
        lift.forEach(function (l) {
            l.isoZ -= 3;
        });
        game.iso.simpleSort(isoGroup);
    }
    else {
        liftIsMoving = false;
    }
}

function SetGround(x, y, z, tileAtlas, tileName, group) {
    return game.add.isoSprite(x * isoBaseSize, y * isoBaseSize, z, tileAtlas, tileName, group);
}

function SetSprite(x, y, z, tileAtlas, tileName, group) {
    return game.add.isoSprite((x * isoGameSize) + (1.5 * isoBaseSize), (y * isoGameSize) + (1.5 * isoBaseSize), z, tileAtlas, tileName, group);
}

function SetFlatSprite(x, y, z, tileAtlas, tileName, group) {
    return game.add.sprite(x, y, tileAtlas, tileName, group);
}

function DeckUp() {
    DestroySpriteButtons();
    deck.forEach(function (d) {
        if (d.isoZ < 1000)
            d.isoZ += 20;
        else
            deckMoving = false;
    });
    tower.forEach(function (t) {
        if (t.isoZ < 1000)
            t.isoZ += 20;
    });
    sprite_deck.forEach(function (s) {
        if (s[10].isoZ < 1000)
            s[10].isoZ += 20;
    });
    deck_plates.forEach(function (dp) {
        if (dp.isoZ < 1000)
            dp.isoZ += 20;
    });
}

function DeckDown() {
    deck.forEach(function (d) {
        if (d.isoZ > 45)
            d.isoZ -= 20;
        else
            deckMoving = false;
    });
    tower.forEach(function (t) {
        if (t.isoZ > 124)
            t.isoZ -= 20;
    });
    sprite_deck.forEach(function (s) {
        if (s[10].isoZ > deckSpriteIsoZ)
            s[10].isoZ -= 20;
    });

    deck_plates.forEach(function (t) {
        if (t.isoZ > 72)
            t.isoZ -= 20;
    });

    game.iso.simpleSort(isoGroup);
}

function DrawLift(x, y, z) {

    //4 block lift
    var lift_1 = game.add.isoSprite((x * isoBaseSize), (y * isoBaseSize), z, 'tileset', tileArray[17], isoGroup);
    var lift_2 = game.add.isoSprite(((x + 1) * isoBaseSize), (y * isoBaseSize), z, 'tileset', tileArray[14], isoGroup);
    var lift_3 = game.add.isoSprite((x * isoBaseSize), ((y + 1) * isoBaseSize), z, 'tileset', tileArray[17], isoGroup);
    var lift_4 = game.add.isoSprite(((x + 1) * isoBaseSize), ((y + 1) * isoBaseSize), z, 'tileset', tileArray[14], isoGroup);
    lift_1.scale.setTo(0.93, 0.93);
    lift_2.scale.setTo(0.93, 0.93);
    lift_3.scale.setTo(0.93, 0.93);
    lift_4.scale.setTo(0.93, 0.93);


    lift.push(lift_1);
    lift.push(lift_2);
    lift.push(lift_3);
    lift.push(lift_4);
}

function DrawHangar() {
    for (var y = 0; y < tiles_hangar.length; y++) {
        for (var x = 0; x < tiles_hangar[y].length; x++) {

            var tileNumber = tileArray[tiles_hangar[y][x]];

            if (tileNumber != 'nothing') {
                var tile = SetGround(x + deckOffsetX, y + deckOffsetY, 0, 'tileset', tileNumber, isoGroup);
                tile.anchor.set(0.5, 0.5);
                tile.smoothed = false;
            }
        }

        //ghost planes in hangar
        var lightning = SetGround(1 + hangarOffsetX, 1 + hangarOffsetY, 10, 'tileset', 'lightning_s', isoGroup);
        lightning.anchor.set(0.5, 0.5);
        //  lightning.smoothed = false;
        lightning.alpha = 0.8;

        var warthog = SetGround(1 + hangarOffsetX, 5 + hangarOffsetY, 10, 'tileset', 'warthog_s', isoGroup);
        warthog.anchor.set(0.5, 0.5);
        warthog.smoothed = false;
        warthog.alpha = 0.1;

        var corsair = SetGround(4 + hangarOffsetX, 1 + hangarOffsetY, 10, 'tileset', 'corsair_s', isoGroup);
        corsair.anchor.set(0.5, 0.5);
        corsair.smoothed = false;
        corsair.alpha = 0.5;

        var prowler = SetGround(4 + hangarOffsetX, 5 + hangarOffsetY, 10, 'tileset', 'prowler_s', isoGroup);
        prowler.anchor.set(0.5, 0.5);
        prowler.smoothed = false;
        prowler.alpha = 0.5;
    }

}

function DrawSea() {
    for (var y = 0; y < tiles_sea.length; y++) {
        for (var x = 0; x < tiles_sea[y].length; x++) {

            var tileNumber = tileArray[tiles_sea[y][x]];

            if (tileNumber != 'nothing') {
                var tile = SetGround(x, y, 0, 'tileset', tileNumber, isoGroup);
                tile.anchor.set(0.5, 0.5);
                tile.smoothed = false;
                water.push(tile);
            }
        }
    }
}

function DrawDeck() {
    for (var y = 0; y < tiles_deck.length; y++) {
        for (var x = 0; x < tiles_deck[y].length; x++) {

            var tileNumber = tileArray[tiles_deck[y][x]];

            if (tileNumber != 'nothing') {
                var tile = SetGround(x + deckOffsetX, y + deckOffsetY, 45, 'tileset', tileNumber, isoGroup);

                tile.anchor.set(0.5, 0.5);
                tile.smoothed = false;
                deck.push(tile);
            }
        }
    }

    fuelIndicator = SetGround(10 + (0.5 * deckOffsetX), 8 + (0.5 * deckOffsetY), 72, 'tileset', 'purple_square', isoGroup);
    fuelIndicator.anchor.set(0.5, 0.5);
    fuelIndicator.scale.setTo(1.8, 1.8);
    fuelIndicator.alpha = 0.8;
    fuelIndicator.bringToTop();
    deck_plates.push(fuelIndicator);

    ammoIndicator = SetGround(10 + (0.5 * deckOffsetX), 18 + (0.5 * deckOffsetY), 72, 'tileset', 'red_square', isoGroup);
    ammoIndicator.anchor.set(0.5, 0.5);
    ammoIndicator.scale.setTo(1.8, 1.8);
    ammoIndicator.alpha = 0.8;
    ammoIndicator.bringToTop();
    deck_plates.push(ammoIndicator);

    shieldIndicator = SetGround(16 + (0.5 * deckOffsetX), 16 + (0.5 * deckOffsetY), 72, 'tileset', 'yellow_square', isoGroup);
    shieldIndicator.anchor.set(0.5, 0.5);
    shieldIndicator.scale.setTo(1.8, 1.8);
    shieldIndicator.alpha = 0.8;
    shieldIndicator.bringToTop();
    deck_plates.push(shieldIndicator);

    tower.push(SetGround(deckOffsetX - 1, 21, 121, 'tileset', 'tower', isoGroup));
    tower.push(SetGround(deckOffsetX - 1, 22, 121, 'tileset', 'tower', isoGroup));
    tower.push(SetGround(deckOffsetX - 1, 23, 121, 'tileset', 'tower', isoGroup));
    tower.push(SetGround(deckOffsetX - 1, 24, 121, 'tileset', 'tower', isoGroup));
    tower.push(SetGround(deckOffsetX - 1, 25, 121, 'tileset', 'tower', isoGroup));
    tower.push(SetGround(deckOffsetX - 1, 26, 121, 'tileset', 'tower', isoGroup));
}

function DrawDeckSprites() {
    for (var x = 0; x < sprite_deck.length; x++) {

        var type = spriteTypeArray[sprite_deck[x][0]];
        var direction = directionArray[sprite_deck[x][1]];
        var xIso = sprite_deck[x][2];
        var yIso = sprite_deck[x][3];

        var sprite = SetSprite(xIso + (0.5 * deckOffsetX), yIso + (0.5 * deckOffsetY), deckSpriteIsoZ, 'tileset', type + direction, isoGroup);
        sprite.anchor.set(0.5, 0.5);
        sprite.smoothed = false;
        sprite_deck[x][10] = sprite;
        SetupSpriteToggle(sprite_deck[x]);
    }
}

function DrawMainTitle() {
    mainTitleLine1Text = game.add.bitmapText(75, 25, 'fontBlue', 'harrier', 200);
    mainTitleLine2Text = game.add.bitmapText(75, 225, 'fontBlue', 'carrier', 200);

    game.time.events.add(Phaser.Timer.SECOND * 1, function () {
        mainTitleLine1Text.visible = false;
        mainTitleLine2Text.visible = false;
    });
}

function DrawWaveText(textOne, textTwo) {
    mainTitleLine1Text.visible = true;
    mainTitleLine1Text.text = textOne;
    mainTitleLine1Text.fontSize = 128;
    game.world.bringToTop(mainTitleLine1Text);

    game.time.events.add(Phaser.Timer.SECOND * 1, function () {
        mainTitleLine2Text.visible = true;
        mainTitleLine2Text.text = textTwo;
        mainTitleLine2Text.fontSize = 128;
        game.world.bringToTop(mainTitleLine2Text);
    });

    game.time.events.add(Phaser.Timer.SECOND * 2, function () {
        mainTitleLine1Text.visible = false;
        mainTitleLine2Text.visible = false;
    });
}

function DrawRecoveryText() {
    //todo: refactor text objects tobe reused, like main title
    recoveryAmmoText = game.add.bitmapText(100, 790, 'fontRed', 'ammo', 32);
    recoveryShieldText = game.add.bitmapText(150, 770, 'fontYellow', 'shield', 32);
    recoveryFuelText = game.add.bitmapText(200, 730, 'fontPurple', 'fuel', 32);
    recoveryBolterText = game.add.bitmapText(250, 700, 'fontBlue', 'bolter', 64);
    recoveryAmmoText.visible = false;
    recoveryShieldText.visible = false;
    recoveryFuelText.visible = false;
    recoveryBolterText.visible = false;
}

function DrawMissileHitText(x, y, color, text) {
    var missileText = game.add.bitmapText(x, y, 'font' + color, text, 32); //colour must be : Red, Purple, Yellow, Black
    game.world.bringToTop(missileText);
    game.time.events.add(Phaser.Timer.SECOND * 0.5, function () {
        missileText.destroy();
    });
}

function DrawHealthBars() {

    usaHealthBarDelta = SetFlatSprite(0, 0, 0, 'tileset', 'usa_health_delta', isoGroup);
    ussrHealthBarDelta = SetFlatSprite(736, 0, 0, 'tileset', 'ussr_health_delta', isoGroup);
    usaHealthBarDelta.scale.setTo(1, 0);
    ussrHealthBarDelta.scale.setTo(1, 0);

    usaHealthBar = SetFlatSprite(0, 0, 0, 'tileset', 'usa_health', isoGroup);
    ussrHealthBar = SetFlatSprite(736, 0, 0, 'tileset', 'ussr_health', isoGroup);
    usaHealthBar.scale.setTo(1, 400);
    ussrHealthBar.scale.setTo(1, 400);
}

function UpdateMissileUsa() {
    for (var i = 0; i < usaMissiles.length; i++) {
        var missile = usaMissiles[i];
        missile.x += game.rnd.pick([0.5, 1, 2]); //missile speed wobble

        //todo: duplicate needs refactor to function, but number a bit different
        if (missile.y > 40 + (100 * (3 - missile.slot)))
            missile.y += game.rnd.pick([0, -0.5, -0.5, -0.5, 0.5]); // hover wobble
        else if (missile.y < 30 + (100 * (3 - missile.slot)))
            missile.y += game.rnd.pick([0, -0.5, 0.5, 0.5, 0.5]); // hover wobble
        else
            missile.y += game.rnd.pick([0, -0.5, 0.5]); // hover wobble

        // if NO target present in slot, and shot not yet resolved, missile fades away
        if (missile.x >= (500 - missile.width) && missile.hit == null && ussrProfiles[missile.slot] == null) {
            missile.hit = false;
            DrawMissileFade(missile);
        }
        // if target present in slot, and shot not yet resolved
        if (missile.x >= (500 - missile.width)
            && missile.hit == null
            && ussrProfiles[missile.slot] != null) {

            //if hits
            if (game.rnd.pick([true, false])) {
                missile.hit = true;
                ussrProfiles[missile.slot][6] -= missile.damage; //missile damage to USSR health

                var isKill = false;
                //if ussr plane destroyed
                if (ussrProfiles[missile.slot][6] <= 0) {
                    isKill = true;
                    ussrProfiles[missile.slot][1].visible = false;
                    ussrProfiles[missile.slot][1].destroy;
                    ussrProfiles[missile.slot] = null;
                }

                DrawMissileHitText(missile.x + missile.width + 20, missile.y, 'Red', '-' + missile.damage.toString());
                DrawExplosion(missile.x + missile.width - 20, missile.y, isKill);
                missile.destroy(); //destroy missile
                usaMissiles.slice(i, 1);
            }
            else {
                ussrProfiles[missile.slot][3] = game.rnd.pick(['up', 'down']); //roll ussr plane that avoided missile
                ussrProfiles[missile.slot][2] = 0;   //reset roll counter
                missile.hit = false;
                DrawMissileHitText(missile.x + missile.width + 20, missile.y, 'Blue', 'miss');
                DrawMissileFade(missile);
            }
        }

        //remove missiles off screen (missed or no target in slot)
        if (missile.x == 800) {
            missile.destroy();
            usaMissiles.slice(i, 1);
        }
    }
}



function UpdateMissileUssr() {

}

function DrawMissileFade(missile) {
    var tweenMissedMissile = game.add.tween(missile);
    tweenMissedMissile.to({ alpha: 0 }, 2000, null, false);
    tweenMissedMissile.start();
    tweenMissedMissile.onComplete.add(function (sprite, tween) {
        sprite.destroy();
    });
}

function DestroyMoveIndicators() {

    if (currentPositionIndicator)
        currentPositionIndicator.destroy();
    if (currentPositionIndicatorBox)
        currentPositionIndicatorBox.destroy();
    moveIndicators.forEach(function (moveIndicator) {
        moveIndicator.destroy();
    });
}

function DestroyChosenPath() {
    if (newPositionIndicatorBox)
        newPositionIndicatorBox.destroy();
    chosenPath.forEach(function (chosenPathStep) {
        chosenPathStep.destroy();
    });
}

function DrawMoveIndicators(x, y, movingSpriteObject) {

    //todo: make more general for hangar too
    currentPositionIndicator = SetSprite(x + (0.5 * deckOffsetX), y + (0.5 * deckOffsetY), deckSpriteIsoZ - 8, 'tileset', 'blue_square', isoGroup);
    currentPositionIndicator.anchor.set(0.5, 0.5);
    currentPositionIndicator.scale.setTo(1.8, 1.8);
    currentPositionIndicator.alpha = 0.8;
    currentPositionIndicatorBox = SetSprite(x + (0.5 * deckOffsetX), y + (0.5 * deckOffsetY), deckSpriteIsoZ, 'tileset', 'blue_box', isoGroup);
    currentPositionIndicatorBox.anchor.set(0.5, 0.5);
    currentPositionIndicatorBox.scale.setTo(1.8, 1.8);
    currentPositionIndicatorBox.bringToTop();

    //see: https://github.com/qiao/PathFinding.js
    var pathGrid = new PF.Grid(4, 9);

    //cannot move to  front square of catapult
    pathGrid.setWalkableAt(3, 0, false);

    for (var i = 0; i < sprite_deck.length; i++) {
        if (isOnDeck(sprite_deck[i][9]))
            pathGrid.setWalkableAt(sprite_deck[i][2], sprite_deck[i][3], false);
    }

    var finder = new PF.AStarFinder();

    for (var xIso = 0; xIso < 4; xIso++) {
        for (var yIso = 0; yIso < 9; yIso++) {

            var gridExpendable = pathGrid.clone();
            var path = finder.findPath(movingSpriteObject[2], movingSpriteObject[3], xIso, yIso, gridExpendable);

            if (path.length > 0) {

                var sprite = SetSprite(xIso + (0.5 * deckOffsetX), yIso + (0.5 * deckOffsetY), deckSpriteIsoZ - 8, 'tileset', 'blue_square', isoGroup);
                sprite.inputEnabled = true;
                sprite.input.useHandCursor = true;
                sprite.anchor.set(0.5, 0.5);
                sprite.scale.setTo(1.8, 1.8);
                sprite.alpha = 0.5;
                sprite.xIso = xIso;
                sprite.yIso = yIso;
                sprite.path = path;
                sprite.bringToTop();

                // EVENT (move indicator click) 
                sprite.events.onInputDown.add(function (sprite) {
                    DestroyMoveIndicators();
                    DestroySpriteButtons();
                    DestroyChosenPath();

                    //set the moving sprites destination
                    movingSpriteObject[4] = sprite.xIso;
                    movingSpriteObject[5] = sprite.yIso;
                    movingSpriteObject[9] = 'move_on_deck';

                    //show projected path
                    sprite.path.forEach(function (pathStep) {
                        var spritePathChosen = SetSprite((pathStep[0]) + (0.5 * deckOffsetX), (pathStep[1]) + (0.5 * deckOffsetY), deckSpriteIsoZ - 8, 'tileset', 'green_square', isoGroup);
                        spritePathChosen.anchor.set(0.5, 0.5);
                        spritePathChosen.scale.setTo(1.8, 1.8);
                        spritePathChosen.alpha = 0.5;
                        chosenPath.push(spritePathChosen);

                        game.time.events.add(Phaser.Timer.SECOND * 0.2, function () {
                            DestroyChosenPath();
                        });
                    });
                    newPositionIndicatorBox = SetSprite(sprite.path[sprite.path.length - 1][0] + (0.5 * deckOffsetX), sprite.path[sprite.path.length - 1][1] + (0.5 * deckOffsetY), deckSpriteIsoZ, 'tileset', 'green_box', isoGroup);
                    newPositionIndicatorBox.anchor.set(0.5, 0.5);
                    newPositionIndicatorBox.scale.setTo(1.8, 1.8);


                }, this);

                moveIndicators.push(sprite);
            }
        }
    }
}

function SetupDeckToggle() {
    buttonDeckToggle = game.add.sprite(50, 900, 'tileset', tileArray[2]);
    buttonDeckToggle.inputEnabled = true;
    buttonDeckToggle.input.useHandCursor = true;
    buttonDeckToggle.bringToTop();

    // EVENT (deck toggle up / down) 
    buttonDeckToggle.events.onInputDown.add(function () {
        DestroyMoveIndicators();
        DestroySpriteButtons();
        DestroyChosenPath();
        deckMoving = true;
        deckIsUp = !deckIsUp;
    }, this);
}

function SetupLiftToggle() {

    buttonLiftToggle = game.add.sprite(270, 920, 'tileset', tileArray[2]);
    buttonLiftToggle.inputEnabled = true; //  Enables all kind of input actions on this image (click, etc)
    buttonLiftToggle.input.useHandCursor = true;
    buttonLiftToggle.bringToTop();

    //EVENT (lift toggle up / down)
    buttonLiftToggle.events.onInputDown.add(function () {
        DestroyMoveIndicators();
        DestroySpriteButtons();
        DestroyChosenPath();
        liftMoving = true;
        liftIsUp = !liftIsUp;
    }, this);
}

function SetupSpriteToggle(deckSpriteObject) {

    var type = spriteTypeArray[deckSpriteObject[0]];
    var fuel = deckSpriteObject[7];
    var sprite = deckSpriteObject[10];

    sprite.inputEnabled = true; //  Enables all kind of input actions on this image (click, etc)
    sprite.input.useHandCursor = true;

    //sprite.xCoord = deckSpriteObject[2];
    //sprite.yCoord = deckSpriteObject[3];

    //EVENT (create sprite button)
    sprite.events.onInputDown.add(function (sprite) {

        DestroySpriteButtons();
        DestroyChosenPath();
        DestroyMoveIndicators();
        DrawMoveIndicators(deckSpriteObject[2], deckSpriteObject[3], deckSpriteObject);

        if (fuel > 0 && (isHoverFlightType(type) || (isNormalFlightType(type) && isOnCatapult(deckSpriteObject[2], deckSpriteObject[3])))) {

            //add takeoff button
            spriteButton = game.add.sprite(sprite.x + 20, sprite.y, 'tileset', tileArray[2]);
            spriteButton.inputEnabled = true; //  Enables all kind of input actions on this image (click, etc)
            spriteButton.input.useHandCursor = true;
            spriteButton.bringToTop();

            //EVENT (click takeoff button)
            spriteButton.events.onInputDown.add(function () {

                DestroySpriteButtons();
                DestroyMoveIndicators();
                DestroyChosenPath();

                //todo: set return location here
                //will later find a deck space when returning

                if (isHoverFlightType(type)) {
                    SetHoverReturnLocation(deckSpriteObject);
                    deckSpriteObject[9] = 'hover_up';
                }
                if (isNormalFlightType(type)) {
                    deckSpriteObject[9] = 'ready_for_takeoff';
                    deckSpriteObject[11] = 0;
                }
            });

            spriteButtons.push(spriteButton);

        }
    }, this);
}

function DestroySpriteButtons() {
    spriteButtons.forEach(function (sb) {
        sb.destroy();
    });
    spriteButtons = [];
}

//todo: make as a more dynamic postion find to land
function SetHoverReturnLocation(spriteObject) {
    spriteObject[4] = spriteObject[2];  // go from X to Xdestination
    spriteObject[5] = spriteObject[3];// go from Y to Ydestination

}

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


function UpdateProfileStackUsa() {

    //get all in combat usa planes
    sprite_deck.forEach((spriteObject) => {
        if (spriteObject[9] == 'away_from_carrier') {
            spriteObject[9] = 'in_combat';

            var firstSlot = spriteObject[13];

            if (usaProfiles[firstSlot]) {

                //set plane to return to carrier
                var returningPlaneGuid = usaProfiles[0][4];

                sprite_deck.forEach((spriteObject) => {
                    if (spriteObject[12] == returningPlaneGuid) {
                        spriteObject[9] = 'return_to_carrier';
                        spriteObject[13] = null; //fight slot empty
                    }
                });

                //returning plane animation
                var returningPlane = game.add.sprite(350, 320, 'tileset', usaProfiles[0][0] + '_profile_level', usaProfileGroup);
                returningPlane.scale.setTo(-1, 1);
                var tweenReturningPlane = game.add.tween(returningPlane);
                tweenReturningPlane.to({ x: -100 }, 600, Phaser.Easing.Quadratic.In, false);
                tweenReturningPlane.start();
                tweenReturningPlane.onComplete.add(function (sprite, tween) {
                    sprite.destroy();
                });

                //shuffle profile stack down
                usaProfiles[0][1].destroy();
                usaProfiles[0] = usaProfiles[1];
                usaProfiles[1] = usaProfiles[2];
                usaProfiles[2] = usaProfiles[3];

                if (usaProfiles[0]) {
                    var tweenPiece1 = game.add.tween(usaProfiles[0][1]);
                    tweenPiece1.to({ y: usaProfiles[0][1].y + 100 }, 350, Phaser.Easing.Quadratic.In, false);
                    tweenPiece1.start();
                }

                if (usaProfiles[1]) {
                    var tweenPiece2 = game.add.tween(usaProfiles[1][1]);
                    tweenPiece2.to({ y: usaProfiles[1][1].y + 100 }, 350, Phaser.Easing.Quadratic.In, false);
                    tweenPiece2.start();
                }

                if (usaProfiles[2]) {
                    var tweenPiece3 = game.add.tween(usaProfiles[2][1]);
                    tweenPiece3.to({ y: usaProfiles[2][1].y + 100 }, 350, Phaser.Easing.Quadratic.In, false);
                    tweenPiece3.start();
                }

                if (usaProfiles[3]) {
                    var tweenPiece4 = game.add.tween(usaProfiles[3][1]);
                    tweenPiece4.to({ y: usaProfiles[3][1].y + 100 }, 350, Phaser.Easing.Quadratic.In, false);
                    tweenPiece4.start();
                }
            }

            var profileSprite = game.add.sprite(0, 20 + (100 * (3 - firstSlot)), 'tileset', spriteTypeArray[spriteObject[0]] + '_profile_level', usaProfileGroup);
            profileSprite.inputEnabled = true;
            profileSprite.input.useHandCursor = true;
            profileSprite.guid = spriteObject[12];
            profileSprite.type = spriteTypeArray[spriteObject[0]];

            // EVENT (return combat plane) 
            profileSprite.events.onInputDown.add(function (sprite) {

                //todo: refactor this with duplicate code above
                sprite_deck.forEach((spriteObject) => {
                    if (spriteObject[12] == sprite.guid) {
                        spriteObject[9] = 'return_to_carrier';
                        spriteObject[13] = null;
                    }
                });

                //shuffle profile stack down
                for (var i = 0; i < usaProfiles.length; i++) {
                    if (usaProfiles[i]) {
                        if (usaProfiles[i][4] == sprite.guid) {
                            usaProfiles[i][1].destroy();
                            usaProfiles[i] = null;

                            //returning plane animation
                            var returningPlane = game.add.sprite(350, 20 + (100 * (3 - i)), 'tileset', sprite.type + '_profile_level', usaProfileGroup);
                            returningPlane.scale.setTo(-1, 1);
                            var tweenReturningPlane = game.add.tween(returningPlane);
                            tweenReturningPlane.to({ x: -100 }, 600, Phaser.Easing.Quadratic.In, false);
                            tweenReturningPlane.start();
                            tweenReturningPlane.onComplete.add(function (sprite, tween) {
                                sprite.destroy();
                            });

                            //move all higher items down
                            for (var j = i; j < usaProfiles.length; j++) {
                                usaProfiles[j] = usaProfiles[j + 1];

                                if (usaProfiles[j]) {
                                    var tweenPiece = game.add.tween(usaProfiles[j][1]);
                                    tweenPiece.to({ y: usaProfiles[j][1].y + 100 }, 350, Phaser.Easing.Quadratic.In, false);
                                    tweenPiece.start();
                                }
                            }
                        }
                    }
                }
            }, this);

            //push plane to correct slot
            usaProfiles[firstSlot] =
            [
                spriteTypeArray[spriteObject[0]], //type
                profileSprite,
                0,
                'level',          //roll
                spriteObject[12], // guid
                null, // unused
                spriteObject[6],  // shield
                spriteObject[7],  // fuel
                spriteObject[8]   // ammo
            ];

            var tweenPieceIn = game.add.tween(usaProfiles[firstSlot][1]);
            tweenPieceIn.to({ x: 200 }, 350, Phaser.Easing.Quadratic.In, false);
            tweenPieceIn.start();
        }
    });

}

function UpdateUsaHealthBar(delta) {

    if (usaHealth > 0)
        usaHealth += delta;

    var healthY = (100 - usaHealth) * 4;

    if (healthY >= 400) {
        healthY = 0;
        usaHealth = 0;
        usaHealthBarDelta.visible = false;
    }

    //delta
    if (delta < 0 && usaHealth > 0) {
        usaHealthBarDelta.visible = true;
        usaHealthBarDelta.scale.setTo(1, delta * 4);
        usaHealthBarDelta.y = 400 - ((usaHealth) * 4);

        game.time.events.add(Phaser.Timer.SECOND, function () {
            usaHealthBarDelta.visible = false;
        });
    }

    usaHealthBar.scale.setTo(1, usaHealth * 4);
    usaHealthBar.y = healthY;
}
function UpdateUssrHealthBar(delta) {

    if (ussrHealth >= 0)
        ussrHealth += delta;

    var healthY = (100 - ussrHealth) * 4;

    if (healthY >= 400) {
        if (ussrHealthBar.visible)
            DrawWaveText('wave ' + ussrWave.toString(), 'destroyed');

        healthY = 0;
        ussrHealth = 0;
        ussrHealthBarDelta.visible = false;
        ussrHealthBar.visible = false;

        game.time.events.add(Phaser.Timer.SECOND * 5, function () {
            ussrHealthRecharge = true;
            ussrHealthBar.visible = true;

        });
    }

    //delta
    if (delta < 0 && ussrHealth > 0) {
        ussrHealthBarDelta.visible = true;
        ussrHealthBarDelta.scale.setTo(1, delta * 4);
        ussrHealthBarDelta.y = 400 - ((ussrHealth) * 4);

        game.time.events.add(Phaser.Timer.SECOND, function () {
            ussrHealthBarDelta.visible = false;
        });
    }

    ussrHealthBar.scale.setTo(1, ussrHealth * 4);
    ussrHealthBar.y = healthY;
}


function UpdateProfileStackUssr() {
    //type, sprite, counter, roll, unused, guid, shield, fuel, ammo
    ussrProfiles.push(['mig21', game.add.sprite(500, 320, 'tileset', 'mig21_profile_level', ussrProfileGroup), 0, 'level', guid(), null, 50, null, null]);
    ussrProfiles.push(['fulcrum', game.add.sprite(500, 220, 'tileset', 'fulcrum_profile_level', ussrProfileGroup), 0, 'level', guid(), null, 50, null, null]);
    ussrProfiles.push(['mig17', game.add.sprite(500, 120, 'tileset', 'mig17_profile_level', ussrProfileGroup), 0, 'level', guid(), null, 25, null, null]);
    ussrProfiles.push(['bear', game.add.sprite(500, 20, 'tileset', 'bear_profile_level', ussrProfileGroup), 0, 'level', guid(), null, 150, null, null]);
}

function AnimateProfile(spriteObjects, faction) {

    for (var i = 0; i < spriteObjects.length; i++) {
        //usa: type, spriteProfileObject, ?, roll, guid, shield, fuel, ammo
        if (spriteObjects[i]) {

            spriteObjects[i][2]++;
            var type = spriteObjects[i][0];
            var sprite = spriteObjects[i][1];
            var counter = spriteObjects[i][2];
            var roll = spriteObjects[i][3];  // up, level, down

            spriteObjects[i][1].loadTexture('tileset', type + '_profile_' + roll);

            if (sprite.y > 25 + (100 * (3 - i)))
                sprite.y += game.rnd.pick([0, -0.5, -0.5, -0.5, 0.5]); // hover wobble
            else if (sprite.y < 15 + (100 * (3 - i)))
                sprite.y += game.rnd.pick([0, -0.5, 0.5, 0.5, 0.5]); // hover wobble
            else
                sprite.y += game.rnd.pick([0, -0.5, 0.5]); // hover wobble

            if (counter + game.rnd.pick([0, 2, 5, -2, -5]) >= 60 && roll != 'level') {
                spriteObjects[i][3] = 'level';
                spriteObjects[i][1].loadTexture('tileset', type + '_profile_level');
                spriteObjects[i][2] = 0;
            }

            if (faction == 'usa') {
                // type, direction, x, y, destinationX, destinationY, shield, fuel, ammo, action, sprite, counter, guid, fightSlot

                var guid = spriteObjects[i][4];
                // get ref to sprite deck
                var deckArrayElement = findElement(sprite_deck, 12, guid);
                //set counter up 1
                deckArrayElement[11]++;
                //reduce fuel                
                deckArrayElement[7] -= fuelDecrease;

                //fire missiles
                if (deckArrayElement[11] == missileDelay //counter
                    && deckArrayElement[8] > 0 //has ammo 
                    && ussrProfiles[deckArrayElement[13]] //has ussr plane target
                    ) {

                    var ammoSize = GetTypeAmmoSize(spriteTypeArray[deckArrayElement[0]]);
                    deckArrayElement[11] = 0; //counter to zero
                    missileObject = SetFlatSprite(250, 350 - (100 * deckArrayElement[13]), 0, 'tileset', 'usa_missile_1', isoGroup);
                    missileObject.hit = null;
                    missileObject.damage = missileDamage * ammoSize;
                    missileObject.slot = deckArrayElement[13];
                    missileObject.scale.setTo(ammoSize, ammoSize);
                    usaMissiles.push(missileObject);

                    //reduce ammo by missiles damage
                    deckArrayElement[8] -= missileDamage;

                    if (deckArrayElement[8] < 0)
                        deckArrayElement[8] = 0;
                }



                //shield warning
                if (deckArrayElement[6] == 10) {
                    DrawMissileHitText(spriteObjects[i][1].x, spriteObjects[i][1].y, 'Yellow', 'shield');
                }


                console.log(deckArrayElement[7]);
                //fuel warning
                if (deckArrayElement[7] < 10.1 && deckArrayElement[7] > 10) { //looks like an exact number match is not good
                    DrawMissileHitText(spriteObjects[i][1].x, spriteObjects[i][1].y, 'Purple', 'fuel');
                }

                //ammo warning
                if (deckArrayElement[8] == 10 && GetTypeAmmoMax(spriteObjects[i][0]) > 0) {
                    DrawMissileHitText(spriteObjects[i][1].x, spriteObjects[i][1].y, 'Red', 'ammo');
                }



                //check if fuel empty                
                if (deckArrayElement[7] <= 0) {

                    // no fuel death animation 
                    var tweenPiece = game.add.tween(spriteObjects[i][1]);
                    tweenPiece.to({
                        x: spriteObjects[i][1].x + 300,
                        y: 400,
                        angle: 45,
                        alpha: 0

                    }, 1000, null, false);
                    tweenPiece.start();

                    tweenPiece.onComplete.add(function (sprite, tween) {
                        sprite.destroy(); //destroy the sprite                       
                    }, this);

                    //remove the plane from usa sprites profile and deck
                    deckArrayElement = null;
                    spriteObjects[i] = null;
                    usaProfiles[i] = null

                    //move all higher items down
                    for (var j = i; j < usaProfiles.length; j++) {
                        usaProfiles[j] = usaProfiles[j + 1];

                        if (usaProfiles[j]) {
                            var tweenPiece = game.add.tween(usaProfiles[j][1]);
                            tweenPiece.to({ y: usaProfiles[j][1].y + 100 }, 350, Phaser.Easing.Quadratic.In, false);
                            tweenPiece.start();
                        }
                    }
                }
                else
                    DrawGraphicsProfileUsa(
                        sprite.x,
                        sprite.y,
                        deckArrayElement[6], //shield
                        GetTypeShieldMax(type),
                        deckArrayElement[7], //fuel
                        GetTypeFuelMax(type),
                        deckArrayElement[8], //ammo
                        GetTypeAmmoMax(type));
            }
            else {
                var shield = spriteObjects[i][6];
                var shieldMax = GetTypeShieldMax(spriteObjects[i][0]);
                DrawGraphicsProfileUssr(sprite.x, sprite.y, shield, shieldMax);
            }
        }
    }
}

function DrawExplosion(x, y, isKill) {
    var explosion = SetFlatSprite(x, y, 0, 'tileset', 'explosion', isoGroup);
    if (isKill) {
        explosion.y -= 30;
        explosion.scale.setTo(3, 3);
    }
    explosion.bringToTop();
    var tweenExplosion = game.add.tween(explosion);
    tweenExplosion.to({ alpha: 0 }, isKill ? 2000 : 500, null, false);
    tweenExplosion.start();
    tweenExplosion.onComplete.add(function (sprite, tween) {
        sprite.destroy();
    }, this);

}

function DrawGraphicsProfileUssr(x, y, shield, shieldMax) {

    graphicsProfile.lineStyle(0, 0x000000, 1);
    graphicsProfile.beginFill(0xF0F000);
    graphicsProfile.drawRect(x + 130, y + 10, shield, 30);
    graphicsProfile.endFill();

    graphicsProfile.lineStyle(1, 0x000000, 1);
    graphicsProfile.drawRect(x + 130, y + 10, shieldMax, 30);

    graphicsProfile.endFill();
}

function DrawGraphicsProfileUsa(x, y, shield, shieldMax, fuel, fuelMax, ammo, ammoMax) {

    graphicsProfile.lineStyle(0, 0x000000, 1);
    graphicsProfile.beginFill(0xFF0000);
    graphicsProfile.drawRect(x - 10 - ammo, y + 10, ammo, 10);
    graphicsProfile.beginFill(0xF0F000);
    graphicsProfile.drawRect(x - 10 - shield, y + 20, shield, 10);
    graphicsProfile.beginFill(0x800080);
    graphicsProfile.drawRect(x - 10 - fuel, y + 30, fuel, 10);
    graphicsProfile.endFill();

    graphicsProfile.lineStyle(1, 0x000000, 1);
    graphicsProfile.drawRect(x - 10 - ammoMax, y + 10, ammoMax, 10);
    graphicsProfile.drawRect(x - 10 - shieldMax, y + 20, shieldMax, 10);
    graphicsProfile.drawRect(x - 10 - fuelMax, y + 30, fuelMax, 10);

    graphicsProfile.endFill();

    return graphicsProfile;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

function findElement(arr, j, propValue) {
    new PF.Grid(4, 9)
    for (var i = 0; i < arr.length; i++)
        if (arr[i][j] == propValue)
            return arr[i];

    // will return undefined if not found; you could return a default instead
}

function isHoverFlightType(type) {
    return type == 'harrier';
}
function isNormalFlightType(type) {
    return type == 'hawkeye' || type == 'tomcat';
}
function isOnCatapult(x, y) {
    return catapult[0] == x && catapult[1] == y;
}

function isOnDeck(action) {
    return action == 'sit_on_deck'
        || action == 'ready_for_takeoff'
        || action == 'takeoff'
        || action == 'move_on_deck'
        || action == 'busy_moving_on_deck';
};

function GetTypeShieldMax(type) {
    switch (type) {
        case 'harrier':
            return 50;
        case 'hawkeye':
            return 25;
        case 'tomcat':
            return 100;
        case 'seaking':
            return 75;
        case 'mig17':
            return 25;
        case 'mig21':
            return 50;
        case 'fulcrum':
            return 75;
        case 'bear':
            return 160;
    }
}
function GetTypeFuelMax(type) {
    switch (type) {
        case 'harrier':
            return 50;
        case 'hawkeye':
            return 100;
        case 'tomcat':
            return 25;
        case 'seaking':
            return 75;
    }
}
function GetTypeAmmoMax(type) {
    switch (type) {
        case 'harrier':
            return 50;
        case 'hawkeye':
            return 0;
        case 'tomcat':
            return 100;
        case 'seaking':
            return 0;
    }
}

function GetTypeAmmoSize(type) {
    switch (type) {
        case 'harrier':
            return 1;
        case 'hawkeye':
            return 0;
        case 'tomcat':
            return 1.5;
        case 'mig17':
            return 0.5;
        case 'mig21':
            return 1;
        case 'fulcrum':
            return 1.5;
        case 'bear':
            return 2;
    }
}

function GetUsaHealthDelta() {
    return game.rnd.pick([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        -5, -10]);
}

function GetUssrHealthDelta() {

    if (ussrHealth > 0 && !ussrHealthRecharge) {
        return game.rnd.pick([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            -5, -10]);
    }
    else {
        // recharge for next wave
        if (ussrHealth == 100) {
            ussrHealthRecharge = false;
            //recharge usa
            usaHealth = 100;
            DrawWaveText('get ready', 'next wave');
            //increment wave
            ussrWave++;
            return 0;
        }
        else {
            //recharge ussr over time
            return 0.5;
        }
        return 0;
    }
}

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');