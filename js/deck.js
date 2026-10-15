/*
 * Harrier Carrier - the carrier deck
 * Placing aircraft, selecting and moving them, taking off, landing and recharging.
 */

//=========================== SETUP =====================================

// Put the USA aircraft for a level on the deck (wave -1 = random level)
function PopulateDeckSprites(wave) {
    DestroySpriteDeck();
    sprite_deck = [];

    if (wave == -1) {
        usaWavesRandom[0].forEach(function (plane) {
            if (plane) {
                AddDeckAircraft(plane, false);
            }
        });
    }

    if (usaWaves[wave]) {
        usaWaves[wave].forEach(function (plane) {
            if (plane) {
                var type = spriteTypeArray[plane[0]];
                // level 2 (tutorial) and level 13 start with aircraft needing fuel, shield and ammo (except Seakings)
                var depleted = Battle.ussrWave == 1 || (Battle.ussrWave == 12 && type != 'seaking');
                AddDeckAircraft(plane, depleted);
            }
        });
    }
}

// plane: [typeIndex, direction, x, y] from the level data
function AddDeckAircraft(plane, depleted) {
    var type = spriteTypeArray[plane[0]];
    var action = (type == 'u2') ? 'away_from_carrier' : 'sit_on_deck'; // the U2 starts in the air
    var slot = GetFirstSlot();
    var aircraft = depleted ?
        createAircraft(type, plane[1], plane[2], plane[3], 100, 100, 0, action, slot) :
        createAircraft(type, plane[1], plane[2], plane[3], GetTypeShieldMax(type), GetTypeFuelMax(type), GetTypeAmmoMax(type), action, slot);
    sprite_deck.push(aircraft);
}

function DrawDeckSprites() {
    sprite_deck.forEach(DrawDeckSprite);
}

function DrawDeckSprite(aircraft) {
    var sprite;
    var frame = aircraft.type + directionArray[aircraft.direction];

    if (aircraft.type == 'u2') {
        sprite = SetSprite(-100, 400, deckSpriteIsoZ, 'tileset', frame, UI.isoGroup);
        sprite.scale.setTo(2, 2);
    }
    else {
        sprite = SetSprite(aircraft.x + (0.5 * deckOffsetX), aircraft.y + (0.5 * deckOffsetY), deckSpriteIsoZ, 'tileset', frame, UI.isoGroup);
    }
    sprite.anchor.set(0.5, 0.5);
    sprite.smoothed = false;
    aircraft.sprite = sprite;
}

function SetupDeckSprites() {
    sprite_deck.forEach(SetupSpriteToggle);
}

//=========================== SELECTING AN AIRCRAFT =====================

// Make a deck aircraft tappable: shows where it can move, its info, and the VTOL take-off button
function SetupSpriteToggle(aircraft) {
    var sprite = aircraft.sprite;
    var tutorial = Tutorial.touchIconPosition;
    var tutorialRechargeFuel = (Battle.ussrWave == 1 && tutorial == 7);
    var tutorialRechargeShield = (Battle.ussrWave == 1 && tutorial == 10);
    var tutorialRechargeAmmo = (Battle.ussrWave == 1 && (tutorial == 13 || tutorial == 19));

    if (!(IsNotTutorialLevel() || tutorialRechargeShield || tutorialRechargeAmmo || tutorialRechargeFuel || tutorial === 0)) {
        sprite.inputEnabled = false;
        return;
    }

    sprite.inputEnabled = true;
    sprite.input.useHandCursor = true;
    //attach some properties
    sprite.shieldMax = GetTypeShieldMax(aircraft.type);
    sprite.fuelMax = GetTypeFuelMax(aircraft.type);
    sprite.ammoMax = GetTypeAmmoMax(aircraft.type);
    sprite.guid = aircraft.guid;
    sprite.fuel = aircraft.fuel;
    sprite.type = aircraft.type;

    //EVENT (tap isometric aircraft)
    sprite.events.onInputDown.add(function (sprite) {
        TutorialAircraftTapped();

        game.iso.unproject(game.input.activePointer.position, cursorPos);
        DestroyAllSelections();
        UI.spriteInfoPanelGuid = sprite.guid;
        DrawMoveIndicators(aircraft);

        DrawInfoPanel(sprite.type, 'usa');
        DrawInfoPanelTitle(sprite.type);

        if (sprite.fuel > 0 && isHoverFlightType(sprite.type)) {
            DrawVtolTakeoffButton(aircraft, sprite);
        }
    }, this);
}

// The arrow over a selected VTOL aircraft that makes it take off
function DrawVtolTakeoffButton(aircraft, sprite) {
    var spriteButton = game.add.sprite(sprite.x - 35, sprite.y - 55, 'tileset', 'vtol_arrow');
    spriteButton.scale.setTo(0.8, 0.8);
    spriteButton.anchor.set(-0, 0.5);

    TutorialTakeoffButtonShown();

    spriteButton.inputEnabled = true;
    spriteButton.input.useHandCursor = true;
    spriteButton.bringToTop();

    var tutorial = Tutorial.touchIconPosition;
    if (IsNotTutorialLevel() || tutorial == 1 || tutorial == 14 || tutorial == 20) {
        //EVENT (tap take-off button)
        spriteButton.events.onInputDown.add(function () {
            DestroyAllSelections();
            aircraft.action = 'hover_up';
            TutorialTakeoffButtonTapped();
        });
    }
    else {
        spriteButton.inputEnabled = false;
    }

    UI.spriteButtons.push(spriteButton);
}

