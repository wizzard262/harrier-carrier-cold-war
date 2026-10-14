/*
 * Harrier Carrier - the battle
 * The USA battle stack (usaProfiles) facing the USSR attackers (ussrProfiles), and the missiles between them.
 * Slot 0 is the lowest altitude, slot 3 the highest; a plane can only hit the plane opposite it.
 */

// Profile sprite y position for a slot
function SlotY(slot) {
    return 20 + (100 * (3 - slot));
}

//=========================== USA BATTLE STACK ==========================

// Aircraft that have just left the carrier join the battle stack at their slot.
// If that slot is taken (the stack is full) the lowest plane is sent home and everyone moves down.
function UpdateProfileStackUsa() {
    sprite_deck.forEach(function (aircraft) {
        if (aircraft.action != 'away_from_carrier') return;

        aircraft.action = 'in_combat';
        var firstSlot = aircraft.slot;

        if (usaProfiles[firstSlot]) {
            SendLowestProfileHome();
        }

        var profileSprite = game.add.sprite(0, SlotY(firstSlot), 'tileset', aircraft.type + '_profile_level', UI.usaProfileGroup);
        profileSprite.inputEnabled = true;
        profileSprite.input.useHandCursor = true;
        profileSprite.guid = aircraft.guid;
        profileSprite.type = aircraft.type;

        var chevronSprite = game.add.sprite(0, SlotY(firstSlot), 'tileset', 'nothing', UI.usaProfileGroup);
        var chevronBlueSprite = game.add.sprite(0, SlotY(firstSlot), 'tileset', 'nothing', UI.usaProfileGroup);

        if (IsNotTutorialLevel()) {
            //EVENT (tap a plane in the battle stack to send it home)
            profileSprite.events.onInputDown.add(function (sprite) {
                ReturnToCarrier(sprite.guid);
            }, this);
        }

        usaProfiles[firstSlot] = createUsaProfile(aircraft.type, profileSprite, aircraft.guid, chevronSprite, chevronBlueSprite);

        // fly in from the left
        var tweenPieceIn = game.add.tween(profileSprite);
        tweenPieceIn.to({ x: 130 }, 350 * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, false);
        tweenPieceIn.start();
        tweenPieceIn.onComplete.add(function (sprite) {
            if (sprite.type == 'foxbat_defect') {
                ShuffleProfileFoxbatDown(aircraft.guid);
            }
        });
    });
}

// Send the plane with this guid back to the carrier, and close the gap in the stack
function ReturnToCarrier(guidValue) {
    sprite_deck.forEach(function (aircraft) {
        if (aircraft.guid == guidValue) {
            aircraft.action = 'return_to_carrier';
            aircraft.slot = null;
        }
    });
    ShuffleProfileStackDown(guidValue);
}

// The stack is full: the plane in slot 0 returns to the carrier and the others move down a slot
function SendLowestProfileHome() {
    var lowest = usaProfiles[0];

    if (lowest) {
        sprite_deck.forEach(function (aircraft) {
            if (aircraft.guid == lowest.guid) {
                aircraft.action = 'return_to_carrier';
                aircraft.slot = null; //fight slot empty
            }
        });
        DrawReturningPlane(lowest.type, 320);
    }
    DestroyUsaChevron(0);

    if (lowest) {
        findAircraft(lowest.guid).slot = null;
        lowest.sprite.destroy();
        lowest.chevron.destroy();
        lowest.chevronBlue.destroy();

        usaProfiles[0] = usaProfiles[1];
        usaProfiles[1] = usaProfiles[2];
        usaProfiles[2] = usaProfiles[3];

        for (var slot = 0; slot < 3; slot++) {
            if (usaProfiles[slot]) {
                findAircraft(usaProfiles[slot].guid).slot = slot;
                TweenProfileDown(usaProfiles[slot].sprite, 1);
            }
        }
        if (usaProfiles[3]) {
            TweenProfileDown(usaProfiles[3].sprite, 1);
        }
    }
}

