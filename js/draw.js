/*
 * Harrier Carrier - drawing
 * Sprites, text, effects, health bars and the info panel.
 */

//=========================== SPRITE HELPERS ============================

// Isometric sprite at deck-grid position (x, y) in units of isoGameSize
function SetSprite(x, y, z, tileAtlas, tileName, group) {
    return game.add.isoSprite((x * isoGameSize) + (1.5 * isoBaseSize), (y * isoGameSize) + (1.5 * isoBaseSize), z, tileAtlas, tileName, group);
}

// Flat (screen space) sprite
function SetFlatSprite(x, y, z, tileAtlas, tileName, group) {
    return game.add.sprite(x, y, tileAtlas, tileName, group);
}

// Small random vertical drift of a battle-stack profile, kept within its slot
function GetHoverWobble(y, slot, yMax, yMin) {
    if (y > yMax + (100 * (3 - slot)))
        y += game.rnd.pick([0, -0.5, -0.5, -0.5, 0.5]);
    else if (y < yMin + (100 * (3 - slot)))
        y += game.rnd.pick([0, -0.5, 0.5, 0.5, 0.5]);
    else
        y += game.rnd.pick([0, -0.5, 0.5]);

    return y;
}

//=========================== SCENERY ===================================

function DrawSea() {
    var xOffset = 5.5;
    var yOffset = 4;

    for (var y = 0; y < tiles_sea.length; y++) {
        for (var x = 0; x < tiles_sea[y].length; x++) {
            var tileValue = tiles_sea[y][x];
            if (tileValue !== 0) {
                var tile = SetSprite((0.5 * x) + xOffset, (0.5 * y) + yOffset, 0, 'tileset', 'mask_' + tileValue, UI.isoGroup);
                tile.anchor.set(0.5, 0.5);
                tile.smoothed = false;
                water.push(tile);
            }
        }
    }
}

function AnimateWater() {
    var gameTimeNow = game.time.now;
    water.forEach(function (w) {
        w.isoZ = (10 * Math.sin((gameTimeNow - (w.isoY * 9)) * 0.001 * Speed.tweenInverseMultiplier)) + (-1 * Math.sin((gameTimeNow + (w.isoX * 30)) * 0.002)) - 85;
    });
}

// Slide the cloud strip behind a battle-stack slot when a missile hits
function CloudsSlide(missileSlot, faction) {
    var cloudSprite = [UI.cloud_4, UI.cloud_3, UI.cloud_2, UI.cloud_1][missileSlot];

    //reset cloud to default before sliding
    cloudSprite.x = -50;

    var x = (faction == 'ussr') ? -50 : 50;

    var tweenCloudOut = game.add.tween(cloudSprite);
    var tweenCloudIn = game.add.tween(cloudSprite);
    tweenCloudOut.to({ x: cloudSprite.x + x }, 100 * Speed.tweenMultiplier, Phaser.Easing.Linear.None, true);
    tweenCloudOut.onComplete.add(function () {
        tweenCloudIn.to({ x: cloudSprite.x - x }, 1500 * Speed.tweenMultiplier, Phaser.Easing.Linear.None, true, 500);
    });

    //ensure cloud returns to starting position to prevent it staying misplaced after a tug-of-war
    tweenCloudIn.onComplete.add(function (sprite) {
        sprite.x = -50;
    });
}

function CameraShake() {
    game.camera.shake(0.02, 100);
}

function CameraFlash() {
    game.camera.flash(0xFF0000, 100);
}