// Green squares on every deck square the aircraft can reach, plus the catapult arrow
function DrawMoveIndicators(aircraft) {
    var x = aircraft.x;
    var y = aircraft.y;
    UI.currentPositionIndicator = SetSprite(x + (0.5 * deckOffsetX), y + (0.5 * deckOffsetY), deckSpriteIsoZ - 8, 'tileset', 'green_square', UI.isoGroup);
    UI.currentPositionIndicator.anchor.set(0.5, 0.5);
    UI.currentPositionIndicator.alpha = 0.6;

    UI.currentPositionIndicatorBox = SetSprite(x + (0.5 * deckOffsetX), y + (0.5 * deckOffsetY), deckSpriteIsoZ + 5, 'tileset', 'green_box', UI.isoGroup);
    UI.currentPositionIndicatorBox.anchor.set(0.5, 0.5);
    UI.currentPositionIndicatorBox.scale.setTo(0.9, 0.9);
    UI.currentPositionIndicatorBox.bringToTop();

    //see: https://github.com/qiao/PathFinding.js
    var pathGrid = GetDeckPathGrid();
    var finder = new PF.AStarFinder();

    for (var xIso = 0; xIso < deckWidth; xIso++) {
        for (var yIso = 0; yIso < deckHeight; yIso++) {
            var path = finder.findPath(aircraft.x, aircraft.y, xIso, yIso, pathGrid.clone());
            var isConventionalFlightCatapultSquare = !isHoverFlightType(aircraft.type) && isOnCatapult(xIso, yIso);

            if (path.length > 0 || isConventionalFlightCatapultSquare) {
                DrawMoveIndicator(aircraft, xIso, yIso, path, isConventionalFlightCatapultSquare);
            }
        }
    }
}

function DrawMoveIndicator(aircraft, xIso, yIso, path, isConventionalFlightCatapultSquare) {
    var tutorialRechargeFuel = (Battle.ussrWave == 1 && Tutorial.touchIconPosition == 7 && xIso === 0 && yIso == 1);
    var tutorialRechargeShield = (Battle.ussrWave == 1 && Tutorial.touchIconPosition == 8 && xIso == 1 && yIso == 2);
    var tutorialRechargeAmmo = (Battle.ussrWave == 1 && xIso == 1 && yIso == 4 && Tutorial.touchIconPosition == 11);
    var tutorialRechargeAmmo2 = (Battle.ussrWave == 1 && xIso == 1 && yIso == 4 && Tutorial.touchIconPosition == 18);
    var tutorialRecharge = tutorialRechargeShield || tutorialRechargeAmmo || tutorialRechargeAmmo2 || tutorialRechargeFuel;

    var sprite = SetSprite(xIso + (0.5 * deckOffsetX), yIso + (0.5 * deckOffsetY), deckSpriteIsoZ - 8, 'tileset', 'green_square', tutorialRecharge ? UI.isoGroupTutorial : UI.isoGroup);
    sprite.inputEnabled = true;
    sprite.input.useHandCursor = true;
    sprite.anchor.set(0.5, 0.5);
    sprite.alpha = 0.3;
    sprite.xIso = xIso;
    sprite.yIso = yIso;
    sprite.path = path;
    sprite.parentGuid = aircraft.guid;

    if (isConventionalFlightCatapultSquare) {
        DrawCatapultTakeoffArrow(aircraft);
    }

    //EVENT (tap a move square)
    if (IsNotTutorialLevel() || tutorialRecharge) {
        sprite.tutorialRechargeShield = tutorialRechargeShield;
        sprite.tutorialRechargeAmmo = tutorialRechargeAmmo;
        sprite.tutorialRechargeAmmo2 = tutorialRechargeAmmo2;
        sprite.events.onInputDown.add(MoveIndicatorTapped, this);
    }

    UI.moveIndicators.push(sprite);
}

// Arrow over the catapult: taps send the aircraft to the catapult to launch
function DrawCatapultTakeoffArrow(aircraft) {
    var arrow = SetSprite(catapultCoords[0] + (0.5 * deckOffsetX) - 0.4, catapultCoords[1] + (0.5 * deckOffsetY) + 0.1, deckSpriteIsoZ + 20, 'tileset', 'vtol_arrow', UI.isoGroup);
    arrow.inputEnabled = true;
    arrow.input.useHandCursor = true;
    arrow.scale.setTo(0.8, 0.8);
    arrow.anchor.set(-0, 0.5);
    arrow.parentGuid = aircraft.guid;

    arrow.events.onInputDown.add(function (sprite) {
        var target = findAircraft(sprite.parentGuid);
        target.destX = catapultCoords[0];
        target.destY = catapultCoords[1];
        target.action = 'move_on_deck';
        DestroyAllSelections();
    });

    UI.spriteTakeoffArrow = arrow;
    UI.moveIndicators.push(arrow);
}