// A defecting Foxbat drops to the lowest empty slot below it
function ShuffleProfileFoxbatDown(guidValue) {
    var lowestEmptySlot = null;

    for (var i = 0; i < usaProfiles.length; i++) {
        if (usaProfiles[i] && usaProfiles[i].guid == guidValue) {
            for (var j = i; j >= 0; j--) {
                if (typeof (usaProfiles[j]) == 'undefined' || usaProfiles[j] === null) {
                    lowestEmptySlot = j;
                }
            }
            if (lowestEmptySlot !== null && lowestEmptySlot !== undefined) {
                TweenProfileDown(usaProfiles[i].sprite, i - lowestEmptySlot);
                usaProfiles[lowestEmptySlot] = usaProfiles[i];
                usaProfiles[i] = null;
                findAircraft(usaProfiles[lowestEmptySlot].guid).slot = lowestEmptySlot;
            }
        }
    }
}

// Remove the plane with this guid from the stack, and move the planes above it down
function ShuffleProfileStackDown(guidValue) {
    for (var i = 0; i < usaProfiles.length; i++) {
        if (usaProfiles[i] && usaProfiles[i].guid == guidValue) {

            var aircraft = findAircraft(guidValue);
            aircraft.slot = null;

            usaProfiles[i].sprite.destroy();
            usaProfiles[i].chevron.destroy();
            usaProfiles[i].chevronBlue.destroy();
            usaProfiles[i] = null;

            if (aircraft.shield > 0) { //if still alive
                DrawReturningPlane(aircraft.type, SlotY(i));
            }

            //move all higher items down
            for (var j = i; j < usaProfiles.length; j++) {
                usaProfiles[j] = usaProfiles[j + 1];
                if (usaProfiles[j]) {
                    findAircraft(usaProfiles[j].guid).slot = j;
                    TweenProfileDown(usaProfiles[j].sprite, 1);
                }
            }
        }
    }
}

//=========================== EVERY FRAME ===============================

// Animate one side of the battle: barrel rolls, fuel use, firing, special abilities
function AnimateProfile(profiles, faction) {
    DestroySprites(UI.hawkEyeChevrons);
    DestroySprites(UI.seakingJammers);
    DestroySprites(UI.foxbatIntelMorseCodes);

    if (faction == 'usa' && profiles.length > 0) {
        TutorialStackAnimated();
    }

    for (var i = 0; i < profiles.length; i++) {

        if (faction == 'ussr') {
            DrawFoxbatIntelText(i);
        }

        var profile = profiles[i];
        if (profile !== null && profile !== undefined && profile.type !== null && profile.type !== undefined) {
            AnimateProfileRoll(profile, i);

            if (faction == 'usa') {
                AnimateUsaProfile(profiles, i);
            }
            else if (faction == 'ussr') {
                AnimateUssrProfile(profiles, i, profile.sprite);
            }
        }
    }
}

// Barrel roll after dodging a missile, and a gentle hover
function AnimateProfileRoll(profile, slot) {
    profile.rollCounter++;
    var sprite = profile.sprite;
    var counter = profile.rollCounter;
    var roll = profile.roll;  // up, level, down

    SetFrame(sprite, profile.type + '_profile_' + roll);
    sprite.y = GetHoverWobble(sprite.y, slot, 10, -10);

    if (counter + game.rnd.pick([0, 2, 5, -2, -5]) >= 60 && roll != 'level') {
        profile.roll = 'level';
        SetFrame(sprite, profile.type + '_profile_level');
        profile.rollCounter = 0;
    }
}

function DrawFoxbatIntelText(slot) {
    var text = UI.foxbatIntelTexts[slot];
    text.visible = false;

    if (Battle.foxbatIntel) {
        var intel = GetIntel(3 - slot);
        if (intel && game.rnd.pick([true, true, true, false, false])) {
            text.text = intel;
            text.visible = true;
        }
    }
}