// Occasional head-up display flicker over the sky
function DrawHud() {
    UI.hudCounter++;
    if (UI.hudCounter >= hudCounterThreshold) {
        UI.hudCounter = 0;
        var hudSprite = UI.hudSprite;
        hudSprite.x = 100;
        hudSprite.y = 0;
        hudSprite.alpha = 0;
        hudSprite.visible = true;
        hudSprite.bringToTop();

        var tweenHudFloat = game.add.tween(hudSprite);
        tweenHudFloat.to({ alpha: 1, x: 100 + game.rnd.pick(hudFloatDirection), y: 0 + game.rnd.pick(hudFloatDirection) }, 200, null, false);
        tweenHudFloat.start();
        tweenHudFloat.onComplete.add(function (sprite) {
            var tweenHudFloat2 = game.add.tween(sprite);
            tweenHudFloat2.to({ alpha: 0.5, x: sprite.x + game.rnd.pick(hudFloatDirection), y: sprite.y + game.rnd.pick(hudFloatDirection) }, 300, null, false);
            tweenHudFloat2.start();
            tweenHudFloat2.onComplete.add(function (sprite) {
                var tweenHudFloat3 = game.add.tween(sprite);
                tweenHudFloat3.to({ alpha: 0, x: sprite.x + game.rnd.pick(hudFloatDirection), y: sprite.y + game.rnd.pick(hudFloatDirection) }, 800, null, false);
                tweenHudFloat3.start();
                tweenHudFloat3.onComplete.add(function (sprite) {
                    sprite.visible = false;
                    sprite.alpha = 0;
                });
            });
        });
    }
}

//=========================== EFFECTS ===================================

function DrawExplosion(x, y, isKill, scale) {
    var explosion = SetFlatSprite(x, y, 0, 'tileset', 'explosion', UI.isoGroup);
    if (isKill) {
        explosion.y -= 30;
    }
    explosion.scale.setTo(scale, scale);
    explosion.bringToTop();
    var tweenExplosion = game.add.tween(explosion);
    tweenExplosion.to({ alpha: 0 }, (isKill ? 2000 : 500) * Speed.tweenMultiplier, null, false);
    tweenExplosion.start();
    tweenExplosion.onComplete.add(function (sprite) {
        sprite.destroy();
    }, this);
}

function DrawDefeatExplosions() {
    for (var i = 0; i < 200; i++) {
        game.time.events.add(Phaser.Timer.SECOND * (0.02 * i), function () {
            DrawExplosion(
                game.rnd.pick([0, 80, 160, 240, 320, 400, 480, 560, 640]),
                game.rnd.pick([0, 120, 240, 360, 480, 600, 720, 840, 960]),
                game.rnd.pick([true, false]),
                game.rnd.pick([3, 4, 5, 6, 7, 8, 9]));
        });
    }
}

// Fire on the deck after a crash
function DrawFire(x, y, seconds) {
    var fireAnimation = UI.fireAnimation;
    fireAnimation.visible = true;
    fireAnimation.alpha = 1;
    fireAnimation.x = x;
    fireAnimation.y = y;
    fireAnimation.animations.play('flames', 6, true);
    fireAnimation.bringToTop();

    game.time.events.add(Phaser.Timer.SECOND * seconds, function () {
        fireAnimation.visible = false;
    });
}

function DrawMissileFade(missile) {
    var tweenMissedMissile = game.add.tween(missile);
    tweenMissedMissile.to({ alpha: 0 }, 2000 * Speed.tweenMultiplier, null, false);
    tweenMissedMissile.start();
    tweenMissedMissile.onComplete.add(function (sprite) {
        sprite.destroy();
    });
}

// A missile jammed by a Seaking falls into the sea
function DrawMissileDrop(missile) {
    missile.sendToBack();
    var tweenMissedMissile = game.add.tween(missile);
    tweenMissedMissile.to({ y: 500, angle: 50 }, 1500 * Speed.tweenMultiplier, null, false);
    tweenMissedMissile.start();
    tweenMissedMissile.onComplete.add(function (sprite) {
        sprite.destroy();
    });
}

// A plane flying back to the carrier, leaving the battle stack to the left
function DrawReturningPlane(type, y) {
    var returningPlane = game.add.sprite(350, y, 'tileset', type + '_profile_level', UI.usaProfileGroup);
    returningPlane.scale.setTo(-1, 1);
    var tweenReturningPlane = game.add.tween(returningPlane);
    tweenReturningPlane.to({ x: -100 }, 600 * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, false);
    tweenReturningPlane.start();
    tweenReturningPlane.onComplete.add(function (sprite) {
        sprite.destroy();
    });
}