function MoveIndicatorTapped(sprite) {
    game.iso.unproject(game.input.activePointer.position, cursorPos);
    UI.graphicsStatusBars.clear();

    // isometric squares overlap: pass the tap to the square actually under the pointer
    if (!sprite.isoBounds.containsXY(cursorPos.x + cursorPosCorrection, cursorPos.y + cursorPosCorrection)) {
        RedirectSpritesOnInputDownEvent(cursorPos.x + cursorPosCorrection, cursorPos.y + cursorPosCorrection);
    }
    else {
        DestroyAllSelections();

        var aircraft = findAircraft(sprite.parentGuid);
        if (aircraft) {
            aircraft.destX = sprite.xIso;
            aircraft.destY = sprite.yIso;
            aircraft.action = 'move_on_deck';
        }
        DrawChosenPath(sprite.path);
    }

    TutorialMoveIndicatorTapped(sprite);
}

// Briefly show the path the aircraft will take, and the recharge it is heading for
function DrawChosenPath(path) {
    path.forEach(function (pathStep) {
        var spritePathChosen = SetSprite(pathStep[0] + (0.5 * deckOffsetX), pathStep[1] + (0.5 * deckOffsetY), deckSpriteIsoZ - 8, 'tileset', 'blue_square', UI.isoGroup);
        spritePathChosen.anchor.set(0.5, 0.5);
        spritePathChosen.alpha = 0.3;
        UI.chosenPath.push(spritePathChosen);

        game.time.events.add(Phaser.Timer.SECOND * 0.4, DestroyChosenPath);
    });

    var end = path[path.length - 1];
    if (!end) return; // catapult square that can't be reached right now
    var x = end[0];
    var y = end[1];
    UI.newPositionIndicatorBox = SetSprite(x + (0.5 * deckOffsetX), y + (0.5 * deckOffsetY), deckSpriteIsoZ + 5, 'tileset', 'blue_box', UI.isoGroup);
    UI.newPositionIndicatorBox.anchor.set(0.5, 0.5);
    UI.newPositionIndicatorBox.scale.setTo(0.9, 0.9);

    if (isOnFuel(x, y))
        DrawRechargeText(490, 490, 'Purple', 'FUEL', 32);
    if (isOnShield(x, y))
        DrawRechargeText(360, 550, 'Yellow', 'SHIELD', 32);
    if (isOnAmmo(x, y))
        DrawRechargeText(250, 600, 'Red', 'AMMO', 32);
}

function RedirectSpritesOnInputDownEvent(xCoord, yCoord) {
    UI.moveIndicators.forEach(function (sprite) {
        if (sprite && sprite.isoBounds.containsXY(xCoord, yCoord)) {
            sprite.events.onInputDown.dispatch(sprite, game.input.activePointer);
        }
    });
}

// Deck grid for path finding: squares occupied by aircraft are blocked
function GetDeckPathGrid() {
    var pathGrid = new PF.Grid(deckWidth, deckHeight);
    sprite_deck.forEach(function (aircraft) {
        if (isOnDeck(aircraft.action) && aircraft.x >= 0 && aircraft.y >= 0)
            pathGrid.setWalkableAt(aircraft.x, aircraft.y, false);
    });
    return pathGrid;
}

//=========================== EVERY FRAME ===============================

function RunMainLoop() {
    Battle.foxbatIntel = false;
    Battle.missileDelayUnitModifier = 0;

    for (var j = 0; j < sprite_deck.length; j++) {
        UpdateAircraft(sprite_deck[j], j);
    }
}

// Each step checks the aircraft's action itself, so an aircraft can move through
// several steps in one frame (in this order).
function UpdateAircraft(aircraft, index) {
    UpdateCombatBonuses(aircraft);
    UpdateRecharge(aircraft);

    // vertical take off
    UpdateHoverLevel(aircraft);
    UpdateHoverLeave(aircraft);

    // returning
    UpdateReturnToCarrier(aircraft);
    UpdateHoverReturn(aircraft);
    UpdateHoverLevelReturn(aircraft);
    UpdateHoverDown(aircraft);

    // catapult take off
    UpdateReadyForTakeoff(aircraft);
    UpdateCatapultLaunch(aircraft);
    UpdateCatapultCrash(aircraft, index);
    UpdateTakeoffComplete(aircraft);

    // cable landing
    UpdateLanding(aircraft, index);
    UpdateCrashing(aircraft, index);

    UpdateHoverUp(aircraft);

    // moving on deck
    UpdateDeckMovement(aircraft);
    UpdateReadyForTakeoffAfterMove(aircraft);
}

// Hawkeyes in combat speed up everyone's missiles; a Foxbat defector in combat gives intel
function UpdateCombatBonuses(aircraft) {
    if (aircraft.type == 'hawkeye' && aircraft.action == 'in_combat') {
        Battle.missileDelayUnitModifier++;
    }
    if (aircraft.type == 'foxbat_defect' && aircraft.action == 'in_combat' && !Battle.foxbatIntel) {
        Battle.foxbatIntel = true;
    }
}

//----------------------------- recharging