function AnimateUsaProfile(profiles, i) {
    var type = profiles[i].type;
    var sprite = profiles[i].sprite;
    var aircraft = findAircraft(profiles[i].guid);
    if (!aircraft) return;

    var ammoSize = GetTypeAmmoSize(aircraft.type);
    if (ammoSize && aircraft.counter <= 400) //todo: to be dynamic
        aircraft.counter++;

    aircraft.fuel -= (Battle.ussrWave == 1) ? 0 : fuelDecrease * Speed.tweenInverseMultiplier; //use fuel, except in tutorial level 2

    TutorialOutOfAmmo(aircraft);

    var isBullet = (ammoSize == 0.25);
    var missileDelay = GetTypeMissileDelay(aircraft.type) - ((isBullet) ? 0 : Battle.missileDelayUnitModifier);
    missileDelay = (missileDelay === 0 && !isBullet) ? 0.5 : missileDelay;  //make sure missile delay floor is not zero

    if (aircraft.counter * Speed.tweenInverseMultiplier >= usaMissileDelaySize * missileDelay && // reloaded
        aircraft.ammo > 0 &&
        ussrProfiles[aircraft.slot] && // has a target
        ussrProfiles[aircraft.slot].missileCounter >= 0  // target has arrived (delay at wave start)
    ) {
        FireUsaMissile(aircraft, profiles[i], ammoSize, isBullet);
    }

    // bingo fuel warning
    if (aircraft.fuel < 102 && aircraft.fuel > 100) { //an exact number match does not work
        aircraft.fuel = 100;
        DrawMissileHitText(profiles[i].sprite.x, profiles[i].sprite.y, 'Purple', 'bingo', 32);
    }

    if (aircraft.fuel <= 0) {
        DitchAircraft(profiles, i, aircraft);
        return;
    }
    else
        DrawStatusBarsUsa(
            sprite.x,
            sprite.y,
            aircraft.shield,
            GetTypeShieldMax(type),
            aircraft.fuel,
            GetTypeFuelMax(type),
            aircraft.ammo,
            GetTypeAmmoMax(type),
            UI.graphicsProfile);

    //if is armed aircraft type & has health & has fuel
    if (GetTypeAmmoSize(type) == 0.25 && aircraft && aircraft.shield > 0 && aircraft.fuel > 0)
        DrawBulletChevrons(i, aircraft.counter, usaMissileDelaySize, aircraft.ammo, sprite.x, sprite.y);
    else if (GetTypeAmmoSize(type) > 0 && aircraft && aircraft.shield > 0 && aircraft.fuel > 0)
        DrawUsaMissileChevrons(i, aircraft.counter, usaMissileDelaySize, GetTypeMissileDelay(aircraft.type), Battle.missileDelayUnitModifier, aircraft.ammo, sprite.x, sprite.y);

    if (aircraft !== null && aircraft !== undefined) {
        AnimateHawkeyeRadar(aircraft, profiles[i]);
        AnimateSeakingJammer(aircraft, profiles[i]);
        AnimateFoxbatMorseCode(aircraft, profiles[i]);
    }
}

function FireUsaMissile(aircraft, profile, ammoSize, isBullet) {
    aircraft.counter = 0;

    //only bullets recoil
    if (GetTypeAmmoSize(aircraft.type) === 0.25) {
        var profileSprite = profile.sprite;
        profileSprite.x = 130;
        var tweenRecoil = game.add.tween(profileSprite);
        tweenRecoil.to({ x: profileSprite.x - 15 }, 100 * Speed.tweenMultiplier, Phaser.Easing.Linear.None, true);
        tweenRecoil.start();

        tweenRecoil.onComplete.add(function () {
            tweenRecoil = game.add.tween(profileSprite);
            tweenRecoil.to({ x: profileSprite.x + 15 }, 500 * Speed.tweenMultiplier, Phaser.Easing.Linear.None, true, 100);
        });
    }

    var missile = SetFlatSprite(200, 350 - (100 * aircraft.slot - ((isBullet) ? 10 : 0)), 0, 'tileset', 'usa_missile_1', UI.isoGroup);
    missile.hit = null;
    missile.damage = usaMissileDamage * ammoSize;
    missile.slot = aircraft.slot;
    missile.scale.setTo(ammoSize, ammoSize);
    missile.isBullet = isBullet;
    usaMissiles.push(missile);

    //reduce ammo by missile damage (or bullet damage)
    aircraft.ammo -= usaMissileDamage * ammoSize;
    if (aircraft.ammo < 0)
        aircraft.ammo = 0;
}