// Move a battle-stack profile down one slot
function TweenProfileDown(sprite, slots) {
    var tweenPieceDown = game.add.tween(sprite);
    tweenPieceDown.to({ y: sprite.y + (100 * slots) }, 350 * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, false);
    tweenPieceDown.start();
}

//=========================== TEXT ======================================

// Short-lived text, e.g. 'miss', '-30', 'JAMMED'
function DrawMissileHitText(x, y, color, text, size) {
    var missileText = game.add.bitmapText(x, y, 'font' + color, text, size); //colour must be : Red, Purple, Yellow, Blue
    game.world.bringToTop(missileText);
    game.time.events.add(Phaser.Timer.SECOND * 0.5, function () {
        missileText.destroy();
    });
}

// Text that floats up and fades, e.g. '+' while recharging
function DrawRechargeText(x, y, color, text, size) {
    var rechargeText = game.add.bitmapText(x, y, 'font' + color, text, size); //colour must be : Red, Purple, Yellow, Blue
    game.world.bringToTop(rechargeText);

    var tweenRechargeText = game.add.tween(rechargeText);
    tweenRechargeText.to({ alpha: 0, y: y - 100 }, 2000 * Speed.tweenMultiplier, null, false);
    tweenRechargeText.start();
    tweenRechargeText.onComplete.add(function (sprite) {
        sprite.destroy();
    });
}

function DrawMainTitle() {
    UI.mainTitleLine1Text = game.add.bitmapText(120, 25, 'fontBlue', '   harrier', 96);
    UI.mainTitleLine2Text = game.add.bitmapText(120, 125, 'fontBlue', '   carrier', 96);
    UI.mainTitleLine3Text = game.add.bitmapText(120, 225, 'fontRed', '', 96);
    UI.cold_war.visible = true;
    game.time.events.add(Phaser.Timer.SECOND * 4, function () {
        HideMainTitle();
        UI.cold_war.visible = false;
    });
}

function HideMainTitle() {
    UI.mainTitleLine1Text.visible = false;
    UI.mainTitleLine2Text.visible = false;
    UI.mainTitleLine3Text.visible = false;
}

// Big three-line title, e.g. 'alert / status / DEFCON 3', shown line by line
function DrawWaveText(textOne, textTwo, textThree) {
    HideMainTitle();

    UI.mainTitleLine1Text.visible = true;
    UI.mainTitleLine1Text.text = textOne;
    game.world.bringToTop(UI.mainTitleLine1Text);

    game.time.events.add(Phaser.Timer.SECOND * 0.7, function () {
        UI.mainTitleLine2Text.visible = UI.mainTitleLine1Text.visible; //if Text1 is off, so is this
        UI.mainTitleLine2Text.text = textTwo;
        game.world.bringToTop(UI.mainTitleLine2Text);
    });

    if (textThree !== '') {
        game.time.events.add(Phaser.Timer.SECOND * 1.4, function () {
            UI.mainTitleLine3Text.visible = UI.mainTitleLine1Text.visible; //if Text1 is off, so is this
            UI.mainTitleLine3Text.text = textThree;
            game.world.bringToTop(UI.mainTitleLine3Text);
        });
    }

    game.time.events.add(Phaser.Timer.SECOND * 2, HideMainTitle);
}

// Texts shown when a plane catches (or misses) a recovery cable
function DrawRecoveryText() {
    UI.recoveryAmmoText = game.add.bitmapText(100, 690, 'fontRed', 'ammo', 32);
    UI.recoveryShieldText = game.add.bitmapText(150, 670, 'fontYellow', 'shield', 32);
    UI.recoveryFuelText = game.add.bitmapText(200, 630, 'fontPurple', 'fuel', 32);
    UI.recoveryBolterText = game.add.bitmapText(250, 600, 'fontBlue', 'bolter', 64);
    UI.recoveryAmmoText.visible = false;
    UI.recoveryShieldText.visible = false;
    UI.recoveryFuelText.visible = false;
    UI.recoveryBolterText.visible = false;
}