function UpdateRecharge(aircraft) {
    if (aircraft.action != 'sit_on_deck' && aircraft.action != 'move_on_deck') {  //hack, status should be sit_on_deck when finished moving
        return;
    }

    if (isOnShield(aircraft.x, aircraft.y)) {
        RechargeResource(aircraft, 'shield', GetTypeShieldMax(aircraft.type), shieldRefreshRate, 'Yellow', 'SHIELD');
        if (aircraft.shield == GetTypeShieldMax(aircraft.type) - shieldRefreshRate) {
            DrawRechargeText(aircraft.sprite.x - 80, aircraft.sprite.y - 100, 'Yellow', '+', 256);
            TutorialRechargeComplete(9, 10);
        }
    }
    if (isOnFuel(aircraft.x, aircraft.y)) {
        RechargeResource(aircraft, 'fuel', GetTypeFuelMax(aircraft.type), fuelRefreshRate, 'Purple', 'FUEL');
        if (aircraft.fuel == GetTypeFuelMax(aircraft.type) - fuelRefreshRate) {
            DrawRechargeText(aircraft.sprite.x - 80, aircraft.sprite.y - 100, 'Purple', '+', 256);
            TutorialRechargeComplete(6, 7);
        }
    }
    if (isOnAmmo(aircraft.x, aircraft.y)) {
        RechargeResource(aircraft, 'ammo', GetTypeAmmoMax(aircraft.type), ammoRefreshRate, 'Red', 'AMMO');
        if (aircraft.ammo == GetTypeAmmoMax(aircraft.type) - ammoRefreshRate) {
            DrawRechargeText(aircraft.sprite.x - 80, aircraft.sprite.y - 100, 'Red', '+', 256);
            TutorialRechargeComplete(12, 13);
            TutorialRechargeComplete(18, 19);
        }
    }
}

// Add one refresh step (kept in step with the refresh rate so the '+' texts line up)
function RechargeResource(aircraft, resource, max, refreshRate, color, label) {
    if (aircraft[resource] < max) {
        aircraft[resource] += refreshRate - (aircraft[resource] % refreshRate);
        if (aircraft[resource] % 200 === 0)
            DrawRechargeText(aircraft.sprite.x - 30, aircraft.sprite.y - 80, color, label, 32);
        else if (aircraft[resource] % 10 === 0)
            DrawRechargeText(aircraft.sprite.x - 10 + game.rnd.pick([0, 15, 30, -15, -30]), aircraft.sprite.y - 20, color, '+', 32);
    }
}

//----------------------------- vertical take off

function UpdateHoverUp(aircraft) {
    if (aircraft.action != 'hover_up') return;

    aircraft.x = 0;
    aircraft.y = 0;
    aircraft.destX = 0;
    aircraft.destY = 0;
    aircraft.sprite.inputEnabled = false;
    aircraft.sprite.useHandCursor = false;
    // rise from the deck to hover height (Z 200) in TAKEOFF.vtolRise frames
    aircraft.sprite.isoZ += ((200 - deckSpriteIsoZ) / TAKEOFF.vtolRise) * Speed.tweenInverseMultiplier;
    if (aircraft.sprite.isoZ >= 200) { //hover limit
        aircraft.action = 'hover_level';
        aircraft.counter = 0;
    }
}

function UpdateHoverLevel(aircraft) {
    if (aircraft.action != 'hover_level') return;

    aircraft.sprite.isoZ += game.rnd.pick([0, -0.5, 0.5]); // hover wobble
    aircraft.counter += Speed.tweenInverseMultiplier;
    if (aircraft.counter >= TAKEOFF.vtolHover) {
        aircraft.action = 'hover_leave';
        aircraft.counter = 0;
    }
}

function UpdateHoverLeave(aircraft) {
    if (aircraft.action != 'hover_leave') return;

    aircraft.sprite.bringToTop();
    aircraft.counter += Speed.tweenInverseMultiplier; //counter increases leaving speed (accelerates)
    MoveSpriteForward(aircraft.sprite, aircraft.direction, 1.6 * aircraft.counter * Speed.tweenInverseMultiplier);

    // left carrier and is off screen
    if (aircraft.counter >= TAKEOFF.vtolLeave) {
        aircraft.counter = null;
        LeaveCarrier(aircraft);
        TurnAboutOffScreen(aircraft);
    }
}

// Move an isometric sprite in the direction it faces
function MoveSpriteForward(sprite, direction, distance) {
    if (direction === 0) sprite.isoY -= distance; // north
    if (direction == 1) sprite.isoX += distance;  // east
    if (direction == 2) sprite.isoY += distance;  // south
    if (direction == 3) sprite.isoX -= distance;  // west
}

// Once off screen, face back towards the carrier ready to return
function TurnAboutOffScreen(aircraft) {
    var sprite = aircraft.sprite;
    if (aircraft.direction === 0) {
        sprite.isoY = 0;
        aircraft.direction = 2;
    }
    else if (aircraft.direction == 1) {
        sprite.isoX = 1500;
        aircraft.direction = 3;
    }
    else if (aircraft.direction == 2) {
        sprite.isoY = 1500;
        aircraft.direction = 0;
    }
    else if (aircraft.direction == 3) {
        sprite.isoX = -100;
        aircraft.direction = 1;
    }
    else {
        return;
    }
    sprite.loadTexture('tileset', aircraft.type + directionArray[aircraft.direction]);
}

// The aircraft has left the carrier: it joins the battle stack next frame
function LeaveCarrier(aircraft) {
    aircraft.action = 'away_from_carrier';
    aircraft.slot = GetFirstSlot();
}

//----------------------------- returning to the carrier