// Out of fuel: the plane falls into the sea, and the planes above move down
function DitchAircraft(profiles, i, aircraft) {
    aircraft.shield = 0;
    aircraft.action = 'ditched';

    var tweenPieceDeath = game.add.tween(profiles[i].sprite);
    tweenPieceDeath.to({
        x: profiles[i].sprite.x + 300,
        y: 400,
        angle: 25,
        alpha: 0
    }, 1000 * Speed.tweenMultiplier, null, false);
    tweenPieceDeath.start();
    tweenPieceDeath.onComplete.add(function (sprite) {
        sprite.destroy();
    }, this);

    DestroyUsaChevron(i);

    // losing the U2 loses the level
    if (aircraft.type == 'u2') {
        Defeat(2, true);
    }

    profiles[i] = null;
    usaProfiles[i] = null;

    //move all higher items down
    for (var j = i; j < usaProfiles.length; j++) {
        usaProfiles[j] = usaProfiles[j + 1];
        if (usaProfiles[j]) {
            findAircraft(usaProfiles[j].guid).slot -= 1;
            TweenProfileDown(usaProfiles[j].sprite, 1);
        }
    }
}

// Hawkeye radar pulse: blue chevrons spreading out from the plane
function AnimateHawkeyeRadar(aircraft, profile) {
    if (aircraft.type != 'hawkeye') return;

    aircraft.counter++;
    if (aircraft.counter <= 0.4 * usaMissileDelaySize) {
        var left = SetFlatSprite(profile.sprite.x + 30 - aircraft.counter, profile.sprite.y + 1, 0, 'tileset', 'chevron_5_5_blue');
        left.scale.setTo(-0.7, 0.7);
        left.bringToTop();
        UI.hawkEyeChevrons.push(left);

        var right = SetFlatSprite(profile.sprite.x + 80 + aircraft.counter, profile.sprite.y + 1, 0, 'tileset', 'chevron_5_5_blue');
        right.scale.setTo(0.7, 0.7);
        right.bringToTop();
        UI.hawkEyeChevrons.push(right);
    }
    else if (aircraft.counter >= 1 * usaMissileDelaySize) {
        aircraft.counter = 0;
    }
}

// Seaking jamming signal
function AnimateSeakingJammer(aircraft, profile) {
    if (aircraft.type != 'seaking') return;

    aircraft.counter++;
    if (aircraft.counter <= 0.4 * usaMissileDelaySize) {
        var jammer = SetFlatSprite(profile.sprite.x + 100 + aircraft.counter, profile.sprite.y + 20, 0, 'tileset', 'radar_jammer');
        jammer.scale.setTo(1.5, 1.5);
        jammer.bringToTop();
        UI.seakingJammers.push(jammer);
    }
    else if (aircraft.counter >= 1 * usaMissileDelaySize) {
        aircraft.counter = 0;
    }
}

// Foxbat defector flashing SOS while it reports intel
function AnimateFoxbatMorseCode(aircraft, profile) {
    if (aircraft.type != 'foxbat_defect' || !Battle.foxbatIntel) return;

    if (aircraft.counter == 50 || aircraft.counter == 100 || aircraft.counter == 150 || aircraft.counter == 201) {
        var morse = SetFlatSprite(profile.sprite.x + 50, profile.sprite.y, 0, 'tileset', 'sos');
        morse.scale.setTo(1, 1);
        morse.bringToTop();

        var tweenMorse = game.add.tween(morse);
        tweenMorse.to({ visible: false }, 500, Phaser.Easing.Quadratic.In, false);
        tweenMorse.start();
        tweenMorse.onComplete.add(function (sprite) {
            sprite.visible = false;
            sprite.destroy();
        });
    }
}

//=========================== USSR ATTACKERS ============================

function AnimateUssrProfile(profiles, i, sprite) {
    if (profiles[i].type == 'foxbat_defecting') {
        UpdateDefectingFoxbat(profiles, i, sprite);
    }
    if (!profiles[i]) return;

    var profile = profiles[i];
    var shield = profile.shield;
    var shieldMax = GetTypeShieldMax(profile.type);
    profile.missileCounter++;

    if (GetTypeAmmoSize(profile.type) > 0)
        DrawUssrMissileChevrons(i, profile.missileCounter, ussrMissileDelaySize, GetTypeMissileDelay(profile.type), profile.sprite.x, profile.sprite.y);

    if (profile.type == 'foxbat') {
        CheckFoxbatDefection(profiles, i, sprite);
    }

    if (profile.type != 'foxbat_defecting') {
        DrawStatusBarsUssr(sprite.x, sprite.y, shield, shieldMax, UI.graphicsStatusBars);

        if (profile.missileCounter * Speed.tweenInverseMultiplier >= (GetTypeMissileDelay(profile.type) * ussrMissileDelaySize)) {
            FireUssrMissile(profile, i);
        }
    }
}

