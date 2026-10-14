/*
 * Harrier Carrier - tutorial
 * Levels 1 and 2 (ussrWave 0 and 1) walk the player through the game with a pointing hand.
 * Tutorial.touchIconPosition is the current step: an index into touchIconTutorial (levels.js).
 */

function TutorialReset() {
    Tutorial.touchIconPosition = 0;
    Tutorial.ffwdIcon = false;
    Tutorial.ffwdIcon2 = 0;
    UI.touchIcon.visible = false;
}

// Move the tutorial to the next step: the hand is hidden, and redrawn at the new step's position
function TutorialStep(position) {
    UI.touchIcon.visible = false;
    Tutorial.touchIconPosition = position;
}

// If the tutorial is at step 'from', go to step 'to'
function TutorialStepFrom(from, to) {
    if (Tutorial.touchIconPosition == from) {
        TutorialStep(to);
        return true;
    }
    return false;
}

//=========================== STEPS =====================================

function TutorialAircraftTapped() {
    if (TutorialStepFrom(7, 8)) {
        SetupSpriteToggle(sprite_deck[0]);
    }
    TutorialStepFrom(10, 11);
}

function TutorialTakeoffButtonShown() {
    if (Battle.ussrWave === 0) {
        TutorialStep(1);
    }
    if (Battle.ussrWave == 1) {
        TutorialStepFrom(13, 14);
        TutorialStepFrom(19, 20);
    }
}

function TutorialTakeoffButtonTapped() {
    TutorialStepFrom(1, 2);
    TutorialStepFrom(14, 15);
    TutorialStepFrom(20, 21);
}

function TutorialMoveIndicatorTapped(sprite) {
    if (sprite.tutorialRechargeShield) {
        Tutorial.touchIconPosition = 9;
        UI.touchIcon.visible = false;
    }
    if (sprite.tutorialRechargeAmmo) {
        Tutorial.touchIconPosition = 12;
        UI.touchIcon.visible = false;
        SetupSpriteToggle(sprite_deck[0]);
    }
    if (sprite.tutorialRechargeAmmo2) {
        Tutorial.touchIconPosition = 19;
        UI.touchIcon.visible = false;
        SetupSpriteToggle(sprite_deck[0]);
    }
}

// A deck pad has finished recharging the tutorial aircraft
function TutorialRechargeComplete(from, to) {
    if (Battle.ussrWave == 1 && Tutorial.touchIconPosition == from) {
        Tutorial.touchIconPosition = to;
        UI.touchIcon.visible = false;
        SetupSpriteToggle(sprite_deck[0]);
    }
}

// A plane has reached the battle stack
function TutorialStackAnimated() {
    if (Battle.ussrWave === 0 && Tutorial.touchIconPosition == 2) {
        TutorialStep(3);
    }
    if (Battle.ussrWave == 1 && Tutorial.touchIconPosition == 15) {
        TutorialStep(16);
    }
}

function TutorialOutOfAmmo(aircraft) {
    if (aircraft.ammo === 0 && Tutorial.touchIconPosition < 17 && Battle.ussrWave == 1) {
        TutorialStep(17);
    }
}

// Point at the plane in the battle stack and let it be tapped to send it home
function TutorialReturnToCarrierHint() {
    var position = Tutorial.touchIconPosition;
    var wave = Battle.ussrWave;
    if (!(
        (wave === 0 && position == 3 && usaProfiles[0] && !IsUssrProfileStillExist()) ||
        (wave == 1 && position == 17 && usaProfiles[0]) ||
        (wave == 1 && position == 21 && usaProfiles[0] && !IsUssrProfileStillExist())
    )) return;

    if (position != 17) {
        TutorialStep(position + 1);
    }

    //EVENT (tap the plane in the stack: it returns to the carrier)
    usaProfiles[0].sprite.events.onInputDown.add(function (sprite) {
        sprite_deck[0].action = 'return_to_carrier';
        TutorialStepFrom(4, 5);
        TutorialStepFrom(17, 18);
        TutorialStepFrom(22, 23);
        ShuffleProfileStackDown(sprite.guid);
    }, this);
}

//=========================== POINTING HAND =============================

function DrawTutorialIcon() {
    //hack, prevent level 1-->2 transition not show grey insignia
    Battle.levelCompleted = true;

    var touchIcon = UI.touchIcon;
    if (Battle.ussrWave !== 0 && Battle.ussrWave != 1) {
        touchIcon.visible = false;
        return;
    }

    if (!touchIcon.visible && Battle.usaAlive) {
        var step = touchIconTutorial[Tutorial.touchIconPosition];
        touchIcon.x = step[0];
        touchIcon.y = step[1];
        touchIcon.visible = true;
        touchIcon.loadTexture('tileset', step[2]);
        touchIcon.bringToTop();
        touchIcon.alpha = 0;
        var tweenTouchIcon = game.add.tween(touchIcon);
        tweenTouchIcon.to({ alpha: 1 }, step[3], Phaser.Easing.Linear.None, true, 0, -1);
        tweenTouchIcon.yoyo(true, 0);
    }

    //hint at the fast-forward buttons, once
    if (Tutorial.touchIconPosition == 20) {
        Tutorial.ffwdIcon = false;
    }
    if (!Tutorial.ffwdIcon && (Tutorial.touchIconPosition == 16 || Tutorial.touchIconPosition == 21)) {
        Tutorial.ffwdIcon = true;
        Tutorial.ffwdIcon2 = 0;
        DrawTutorialIconFfwd();
    }
    //hint at tapping a Russian plane for its info, once
    if (!Tutorial.russianInfoIcon && Tutorial.touchIconPosition == 3) {
        Tutorial.russianInfoIcon = true;
        DrawRussianInfoIcon();
    }
}

function DrawRussianInfoIcon() {
    var icon = UI.touchIconFfwd;
    icon.visible = true;
    icon.loadTexture('tileset', 'touch_icon_bottom');
    icon.bringToTop();

    var tweenIconRussianInfo = game.add.tween(icon);
    icon.x = 450;
    icon.y = 320;
    icon.alpha = 1;
    tweenIconRussianInfo.to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 2, false);
    tweenIconRussianInfo.onComplete.add(function (sprite) {
        sprite.visible = false;
    }, this);
}

// The hand taps each fast-forward button in turn, three times over
function DrawTutorialIconFfwd() {
    var icon = UI.touchIconFfwd;
    icon.visible = true;
    icon.loadTexture('tileset', 'touch_icon_left');
    icon.bringToTop();

    var tweenIconFfwd1 = game.add.tween(icon);
    var tweenIconFfwd2 = game.add.tween(icon);
    var tweenIconFfwd3 = game.add.tween(icon);

    var tapAt = function (tween, x, y) {
        icon.x = x;
        icon.y = y;
        icon.alpha = 1;
        tween.to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false);
    };

    tapAt(tweenIconFfwd1, 40, 500);
    tweenIconFfwd1.onComplete.add(function () {
        tapAt(tweenIconFfwd2, 80, 470);
        tweenIconFfwd2.onComplete.add(function () {
            tapAt(tweenIconFfwd3, 140, 440);
            tweenIconFfwd3.onComplete.add(function (sprite) {
                if (Tutorial.ffwdIcon2 < 2) {
                    Tutorial.ffwdIcon2++;
                    DrawTutorialIconFfwd();
                }
                else {
                    sprite.visible = false;
                }
            }, this);
        }, this);
    }, this);
}