function UpdateReturnToCarrier(aircraft) {
    if (aircraft.action != 'return_to_carrier') return;

    if (isNormalFlightType(aircraft.type)) {
        aircraft.action = 'landing';
        aircraft.counter = 0;
        //set landing start position
        aircraft.sprite.isoX = 725;
        aircraft.sprite.isoY = 1900;
        aircraft.sprite.isoZ = 200;
        aircraft.sprite.bringToTop();

        //set recovery line it will hit (0 = bolter, the U2 never lands)
        aircraft.sprite.recoveryLine = (aircraft.type == 'u2') ? 0 : PickRecoveryLine();
    }

    if (isHoverFlightType(aircraft.type)) {
        SetHoverReturn(aircraft);

        //north-south, shift plane onto correct line to land
        if (aircraft.direction === 0 || aircraft.direction == 2) {
            aircraft.sprite.isoX = ((aircraft.destX * 2) + 1.5 + deckOffsetX) * isoBaseSize;
        }
        //east-west, shift plane onto correct line to land
        if (aircraft.direction == 1 || aircraft.direction == 3) {
            aircraft.sprite.isoY = ((aircraft.destY * 2) + 1.5 + deckOffsetY) * isoBaseSize;
        }
    }
}

// Bolter (0) with bolterChance, otherwise cable 1, 2 or 3 with equal odds
function PickRecoveryLine() {
    var r = game.rnd.frac();
    if (r < bolterChance) return 0;
    return Math.min(3, 1 + Math.floor((r - bolterChance) / (1 - bolterChance) * 3));
}

// Choose where a returning VTOL aircraft lands: the recharge pad it needs most, else any free square
function SetHoverReturn(aircraft) {
    aircraft.action = 'hover_return';

    var shield = aircraft.shield;
    var fuel = aircraft.fuel;
    var ammo = aircraft.ammo;

    var shieldAvailable = isDeckSpaceAvailable(shieldCoords[0], shieldCoords[1]);
    var fuelAvailable = isDeckSpaceAvailable(fuelCoords[0], fuelCoords[1]);
    var ammoAvailable = isDeckSpaceAvailable(ammoCoords[0], ammoCoords[1]);

    var shieldNeeded = shield < GetTypeShieldMax(aircraft.type);
    var fuelNeeded = fuel < GetTypeFuelMax(aircraft.type);
    var ammoMax = GetTypeAmmoMax(aircraft.type);
    var ammoNeeded = (ammoMax === 0) ? false : ammo < ammoMax;

    var landOn = null;
    if (fuelAvailable && fuelNeeded && fuel <= shield && fuel <= ammo) landOn = fuelCoords;
    else if (shieldAvailable && shieldNeeded && shield <= fuel && shield <= ammo) landOn = shieldCoords;
    else if (ammoAvailable && ammoNeeded && ammo <= fuel && ammo <= shield) landOn = ammoCoords;
    else if (fuelAvailable && fuelNeeded) landOn = fuelCoords;
    else if (shieldAvailable && shieldNeeded) landOn = shieldCoords;
    else if (ammoAvailable && ammoNeeded) landOn = ammoCoords;

    if (landOn) {
        SetDeckPosition(aircraft, landOn[0], landOn[1]);
        return;
    }

    // any free square that is not the catapult, catapult track, a recharge pad, runway or lift
    for (var xIso = 0; xIso < deckWidth; xIso++) {
        for (var yIso = 0; yIso < deckHeight; yIso++) {
            if (!isOnCatapult(xIso, yIso) &&
                !isOnCatapultTrack(xIso, yIso) &&
                !isOnShield(xIso, yIso) &&
                !isOnAmmo(xIso, yIso) &&
                !isOnFuel(xIso, yIso) &&
                !isOnRunway(xIso, yIso) &&
                !isOnLift(xIso, yIso) &&
                isDeckSpaceAvailable(xIso, yIso)
            ) {
                SetDeckPosition(aircraft, xIso, yIso);
                return;
            }
        }
    }
}

function SetDeckPosition(aircraft, x, y) {
    aircraft.x = x;
    aircraft.y = y;
    aircraft.destX = x;
    aircraft.destY = y;
}

// Fly in towards the landing square, slowing down
function UpdateHoverReturn(aircraft) {
    if (aircraft.action != 'hover_return') return;

    var sprite = aircraft.sprite;
    var targetX = ((2 * aircraft.destX) + deckOffsetX + 1.5) * isoBaseSize;
    var targetY = ((2 * aircraft.destY) + deckOffsetY + 1.5) * isoBaseSize;
    var delta = 0;

    if (aircraft.direction === 0) { // from north
        delta = Speed.tweenInverseMultiplier * 0.04 * (sprite.isoY - targetY) + 1;
        sprite.isoY -= delta;
    }
    if (aircraft.direction == 1) { // from east
        delta = Speed.tweenInverseMultiplier * 0.04 * (targetX - sprite.isoX) + 1;
        sprite.isoX += delta;
    }
    if (aircraft.direction == 2) { // from south
        delta = Speed.tweenInverseMultiplier * 0.04 * (targetY - sprite.isoY) + 1;
        sprite.isoY += delta;
    }
    if (aircraft.direction == 3) { // from west
        delta = Speed.tweenInverseMultiplier * 0.04 * (sprite.isoX - targetX) + 1;
        sprite.isoX -= delta;
    }

    if (delta < 1.02) {
        aircraft.action = 'hover_level_return';
        aircraft.counter = 0;
    }
}