// A Foxbat alone in its sub-wave, opposite an empty USA slot, defects after a while
function CheckFoxbatDefection(profiles, i, sprite) {
    var foxbatIsolated = true;
    for (var x = 0; x < profiles.length; x++) {
        if (x != i && profiles[x] !== null && profiles[x] !== undefined)
            foxbatIsolated = false;
    }

    if (foxbatIsolated && (typeof (usaProfiles[i]) == 'undefined' || usaProfiles[i] === null)) {
        profiles[i].rollCounter += 1 * Speed.tweenInverseMultiplier;
        if (profiles[i].rollCounter >= 800) {
            profiles[i].rollCounter = 0;
            profiles[i].type = 'foxbat_defecting';
            DrawMissileHitText(sprite.x, sprite.y, 'Blue', 'DEFECTING', 32);
            DestroyUssrChevron(i);
        }
    }
}

// The defecting Foxbat flies across, then joins the USA side as a new aircraft
function UpdateDefectingFoxbat(profiles, i, sprite) {
    if (sprite.x > 0) {
        sprite.x -= 5 * Speed.tweenInverseMultiplier;
    }
    if (sprite.x <= 0) {
        Battle.ussrWaveHealth -= profiles[i].shield;

        profiles[i].sprite.destroy();
        profiles[i] = null;

        var foxbatDefector = createAircraft('foxbat_defect', 0, -10, -10, 750, 250, 750, 'away_from_carrier', i);
        DrawDeckSprite(foxbatDefector);
        SetupSpriteToggle(foxbatDefector);
        sprite_deck.push(foxbatDefector);
    }
}

function FireUssrMissile(profile, slot) {
    profile.missileCounter = 0;
    var isBullet = false;
    var ammoSize = GetTypeAmmoSize(profile.type);
    var missile = SetFlatSprite(445, 350 - (100 * slot - ((isBullet) ? 10 : 0)), 0, 'tileset', 'ussr_missile_1', UI.isoGroup);
    missile.hit = null;
    missile.damage = ussrMissileDamage * ammoSize;
    missile.slot = slot;
    missile.scale.setTo(ammoSize, ammoSize);
    missile.isBullet = isBullet;
    ussrMissiles.push(missile);
}

// Send in a USSR sub-wave
function UpdateUssrSubWave(wave, subwave) {
    var currentSubWaveArray = (wave == -1) ? ussrWavesRandom[0][subwave] : ussrWaves[wave][subwave];

    ussrProfiles = [];

    //reverse list so runs from top to bottom
    for (var i = currentSubWaveArray.length - 1; i >= 0; i--) {
        var type = currentSubWaveArray[i];
        if (!type) {
            ussrProfiles.push(null);
            continue;
        }

        var sprite = game.add.sprite(700, 20 + (i * 100), 'tileset', type + '_profile_level', UI.ussrProfileGroup);
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
        sprite.type = type;
        sprite.missileDelay = GetTypeMissileDelay(type);
        sprite.slot = currentSubWaveArray.length - 1 - i;

        //EVENT (tap a USSR plane: show its info)
        sprite.events.onInputDown.add(function (sprite) {
            DestroyAllSelections();
            DrawInfoPanel(sprite.type, 'ussr');
            DrawInfoPanelTitle(sprite.type);
            DrawMissileChevronStatusBar(sprite.missileDelay, 'ussr');
            UI.infoPanelTextFireRate.x = 500;
            UI.infoPanelTextFireRate.text = (sprite.missileDelay == 1) ? ":BULLET DELAY" : ":MISSILE DELAY";
            UI.infoPanelText2.text = GetTypeText2(sprite.type);
            UI.infoPanelText3.text = GetTypeText3(sprite.type);
            UI.spriteInfoPanelSlot = sprite.slot;
        });

        var chevronSprite = game.add.sprite(600, SlotY(sprite.slot), 'tileset', 'nothing', UI.ussrProfileGroup);

        ussrProfiles.push(createUssrProfile(type, sprite, chevronSprite));

        // fly in from the right after a pause (the Bear lumbers in slowly)
        var tweenIn = game.add.tween(sprite);
        tweenIn.to({ x: 430 }, ((type == 'bear') ? 4000 : 600) * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, true, 4000);
    }
}

