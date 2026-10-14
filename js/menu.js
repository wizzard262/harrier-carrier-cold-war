/*
 * Harrier Carrier - menus
 * The pause/level-select menu (burger button), and the fast-forward buttons.
 */

//=========================== PAUSE MENU ================================

function SetupBurgerMenu() {
    var burger = UI.burger_menu = game.add.sprite(0, 787, 'tileset', 'burger');
    burger.visible = false;
    burger.inputEnabled = true;
    burger.input.useHandCursor = true;
    burger.bringToTop();
    burger.events.onInputDown.add(function () {
        game.paused = true;
        game.input.onDown.add(Unpause, self);
        UI.pause_menu.visible = true;
        UI.pause_menu.bringToTop();
        Battle.levelCompleted = false;
        DrawMenuSelection(Battle.ussrWave);
    });
}

// Any tap while paused: handles the menu, the medal screen and the full-game advert
function Unpause(event) {

    // full game advert: tapping it goes to Google Play
    if (game.paused && UI.full_game_menu && Battle.selectedLevel == -8) {
        if (event.x > 170 && event.x < 520 && event.y > 30 && event.y < 730) {
            window.top.location.href = googlePlayLink;
        }
        UI.full_game_menu.destroy();
        Battle.selectedLevel = -100;
    }

    if (game.paused && UI.pause_menu.visible) {
        Battle.selectedLevel = GetSelectedLevel(event.x, event.y);
        MenuSelection(Battle.selectedLevel);
    }

    UI.spriteInsigniaPanel.visible = false;
    HideMainTitle();

    if (UI.pause_menu.visible) {
        UI.pause_menu.visible = false;
    }
    if (Battle.selectedLevel != -8)
        game.paused = false;

    UI.graphicsInsigniaPanel.visible = false;
    UI.textGroup.visible = true;
}

function MenuSelection(selectedLevel) {
    if (selectedLevel == -2 && musicEnabled)
        MusicOn();

    if (selectedLevel == -3 && musicEnabled)
        MusicOff();

    // full game advert
    if (selectedLevel == -8) {
        DrawFullGameAdvert();
        UI.pause_menu.visible = false;
        game.paused = true;
        game.input.onDown.add(Unpause, self);
    }

    // random levels
    if (selectedLevel == -4)
        RandomLevel(0, false);
    if (selectedLevel == -5)
        RandomLevel(1, false);
    if (selectedLevel == -6)
        RandomLevel(2, false);
    if (selectedLevel == -7)
        RandomLevel(0, true);

    // a level
    if (selectedLevel > -1) {
        ResetLevel(selectedLevel);
        UI.sea_5.loadTexture('sea_' + game.rnd.pick([2, 3]));
    }
}

// Menu layout: 6 rows by 4 columns of 74px buttons
var MENU_ROWS = [48, 126, 202, 278, 354, 430];
var MENU_COLUMNS = [188, 264, 344, 422];
var MENU_BUTTON_SIZE = 74;

// Which row (or column) of the menu a coordinate is in, or -1
function MenuIndex(value, starts) {
    for (var i = 0; i < starts.length; i++) {
        if (value > starts[i] && value < starts[i] + MENU_BUTTON_SIZE)
            return i;
    }
    return -1;
}

/*
 * What a tap on the menu selects:
 *   0-15  a level        -4/-5/-6  random easy/medium/hard   -7  replay the random level
 *   -2/-3 music on/off   -8  full game advert                -1  nothing
 */
function GetSelectedLevel(x, y) {
    Battle.isRandomLevel = 0;

    // outside the menu
    if (!(x > 170 && x < 520 && y > 30 && y < 500))
        return -1;

    var row = MenuIndex(y, MENU_ROWS);
    var col = MenuIndex(x, MENU_COLUMNS);

    if (row === 0 && col >= 0) return col;               // levels 1-4
    if (row === 1 && col >= 0) return 4 + col;           // levels 5-8
    if (FullGameEnabled && row === 2 && col >= 0) return 8 + col;   // levels 9-12
    if (FullGameEnabled && row === 3 && col >= 0) return 12 + col;  // levels 13-16

    // lite version: Google Play button where levels 9-16 would be
    if (y > 202 && y < 278 + MENU_BUTTON_SIZE && !FullGameEnabled) {
        window.location.href = googlePlayLink;
    }

    if (row === 4 && col >= 0) {
        if (col < 3)
            Battle.isRandomLevel = -4 - col;
        return -4 - col;                                 // random easy, medium, hard, replay
    }
    if (musicEnabled && row === 5 && (col === 0 || col === 1)) {
        return -2 - col;                                 // music on, off
    }
    if (col === 2) {
        return -8;                                       // full game advert
    }
    return -1;
}

// Red box around the current level in the menu
function DrawMenuSelection(ussrWave) {
    var level = ussrWave + 1; // 0 = random

    var x = 185;
    var y = 45;

    if (level == 2 || level == 6 || level == 10 || level == 14)
        x = 263;
    if (level == 3 || level == 7 || level == 11 || level == 15)
        x = 341;
    if (level == 4 || level == 8 || level == 12 || level == 16 || level === 0)
        x = 419;

    if (level >= 5 && level <= 8)
        y = 122;
    if (level >= 9 && level <= 12)
        y = 198;
    if (level >= 13 && level <= 16)
        y = 276;
    if (level === 0) //replay random
        y = 354;

    if (FullGameEnabled || level <= 7) {
        UI.graphicsProfile.lineStyle(10, 0xFF0000, 1);
        UI.graphicsProfile.drawRect(x, y, MENU_BUTTON_SIZE, MENU_BUTTON_SIZE);
        UI.graphicsProfile.endFill();
        game.world.bringToTop(UI.graphicsProfile);
    }
}

//=========================== FAST FORWARD ==============================

function SetupFfwd() {
    UI.ffwd_1 = SetupFfwdButton(1, 110, 518, 'ffwd_1_on');
    UI.ffwd_2 = SetupFfwdButton(2, 168, 484, 'ffwd_2_off');
    UI.ffwd_3 = SetupFfwdButton(3, 222, 450, 'ffwd_3_off');
}

function SetupFfwdButton(speed, x, y, frame) {
    var button = SetFlatSprite(x, y, 0, 'tileset', frame, UI.ffwdGroup);
    button.inputEnabled = true;
    button.input.useHandCursor = true;
    button.events.onInputDown.add(function () {
        SetGameSpeed(speed);
    });
    return button;
}

// speed 1, 2 or 3
function SetGameSpeed(speed) {
    Speed.tweenMultiplier = [1, 0.5, 0.33][speed - 1];
    Speed.tweenInverseMultiplier = speed;
    ResetFfwd(speed);
    ResetFlagAnimation();
}

function ResetFfwd(number) {
    UI.ffwd_1.loadTexture('tileset', (number == 1) ? 'ffwd_1_on' : 'ffwd_1_off');
    UI.ffwd_2.loadTexture('tileset', (number == 2) ? 'ffwd_2_on' : 'ffwd_2_off');
    UI.ffwd_3.loadTexture('tileset', (number == 3) ? 'ffwd_3_on' : 'ffwd_3_off');
}

function ResetFlagAnimation() {
    UI.flagAnimation.animations.stop();
    UI.flagAnimation.animations.play('flags', 0.5 * Speed.tweenInverseMultiplier, true);
}