function UpdateHoverLevelReturn(aircraft) {
    if (aircraft.action != 'hover_level_return') return;

    aircraft.sprite.isoZ += game.rnd.pick([0, -0.5, 0.5]); // hover wobble
    aircraft.counter += 1;
    if (aircraft.counter >= 40 * Speed.tweenMultiplier) {
        aircraft.action = 'hover_down';
        aircraft.counter = null;
    }
}

function UpdateHoverDown(aircraft) {
    if (aircraft.action != 'hover_down') return;

    aircraft.sprite.isoZ -= 2 * Speed.tweenInverseMultiplier;
    if (aircraft.sprite.isoZ <= deckSpriteIsoZ) { // landed
        aircraft.action = 'sit_on_deck';
        aircraft.counter = 0;
        aircraft.sprite.inputEnabled = true;
    }
}

//----------------------------- catapult take off

function UpdateReadyForTakeoff(aircraft) {
    if (aircraft.action == 'ready_for_takeoff' && aircraft.counter === 0) {
        aircraft.direction = 0;  //head north
        aircraft.sprite.loadTexture('tileset', aircraft.type + '_n');
        aircraft.sprite.inputEnabled = false;
        aircraft.sprite.useHandCursor = false;
        aircraft.counter = 1;
    }

    //delay the catapult launch
    if (aircraft.action == 'ready_for_takeoff' && aircraft.counter < TAKEOFF.catapultWait) {
        aircraft.counter += Speed.tweenInverseMultiplier;
    }
}

function UpdateCatapultLaunch(aircraft) {
    if ((aircraft.action == 'ready_for_takeoff' || aircraft.action == 'takeoff') && aircraft.counter >= TAKEOFF.catapultWait && aircraft.counter < TAKEOFF.catapultWait + TAKEOFF.catapultRun) {
        aircraft.action = 'takeoff';
        aircraft.counter += Speed.tweenInverseMultiplier;
        aircraft.sprite.isoX += 10 * Speed.tweenInverseMultiplier;
        aircraft.sprite.isoZ += 10 * Speed.tweenInverseMultiplier;
    }
}

// Launching into an aircraft parked on the catapult track destroys both
function UpdateCatapultCrash(aircraft, index) {
    // checked once, as the counter passes 35 (it steps by the game speed)
    var counter = aircraft.counter;
    if (!((aircraft.action == 'ready_for_takeoff' || aircraft.action == 'takeoff') && counter >= 35 && counter - Speed.tweenInverseMultiplier < 35)) return;

    for (var k = 0; k < sprite_deck.length; k++) {
        var other = sprite_deck[k];
        if (other && isOnCatapultTrack(other.x, other.y) && k != index) {
            aircraft.x = null;
            aircraft.y = null;
            other.x = null;
            other.y = null;

            aircraft.action = 'dead';
            other.action = 'dead';
            aircraft.sprite.kill();
            other.sprite.kill();

            DrawFire(aircraft.sprite.x - 20, aircraft.sprite.y - 50, 2);
        }
    }
}

function UpdateTakeoffComplete(aircraft) {
    if (aircraft.action == 'takeoff' && aircraft.counter >= TAKEOFF.catapultWait + TAKEOFF.catapultRun) {
        aircraft.counter = 0;
        LeaveCarrier(aircraft);
    }
}

//----------------------------- cable landing

function UpdateLanding(aircraft, index) {
    if (aircraft.action != 'landing') return;

    aircraft.counter++;

    //delay before checking and setting a crash
    if (aircraft.counter >= 50 * Speed.tweenMultiplier) {
        CheckLandingCollision(aircraft, index);
    }

    var sprite = aircraft.sprite;
    var deltaRecovery = (aircraft.type == 'u2') ? 20 : Speed.tweenInverseMultiplier * 0.02 * (sprite.isoY - (14 + (2 * sprite.recoveryLine) + deckOffsetY) * isoBaseSize) + 1;
    sprite.isoY -= deltaRecovery;
    sprite.isoZ -= 0.02 * Speed.tweenInverseMultiplier;

    if (deltaRecovery < 2 && !Battle.landingSequenceRunning) {
        Battle.landingSequenceRunning = true;
        ShowRecoveryCable(aircraft);
    }

    // caught a cable: park on the runway square for that cable
    if (deltaRecovery < 1.02 && sprite.recoveryLine !== 0) {
        aircraft.action = 'sit_on_deck';
        aircraft.counter = 0;
        sprite.inputEnabled = true;

        aircraft.x = 1;
        aircraft.y = 4 + sprite.recoveryLine;

        sprite.isoX = (aircraft.x + (0.5 * (deckOffsetX + 1.5))) * isoGameSize;
        sprite.isoY = (aircraft.y + (0.5 * (deckOffsetY + 1.5))) * isoGameSize;
        sprite.isoZ = deckSpriteIsoZ;
    }
    // bolter: missed every cable, so take off again
    if (deltaRecovery < 1.02 && sprite.recoveryLine === 0) {
        aircraft.action = 'ready_for_takeoff';
        aircraft.counter = 31;
    }
    // the U2 just flies over
    if (aircraft.type == 'u2' && aircraft.counter == 60) {
        aircraft.action = 'ready_for_takeoff';
        aircraft.counter = 30;
    }
}