// Foxbat defector intel: the type of the next attacker in each slot
function DrawFoxbatIntel() {
    var ys = [360, 260, 160, 60];
    ys.forEach(function (y) {
        var text = game.add.bitmapText(670, y, 'fontBlue', '', 24);
        text.visible = false;
        UI.foxbatIntelTexts.push(text);
    });
    game.world.bringToTop(UI.foxbatIntelTexts);
}

//=========================== HEALTH BARS ===============================

function DrawHealthBars() {
    UI.usaHealthBarDelta = SetFlatSprite(0, -100, 0, 'tileset', 'usa_health_delta', UI.isoGroup);
    UI.usaHealthBarDelta.scale.setTo(1, 2);
    UI.usaHealthBar = SetFlatSprite(0, 0, 0, 'tileset', 'flag_bar_usa', UI.isoGroup);
    UI.usaHealthBar.scale.setTo(2, 2.2);
    UI.usaHealthBar.sendToBack();

    UI.ussrHealthBarDelta = SetFlatSprite(636, -100, 0, 'tileset', 'ussr_health_delta', UI.isoGroup);
    UI.ussrHealthBarDelta.scale.setTo(1, 2);
    UI.ussrHealthBar = SetFlatSprite(636, 0, 0, 'tileset', 'flag_bar_ussr', UI.isoGroup);
    UI.ussrHealthBar.scale.setTo(2, 2.2);
    UI.ussrHealthBar.sendToBack();
}

function DrawHealthBarsAnimateUp() {
    UI.ussrHealthBar.y = 400;
    UI.usaHealthBar.y = 400;
    var tweenUssrHealthBar = game.add.tween(UI.ussrHealthBar);
    tweenUssrHealthBar.to({ y: 0 }, 2000 * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, false);
    tweenUssrHealthBar.start();

    var tweenUsaHealthBar = game.add.tween(UI.usaHealthBar);
    tweenUsaHealthBar.to({ y: 0 }, 2000 * Speed.tweenMultiplier, Phaser.Easing.Quadratic.In, false);
    tweenUsaHealthBar.start();
}

// Move a health bar; returns its y position
function DrawHealthBar(bar, health, fullHealth) {
    var healthY = (fullHealth - health) / parseInt(fullHealth) * 400;
    bar.y = healthY;
    return healthY;
}

// Flash the damage just taken on a health bar
function DrawHealthBarDelta(deltaBar, healthY, health, fullHealth, delta) {
    if (delta > 0 && health > 0) {
        deltaBar.visible = true;
        deltaBar.scale.setTo(2, (delta / parseInt(fullHealth) * 400));
        deltaBar.y = healthY - ((delta / parseInt(fullHealth) * 400));
        game.time.events.add(Phaser.Timer.SECOND * 1, function () {
            deltaBar.visible = false;
        });
    }
}

//=========================== STATUS BARS ===============================

function DrawStatusBarsUssr(x, y, shield, shieldMax, graphics) {
    graphics.lineStyle(0, 0x000000, 1);
    graphics.beginFill(0xF0F000);
    graphics.drawRect(x + 130, y + 10, (shield / 10), 30);

    // filler
    graphics.beginFill(0xFFFFFF);
    graphics.drawRect(x + 130 + (shieldMax) / 10, y + 10, (shield - shieldMax) / 10, 30);
    graphics.endFill();

    graphics.lineStyle(2, 0x000000, 1);
    graphics.drawRect(x + 130, y + 10, (shieldMax / 10), 30);
    graphics.endFill();
}