//=========================== MISSILES ==================================

function UpdateMissileUsa() {
    for (var i = 0; i < usaMissiles.length; i++) {
        var missile = usaMissiles[i];
        var target = ussrProfiles[missile.slot];

        if (missile.isBullet) {
            missile.x += 2 * Speed.tweenInverseMultiplier;
        }
        else {
            missile.x += game.rnd.pick(missileSpeedArray) * Speed.tweenInverseMultiplier; //missile speed wobble
            missile.y = GetHoverWobble(missile.y, missile.slot, 40, 30);
        }

        // no target in the slot: the missile fades away
        if (missile.x >= (460 - missile.width) && missile.hit === null && target === null) {
            missile.hit = false;
            DrawMissileFade(missile);
        }

        if (missile.x >= (450 - missile.width) && missile.hit === null && target !== null && target !== undefined) {
            //bullets and the first level always hit; in the tutorial (level 2) only after relaunching
            if (((game.rnd.pick(missileHitArray) || missile.isBullet || Battle.ussrWave === 0) && Battle.ussrWave != 1) ||
                (Battle.ussrWave == 1 && Tutorial.touchIconPosition > 20)) {
                UsaMissileHit(missile);
            }
            else {
                // the USSR plane dodges with a barrel roll
                target.roll = game.rnd.pick(['up', 'down']);
                target.rollCounter = 0;
                missile.hit = false;
                DrawMissileHitText(missile.x + missile.width + 20, missile.y, 'Blue', 'miss', 32);
                DrawMissileFade(missile);
            }
        }

        //remove missiles off screen (missed or no target in slot)
        if (missile.x >= 800) {
            missile.destroy();
        }
    }
    usaMissiles = RemoveDestroyed(usaMissiles);
}

// Missiles destroyed (or faded out) are dropped from the list
function RemoveDestroyed(sprites) {
    return sprites.filter(function (sprite) {
        return sprite.alive;
    });
}

function UsaMissileHit(missile) {
    var target = ussrProfiles[missile.slot];
    missile.hit = true;
    target.shield -= missile.damage;
    Battle.ussrHealthDelta = (missile.damage == 75) ? 100 : missile.damage; // A-10 bullets count extra on the USSR health bar
    var isKill = false;

    if (target.shield <= 0) {
        isKill = true;
        DestroyUssrChevron(missile.slot);
        var tweenDestroyed = game.add.tween(target.sprite);
        tweenDestroyed.to({ alpha: 0 }, 500 * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, false);
        tweenDestroyed.start();
        tweenDestroyed.onComplete.add(function (sprite) {
            sprite.visible = false;
            sprite.destroy();
        });
        ussrProfiles[missile.slot] = null;
    }

    DrawMissileHitText(missile.x + missile.width + 20, missile.y, 'Red', '-' + (missile.damage / 10).toString(), 32);
    DrawExplosion(missile.x + missile.width - 20, missile.y, isKill, (isKill) ? 3 : 1);

    if (Battle.ussrWaveHealth - Battle.ussrHealthDelta > 0) {
        CameraFlash();
        if (!missile.isBullet) {
            CameraShake();
            CloudsSlide(missile.slot, 'usa');
        }
    }

    missile.destroy();
}