// A landing aircraft crashes into one sitting on the runway square of the cable it will catch
function CheckLandingCollision(aircraft, index) {
    var sprite = aircraft.sprite;
    for (var m = 0; m < sprite_deck.length; m++) {
        var other = sprite_deck[m];
        if (!other || m == index || !isOnDeck(other.action)) continue; //cannot collide with self

        var collisionOccurs = false;
        var parked = other.x == 1 && other.action == 'sit_on_deck';
        if (parked && other.y == 7) {
            collisionOccurs = true;
            sprite.recoveryLine = 3;
        }
        else if (parked && other.y == 6 && sprite.recoveryLine <= 2) {
            collisionOccurs = true;
            sprite.recoveryLine = 2;
        }
        else if (parked && other.y == 5 && sprite.recoveryLine <= 1) {
            collisionOccurs = true;
            sprite.recoveryLine = 1;
        }

        if (collisionOccurs) {
            aircraft.action = 'crashing';
            sprite.collisionDeckAircraftGuid = other.guid;
            sprite.collisionIsoX = other.sprite.isoX;
            sprite.collisionIsoY = other.sprite.isoY;
        }
    }
}

// Show which cable was caught (and give its bonus), or 'bolter' if none
function ShowRecoveryCable(aircraft) {
    var line = aircraft.sprite.recoveryLine;
    var isU2 = aircraft.type == 'u2';

    var fuelText = UI.recoveryFuelText;
    var shieldText = UI.recoveryShieldText;
    var ammoText = UI.recoveryAmmoText;

    // cables are, nearest first: 1 fuel, 2 shield, 3 ammo. The caught cable gives its bonus and is shown big.
    // (texts for cables beyond the one caught are not shown, so are left as they are)
    switch (line) {
        case 0:
            SetRecoveryText(fuelText, 'FUEL', false);
            SetRecoveryText(shieldText, 'SHIELD', false);
            SetRecoveryText(ammoText, 'ammo', false);
            break;
        case 1:
            aircraft.fuel = Math.min(aircraft.fuel + recoveryLineBonus, GetTypeFuelMax(aircraft.type));
            fuelText.hit = true;
            SetRecoveryText(fuelText, 'FUEL +' + (recoveryLineBonus / 10), true);
            SetRecoveryText(shieldText, 'SHIELD', false);
            SetRecoveryText(ammoText, 'ammo', false);
            break;
        case 2:
            aircraft.shield = Math.min(aircraft.shield + recoveryLineBonus, GetTypeShieldMax(aircraft.type));
            shieldText.hit = true;
            SetRecoveryText(shieldText, 'SHIELD +' + (recoveryLineBonus / 10), true);
            SetRecoveryText(ammoText, 'ammo', false);
            break;
        case 3:
            aircraft.ammo = Math.min(aircraft.ammo + recoveryLineBonus, GetTypeAmmoMax(aircraft.type));
            ammoText.hit = true;
            SetRecoveryText(ammoText, 'ammo +' + (recoveryLineBonus / 10), true);
            break;
    }

    if (isU2) return;

    var cableTime = function (cable) { return (line == cable ? 1500 : 1000) * Speed.tweenMultiplier; };

    game.time.events.add(Phaser.Timer.SECOND * 0.2, function () {
        FadeRecoveryText(ammoText, { x: 100 }, cableTime(3));
    });
    if (line != 3) {
        game.time.events.add(Phaser.Timer.SECOND * 0.4, function () {
            FadeRecoveryText(shieldText, { alpha: 0 }, cableTime(2));
        });
    }
    if (line != 3 && line != 2) {
        game.time.events.add(Phaser.Timer.SECOND * 0.6, function () {
            FadeRecoveryText(fuelText, { alpha: 0 }, cableTime(1));
        });
    }
    if (line === 0) {
        game.time.events.add(Phaser.Timer.SECOND * 0.8, function () {
            UI.recoveryBolterText.visible = true;
            UI.recoveryBolterText.alpha = 1;
            var tweenBolter = game.add.tween(UI.recoveryBolterText);
            tweenBolter.to({ alpha: 0 }, 1500 * Speed.tweenMultiplier, Phaser.Easing.Linear.None, false, 0);
            tweenBolter.start();
            tweenBolter.onComplete.add(function (sprite) {
                sprite.visible = false;
                Battle.landingSequenceRunning = false;
            });
        });
    }
}

function SetRecoveryText(text, label, caught) {
    text.fontSize = caught ? 64 : 32;
    text.alpha = caught ? 1 : 0.5;
    text.text = label;
}

function FadeRecoveryText(text, to, duration) {
    text.visible = true;
    var tween = game.add.tween(text);
    tween.to(to, duration, Phaser.Easing.Linear.None, false, 0);
    tween.start();
    tween.onComplete.add(function (sprite) {
        sprite.visible = false;
        if (sprite.hit) {
            Battle.landingSequenceRunning = false;
        }
    });
}