// Ammo (red), shield (yellow) and fuel (purple) bars, drawn right to left from x
function DrawStatusBarsUsa(x, y, shield, shieldMax, fuel, fuelMax, ammo, ammoMax, graphics) {
    graphics.lineStyle(0, 0x000000, 1);

    if (ammoMax > 0) {
        DrawStatusBar(graphics, x, y + 15, ammo, ammoMax, 0xFF0000);
    }
    DrawStatusBar(graphics, x, y + 33, shield, shieldMax, 0xF0F000);
    DrawStatusBar(graphics, x, y + 51, fuel, fuelMax, 0x800080);
    graphics.endFill();

    graphics.lineStyle(2, 0x000000, 1);
    if (ammoMax > 0)
        graphics.drawRect(x - 10 - (ammoMax / 10), y + 15, (ammoMax / 10), 18);
    graphics.drawRect(x - 10 - (shieldMax / 10), y + 33, (shieldMax / 10), 18);
    graphics.drawRect(x - 10 - (fuelMax / 10), y + 51, (fuelMax / 10), 18);
    graphics.endFill();
}

function DrawStatusBar(graphics, x, y, value, max, color) {
    graphics.beginFill(color);
    graphics.drawRect(x - 10 - (value / 10), y, (value / 10), 18);
    // white filler for the empty part
    graphics.beginFill(0xFFFFFF);
    graphics.drawRect(x - 10 - (max / 10), y, (max - value) / 10, 18);
}

//=========================== MISSILE CHEVRONS ==========================
// Chevrons under a profile show how close it is to firing again

function DrawUsaMissileChevrons(profileSlot, counter, missileDelaySize, missileDelayUnits, missileDelayUnitModifier, ammo, x, y) {
    var profile = usaProfiles[profileSlot];
    var chevronsTotal = missileDelayUnits - missileDelayUnitModifier;
    var chevronSelected = (ammo <= 0) ? 0 : Math.floor(parseInt((counter * Speed.tweenInverseMultiplier) + 20) / parseInt(missileDelaySize));
    chevronSelected = Math.min(chevronSelected, chevronsTotal);
    profile.chevron.x = x + 32;
    profile.chevron.y = y + 64;

    if (chevronSelected >= 0 && chevronsTotal > 0) {
        profile.chevron.loadTexture('tileset', 'chevron_' + chevronSelected + '_' + chevronsTotal);
    }

    // blue chevrons: the Hawkeye bonus
    if (missileDelayUnitModifier > 0) {
        profile.chevronBlue.loadTexture('tileset', 'chevron_' + missileDelayUnitModifier + '_' + missileDelayUnitModifier + '_blue');
        profile.chevronBlue.x = profile.chevron.x + (16 * chevronsTotal);
        profile.chevronBlue.y = profile.chevron.y;
    }
    else {
        profile.chevronBlue.loadTexture('tileset', 'nothing');
    }
}

function DrawUssrMissileChevrons(profileSlot, counter, missileDelaySize, missileDelayUnits, x, y) {
    var chevron = ussrProfiles[profileSlot].chevron;
    var chevronsTotal = missileDelayUnits;
    var chevronSelected = Math.floor(parseInt((counter * Speed.tweenInverseMultiplier) + 20) / parseInt(missileDelaySize));
    chevronSelected = Math.max(0, Math.min(chevronSelected, chevronsTotal));
    chevron.x = x + 100;
    chevron.y = y + 64;
    chevron.scale.setTo(-1, 1);
    chevron.loadTexture('tileset', 'chevron_' + chevronSelected + '_' + chevronsTotal);
}

function DrawBulletChevrons(profileSlot, counter, missileDelaySize, ammo, x, y) {
    var chevron = usaProfiles[profileSlot].chevron;
    var bullets = (ammo <= 0) ? 0 : ((counter * Speed.tweenInverseMultiplier) + 20) >= missileDelaySize ? 1 : 0;
    chevron.x = x + 32;
    chevron.y = y + 64;
    chevron.loadTexture('tileset', 'chevron_bullet_' + bullets);
}

//=========================== INFO PANEL ================================

function DrawInfoPanel(type, faction) {
    UI.spriteInfoPanelBackground.visible = true;
    UI.spriteInfoPanelBackground.bringToTop();
    UI.spriteInfoPanelProfile.x = (faction == 'ussr') ? 400 : 560;
    UI.spriteInfoPanelProfile.loadTexture('tileset', type + '_profile_level');
    UI.spriteInfoPanelProfile.bringToTop();
}