function UpdateMissileUssr() {
    for (var i = 0; i < ussrMissiles.length; i++) {
        var missile = ussrMissiles[i];

        if (missile.isBullet) {
            missile.x += 2 * Speed.tweenInverseMultiplier;
        }
        else {
            missile.x -= game.rnd.pick(missileSpeedArray) * Speed.tweenInverseMultiplier; //missile speed wobble
            missile.y = GetHoverWobble(missile.y, missile.slot, 40, 30);
        }

        var target = usaProfiles[missile.slot];
        if (missile.x <= 250 && missile.hit === null && target !== null && target !== undefined) {

            // a Seaking jams half the missiles aimed at it
            var missileBlocked = false;
            if (target.type == 'seaking') {
                missileBlocked = game.rnd.pick([0, 1]) == 1;
            }

            if (missileBlocked) {
                missile.hit = false;
                DrawMissileHitText(missile.x + 10, missile.y, 'Blue', 'JAMMED', 32);
                DrawMissileDrop(missile);
            }
            else if ((game.rnd.pick(missileHitArray) || missile.isBullet) && Battle.ussrWave !== 1) { //in tutorial level 2 we cannot be damaged
                UssrMissileHit(missile);
            }
            else {
                target.roll = game.rnd.pick(['up', 'down']);
                target.rollCounter = 0;
                missile.hit = false;
                DrawMissileHitText(missile.x + 10, missile.y, 'Blue', 'miss', 32);
                DrawMissileFade(missile);
            }
        }

        // missed every plane: hits the carrier
        if (missile.x <= 0 && missile.hit === null) {
            missile.hit = true;
            Battle.usaHealthDelta = missile.damage;

            DrawMissileHitText(missile.x + 10, missile.y, 'Red', '-' + (missile.damage / 10).toString(), 32);
            DrawExplosion(missile.x + 10, missile.y, false, 1);

            CameraFlash();
            if (!missile.isBullet) {
                CameraShake();
                CloudsSlide(missile.slot, 'ussr');
            }

            missile.destroy();
        }
    }
    ussrMissiles = RemoveDestroyed(ussrMissiles);
}

function UssrMissileHit(missile) {
    missile.hit = true;
    var guidValue = usaProfiles[missile.slot].guid;
    var aircraft = findAircraft(guidValue);
    var isKill = false;

    if (aircraft) {
        aircraft.shield -= missile.damage;

        if (aircraft.shield <= 0) {
            var type = aircraft.type;
            isKill = true;

            var tweenDestroyed = game.add.tween(usaProfiles[missile.slot].sprite);
            tweenDestroyed.to({ alpha: 0 }, 500 * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, false);
            tweenDestroyed.start();
            tweenDestroyed.onComplete.add(function () {
                ShuffleProfileStackDown(guidValue);
            });

            aircraft.action = 'dead';

            // losing the U2 loses the level
            if (type == 'u2') {
                Defeat(2, true);
            }
        }
    }

    DrawMissileHitText(missile.x + 20, missile.y, 'Red', '-' + (missile.damage / 10).toString(), 32);
    DrawExplosion(missile.x - 20, missile.y, isKill, (isKill) ? 3 : 1);

    CameraFlash();
    if (!missile.isBullet) {
        CameraShake();
        CloudsSlide(missile.slot, 'ussr');
    }

    missile.destroy();
}

//=========================== DESTROY ===================================

// Destroy every sprite in the array and empty it
function DestroySprites(sprites) {
    sprites.forEach(function (sprite) {
        sprite.destroy();
    });
    sprites.length = 0;
}

function DestroyUsaChevron(profileSlot) {
    if (usaProfiles[profileSlot]) {
        usaProfiles[profileSlot].chevron.loadTexture('tileset', 'nothing');
        usaProfiles[profileSlot].chevronBlue.loadTexture('tileset', 'nothing');
    }
}

function DestroyUssrChevron(profileSlot) {
    if (ussrProfiles[profileSlot]) {
        ussrProfiles[profileSlot].chevron.loadTexture('tileset', 'nothing');
    }
}

// Everyone in the battle stack returns to the carrier
function DestroyUsaProfiles() {
    for (var i = 0; i < usaProfiles.length; i++) {
        if (usaProfiles[i]) {
            DrawReturningPlane(usaProfiles[i].type, SlotY(i));
            usaProfiles[i].sprite.loadTexture('tileset', 'nothing');
        }
    }
    usaProfiles = [null, null, null, null];
}

function DestroyUssrProfiles() {
    ussrProfiles.forEach(function (profile) {
        if (profile) {
            profile.sprite.loadTexture('tileset', 'nothing');
            profile.sprite.destroy();
        }
    });
    ussrProfiles = [null, null, null, null];
}

function DestroyMissiles(missiles) {
    missiles.forEach(function (missile) {
        if (missile.alive) {
            missile.loadTexture('tileset', 'nothing');
            missile.destroy();
        }
    });
}

function DestroyUsaMissiles() {
    DestroyMissiles(usaMissiles);
    usaMissiles = [];
}

function DestroyUssrMissiles() {
    DestroyMissiles(ussrMissiles);
    ussrMissiles = [];
}