function UpdateCrashing(aircraft, index) {
    if (aircraft.action != 'crashing') return;

    var sprite = aircraft.sprite;
    var deltaCrashing = Speed.tweenInverseMultiplier * 0.02 * (sprite.isoY - (16 + (2 * sprite.recoveryLine) + deckOffsetY) * isoBaseSize) + 1;
    sprite.isoY -= deltaCrashing;
    sprite.isoZ -= 0.02 * Speed.tweenInverseMultiplier;

    if (deltaCrashing < 1.2) {
        var other = findAircraft(sprite.collisionDeckAircraftGuid);

        other.sprite.kill();
        other.action = 'dead';
        other.x = -1;
        other.y = -1;
        other.destX = -1;
        other.destY = -1;

        aircraft.action = 'dead';
        sprite.kill();

        DrawFire(sprite_deck[index].sprite.x, sprite_deck[index].sprite.y - 60, 6);
    }
}

//----------------------------- moving on deck

function UpdateDeckMovement(aircraft) {
    //catch a moving plane that's 'dead' and make it properly dead, to stop blocking grid spots
    if (aircraft.action == 'move_on_deck' && (aircraft.destX == -1 || aircraft.destY == -1 || aircraft.shield === 0))
        aircraft.action = 'dead';

    if (!(aircraft.action == 'move_on_deck' && aircraft.x >= 0 && aircraft.y >= 0 && aircraft.destX >= 0 && aircraft.destY >= 0)) return;

    //see: https://github.com/qiao/PathFinding.js
    var pathGridDeck = GetDeckPathGrid();
    var finder = new PF.AStarFinder();
    var destinationAvailable = true;
    var pathChosen = finder.findPath(aircraft.x, aircraft.y, aircraft.destX, aircraft.destY, pathGridDeck.clone());

    // destination occupied: path to it anyway so we can approach it
    if (pathChosen.length <= 1) {
        destinationAvailable = false;
        var gridToOccupied = pathGridDeck.clone();
        gridToOccupied.setWalkableAt(aircraft.destX, aircraft.destY, true);
        pathChosen = finder.findPath(aircraft.x, aircraft.y, aircraft.destX, aircraft.destY, gridToOccupied);
    }

    // move one square along the path (if the destination is reachable, or we can approach it)
    if (pathChosen.length > 2 || (pathChosen.length > 1 && destinationAvailable)) {
        MoveOneSquare(aircraft, pathChosen[1][0], pathChosen[1][1]);
    }
}

function MoveOneSquare(aircraft, nextX, nextY) {
    var sprite = aircraft.sprite;
    var isoX = sprite.isoX + (nextX - aircraft.x) * isoGameSize;
    var isoY = sprite.isoY + (nextY - aircraft.y) * isoGameSize;

    // face the way it is moving
    if (aircraft.y > nextY) aircraft.direction = 0; // north
    if (aircraft.x < nextX) aircraft.direction = 1; // east
    if (aircraft.y < nextY) aircraft.direction = 2; // south
    if (aircraft.x > nextX) aircraft.direction = 3; // west

    sprite.loadTexture('tileset', aircraft.type + directionArray[aircraft.direction]);
    sprite.guid = aircraft.guid;
    aircraft.x = nextX;
    aircraft.y = nextY;
    aircraft.action = 'busy_moving_on_deck';

    sprite.xTo = aircraft.x;
    sprite.yTo = aircraft.y;

    var tweenPieceDirection = game.add.tween(sprite);
    tweenPieceDirection.to({ isoX: isoX, isoY: isoY }, 500 * Speed.tweenMultiplier, null, false);
    tweenPieceDirection.start();

    tweenPieceDirection.onComplete.add(function (sprite) {
        var moved = findAircraft(sprite.guid);
        moved.action = 'move_on_deck';
        moved.x = sprite.xTo;
        moved.y = sprite.yTo;

        //has reached destination
        if (moved.x == moved.destX && moved.y == moved.destY)
            moved.action = 'sit_on_deck';

        // arrived on the catapult: launch
        if (IsCatapultLaunch(moved.fuel, moved.x, moved.y, moved.destX, moved.destY)) {
            moved.action = isNormalFlightType(moved.type) ? 'ready_for_takeoff' : 'hover_up';
            moved.counter = 0;
        }
    }, this);
}

function UpdateReadyForTakeoffAfterMove(aircraft) {
    if (aircraft.action == 'ready_for_takeoff' && aircraft.counter === 0) {
        aircraft.direction = 0;  //head north
        aircraft.sprite.loadTexture('tileset', aircraft.type + '_n');
        aircraft.counter = 1;
    }
}

//=========================== DESTROY ===================================

function DestroySpriteDeck() {
    sprite_deck.forEach(function (aircraft) {
        if (aircraft) {
            aircraft.sprite.destroy();
        }
    });
    sprite_deck = [];
}

function DestroyMoveIndicators() {
    if (UI.currentPositionIndicator) {
        UI.currentPositionIndicator.destroy();
    }
    if (UI.currentPositionIndicatorBox) {
        UI.currentPositionIndicatorBox.destroy();
    }
    UI.moveIndicators.forEach(function (moveIndicator) {
        moveIndicator.destroy();
    });
    UI.moveIndicators = [];
}

function DestroyChosenPath() {
    if (UI.newPositionIndicatorBox) {
        UI.newPositionIndicatorBox.destroy();
    }
    UI.chosenPath.forEach(function (chosenPathStep) {
        chosenPathStep.destroy();
    });
    UI.chosenPath = [];
}

function DestroySpriteButtons() {
    UI.spriteButtons.forEach(function (button) {
        button.destroy();
    });
    UI.spriteButtons = [];
}