function DrawInfoPanelTitle(type) {
    UI.infoPanelTitleText = game.add.bitmapText(440, 725, 'fontRed', GetTypeText(type), 32);
    UI.infoPanelTitleText.visible = true;
}

function DrawMissileChevronStatusBar(chevrons, faction) {
    var bar = UI.missileChevronStatusBar;
    if (chevrons && chevrons > 0)
        bar.loadTexture('tileset', 'chevron_' + chevrons + '_' + chevrons);
    else
        bar.loadTexture('tileset', 'nothing');

    if (faction == 'usa') {
        bar.scale.setTo(1, 1);
        bar.x = 580;
    }
    else {
        bar.scale.setTo(-1, 1);
        bar.x = 500;
    }
    bar.bringToTop();
}

function DrawBulletChevronStatusBar(faction) {
    var bar = UI.missileChevronStatusBar;
    bar.loadTexture('tileset', 'chevron_bullet_1');

    if (faction == 'usa') {
        bar.scale.setTo(1, 1);
        bar.x = 580;
    }
    else {
        bar.scale.setTo(-1, 1);
        bar.x = 480;
    }
    bar.bringToTop();
}

// Status bars of the aircraft selected in the info panel, redrawn every frame
function DrawSpriteInfoPanel() {
    if (UI.spriteInfoPanelGuid) {
        var aircraft = findAircraft(UI.spriteInfoPanelGuid);
        if (aircraft) {
            var type = aircraft.type;
            var missileDelay = GetTypeMissileDelay(type);

            DrawStatusBarsUsa(
                570,
                750,
                aircraft.shield,
                GetTypeShieldMax(type),
                aircraft.fuel,
                GetTypeFuelMax(type),
                aircraft.ammo,
                GetTypeAmmoMax(type),
                UI.graphicsStatusBars
            );

            if (missileDelay == 1) { // bullets
                DrawBulletChevronStatusBar('usa');
                UI.infoPanelTextFireRate.text = "BULLET DELAY:";
            }
            else if (GetTypeAmmoMax(type) <= 0) {
                UI.infoPanelTextFireRate.text = "UNARMED";
            }
            else {
                UI.infoPanelTextFireRate.text = "MISSILE DELAY:";
                DrawMissileChevronStatusBar(missileDelay, 'usa');
            }

            UI.infoPanelTextFireRate.x = 400;
            UI.infoPanelText2.text = GetTypeText2(type);
            UI.infoPanelText3.text = GetTypeText3(type);

            UI.infoPanelAmmoText.text = "ammo";
            UI.infoPanelShieldText.text = "shield";
            UI.infoPanelFuelText.text = "fuel";
        }
    }

    if (UI.spriteInfoPanelSlot !== null && UI.spriteInfoPanelSlot !== undefined) {
        var profile = ussrProfiles[UI.spriteInfoPanelSlot];
        if (profile) {
            DrawStatusBarsUssr(400, 760, profile.shield, GetTypeShieldMax(profile.type), UI.graphicsStatusBars);
        }
    }
}

function DrawAdmiral() {
    UI.spriteInfoPanelBackground.visible = true;
    UI.spriteInfoPanelBackground.bringToTop();
    UI.admiral.bringToTop();
    UI.admiral.visible = true;

    UI.mouthAnimation.visible = true;
    UI.mouthAnimation.animations.play('mouths', 1, true);
    UI.mouthAnimation.bringToTop();
}

// The Admiral's 5 lines of text under a title line
function DrawAdmiralText(title, lines) {
    var texts = [UI.infoPanelLevelText2, UI.infoPanelLevelText3, UI.infoPanelLevelText4, UI.infoPanelLevelText5, UI.infoPanelLevelText6];
    UI.infoPanelLevelText1.text = title;
    if (lines) {
        texts.forEach(function (text, i) {
            if (lines[i])
                text.text = lines[i];
        });
    }
}

function DrawLevelTextInfoPanel(ussrWave) {
    DrawAdmiral();
    var lastLevel = (FullGameEnabled) ? 15 : 7;

    //random level
    if (ussrWave == -1) {
        DrawAdmiralText("  ==== DEFCON: RANDOM ====", [
            "Theres no telling what",
            "procedurally-generated hell",
            "they\'ve prepared, or if",
            "victory is even possible!",
            "But you can retry the level"
        ]);
        return;
    }

    if (ussrWave >= 0 && ussrWave <= lastLevel) {
        DrawAdmiralText("  ===== DEFCON:" + (ussrWave + 1) + " =====", levelText[ussrWave]);
    }
    else {
        DrawAdmiralText("  ===== victory =====", levelText[ussrWave]);
        DrawVictoryFlag();
    }
}

function DrawDefeatTextInfoPanel(defeatType) {
    DrawAdmiral();
    DrawAdmiralText("  ===== DEFEAT =====", defeatText[defeatType]);
}

// The level-complete medal, shown over the deck
function DrawInsigniaPanel(number) {
    if (number !== 0 || Battle.isRandomLevel < 0) {

        var defconText = (Battle.isRandomLevel < 0) ? '   random ' : '   defcon ' + number;

        UI.mainTitleLine1Text.text = defconText;
        UI.mainTitleLine1Text.visible = true;
        UI.mainTitleLine2Text.text = '   victory';
        UI.mainTitleLine2Text.visible = true;
        UI.mainTitleLine3Text.text = '   continue';
        UI.mainTitleLine3Text.visible = true;

        UI.textGroup.visible = false;

        UI.graphicsInsigniaPanel.lineStyle(2, 0x999999, 0);
        UI.graphicsInsigniaPanel.beginFill(0x999999);
        UI.graphicsInsigniaPanel.drawRect(0, 390, 700, 510);
        UI.graphicsInsigniaPanel.endFill();
        game.world.bringToTop(UI.graphicsInsigniaPanel);
        UI.graphicsInsigniaPanel.visible = true;

        UI.spriteInsigniaPanel.visible = true;
        UI.spriteInsigniaPanel.loadTexture('insigniaset', 'insignia_' + (number == -1) ? 0 : number);
        UI.spriteInsigniaPanel.bringToTop();
    }
}

function DrawVictoryFlag() {
    UI.flagAnimationVictory = game.add.sprite(100, 50, 'flagSprites');
    UI.flagAnimationVictory.animations.add('flags');
    UI.flagAnimationVictory.animations.play('flags', 1.5, true);
    UI.flagAnimationVictory.bringToTop();
    UI.flagAnimationVictory.scale.setTo(6, 6);
}

function DrawFullGameAdvert() {
    UI.full_game_menu = game.add.sprite(170, 30, 'full_game_menu');
    UI.full_game_menu.visible = true;
    UI.full_game_menu.bringToTop();
}

//=========================== DESTROY ===================================

function DestroyInfoPanel() {
    UI.admiral.visible = false;

    UI.mouthAnimation.visible = false;
    UI.mouthAnimation.animations.stop();

    UI.spriteInfoPanelProfile.loadTexture('tileset', 'nothing');
    UI.spriteInfoPanelBackground.visible = false;

    UI.spriteInfoPanelGuid = null;
    UI.spriteInfoPanelSlot = null;
    UI.missileChevronStatusBar.loadTexture('tileset', 'nothing');
    [UI.infoPanelTextFireRate, UI.infoPanelText2, UI.infoPanelText3,
        UI.infoPanelLevelText1, UI.infoPanelLevelText2, UI.infoPanelLevelText3,
        UI.infoPanelLevelText4, UI.infoPanelLevelText5, UI.infoPanelLevelText6,
        UI.infoPanelAmmoText, UI.infoPanelShieldText, UI.infoPanelFuelText
    ].forEach(function (text) {
        text.text = "";
    });
}

function DestroyVictoryFlag() {
    if (UI.flagAnimationVictory) {
        UI.flagAnimationVictory.animations.stop();
        UI.flagAnimationVictory.visible = false;
    }
}
