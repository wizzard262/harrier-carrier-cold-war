/*
 * Harrier Carrier - levels and enemy waves
 * Sending in USSR sub-waves, moving to the next level, random levels, health bars, victory and defeat.
 */

function IsNotTutorialLevel() {
    return Battle.ussrWave == -1 || Battle.ussrWave > 1;
}

//=========================== WAVES =====================================

function UpdateUssrWave() {
    var updateSubWave = false;
    var updateWave = false;

    TutorialReturnToCarrierHint();

    if (!Battle.ussrWaveUpdate && Battle.usaAlive && !IsUssrProfileStillExist()) {

        // all attackers gone: next sub-wave, or (when the stack is home) the next level
        if (isUpdateUssrSubWave()) {
            Battle.ussrSubwave++;
            updateSubWave = true;
        }
        else if (isUpdateUssrWave() || Battle.resetting) {
            Battle.waveCounterDelay += 1;

            var delayDone = Battle.waveCounterDelay >= waveCounterDelayThreshold * Speed.tweenMultiplier;
            if ((delayDone && IsUsaStackEmpty() && IsUsaAllOnDeck()) || Battle.resetting) {
                StartNextLevel();
                updateWave = true;
            }
        }

        if (Battle.resetting || updateSubWave || updateWave && (Battle.waveCounterDelay >= waveCounterDelayThreshold * Speed.tweenMultiplier)) {
            Battle.ussrWaveUpdate = true;

            if (Battle.ussrWaveHealth <= 0) {
                StartLevelBriefing();
            }
            Battle.waveCounterDelay = 0;
        }
    }

    if (Battle.ussrWaveUpdate) {
        UpdateUssrSubWave(Battle.ussrWave, Battle.ussrSubwave);
        Battle.ussrWaveUpdate = false;
    }
}

// No planes in the battle stack (the U2 doesn't count: it never lands)
function IsUsaStackEmpty() {
    for (var i = 0; i < usaProfiles.length; i++) {
        if (usaProfiles[i] !== null && usaProfiles[i] !== undefined && usaProfiles[i].type != 'u2') {
            return false;
        }
    }
    return true;
}

function StartNextLevel() {
    if (Battle.ussrWave + 1 > 0) {
        DrawWaveText('     alert', '    status', '   DEFCON ' + (Battle.ussrWave + 1));
    }
    else {
        var difficulty = { '-4': '      EASY', '-5': '    MEDIUM', '-6': '     HARD', '-7': '    RESET' }[Battle.selectedLevel];
        DrawWaveText('    DEFCON ', '   RANDOM ', difficulty);
    }

    if (!Battle.resetting)
        Battle.ussrWave++;

    Battle.usaHealth = usaFullHealth;
    Battle.ussrSubwave = 0;
    DestroyAll();
    DestroyAllSelections();
    PopulateDeckSprites(Battle.ussrWave);
    DrawDeckSprites();
    SetupDeckSprites();
}

// Fill the USSR health bar, show the Admiral's briefing and (after the first level) the medal
function StartLevelBriefing() {
    Battle.ussrWaveFullHealth = Battle.ussrWaveHealth = GetUssrWaveHealth(Battle.ussrWave);
    DrawHealthBarsAnimateUp();
    DrawLevelTextInfoPanel(Battle.ussrWave);

    if (Battle.levelCompleted) {
        if (Battle.ussrWave == -1 || Battle.ussrWave > 0 || Battle.isRandomLevel < 0) {

            //not random
            if (Battle.isRandomLevel > -4)
                DrawInsigniaPanel(Battle.ussrWave);

            //random: show the menu so the level can be replayed
            if (Battle.isRandomLevel < 0) {
                UI.pause_menu.visible = true;
                UI.pause_menu.bringToTop();
                Battle.levelCompleted = false;
            }

            game.paused = true;
            game.input.onDown.add(Unpause, self);
        }
    }
    Battle.levelCompleted = true;
}

function GetUssrWaveHealth(wave) {
    var waves = (wave == -1) ? ussrWavesRandom[0] : ussrWaves[wave];
    var totalHealth = 0;
    waves.forEach(function (subWave) {
        subWave.forEach(function (plane) {
            if (plane !== null && plane !== undefined) {
                totalHealth += GetTypeShieldMax(plane);
            }
        });
    });
    return totalHealth;
}

// Foxbat defector intel: the type of the next attacker in this slot
function GetIntel(slot) {
    var waves = ussrWaves && ussrWaves[Battle.ussrWave];
    if (waves && waves[Battle.ussrSubwave + 1] && waves[Battle.ussrSubwave + 1][slot]) {
        return GetTypeIntelText(waves[Battle.ussrSubwave + 1][slot]);
    }
    return null;
}

function isUpdateUssrWave() {
    //random level
    if (Battle.ussrWave == -1)
        return true;

    return !!ussrWaves[Battle.ussrWave + 1];
}

function isUpdateUssrSubWave() {
    var waves = (Battle.ussrWave == -1) ? ussrWavesRandom[0] : ussrWaves[Battle.ussrWave];
    return !!(waves[Battle.ussrSubwave + 1] && !Battle.resetting);
}

function IsUssrProfileStillExist() {
    return ussrProfiles.some(function (profile) {
        return profile !== null && profile !== undefined;
    });
}

//=========================== STARTING A LEVEL ==========================

// Common to choosing a level from the menu and starting a random level
function ResetLevel(wave) {
    TutorialReset();

    Battle.usaHealth = usaFullHealth;
    Battle.ussrWave = wave;
    Battle.ussrWaveFullHealth = Battle.ussrWaveHealth = GetUssrWaveHealth(Battle.ussrWave);
    Battle.usaAlive = true;
    Battle.resetting = true;
    Battle.ussrSubwave = 0;
    Battle.ussrWaveHealth = 0;
    Battle.ussrWaveUpdate = false;
    DestroyAll();
    DestroyAllSelections();
    DestroyVictoryFlag();
}

// difficulty 0 = easy, 1 = medium, 2 = hard. keepCurrentAircraft replays the last random level.
function RandomLevel(difficulty, keepCurrentAircraft) {
    if (!keepCurrentAircraft || usaWavesRandom === null || usaWavesRandom === undefined || usaWavesRandom.length === 0) {
        usaWavesRandom = [GetRandomUsaAircraft()];
        ussrWavesRandom = [GetRandomUssrWaves(difficulty)];
    }

    ResetLevel(-1);

    PopulateDeckSprites(Battle.ussrWave);
    DrawDeckSprites();
    SetupDeckSprites();
}

// [typeIndex, direction, x, y] for a random set of USA aircraft
function GetRandomUsaAircraft() {
    var aircraft = [];
    var i;
    var newHarriers = game.rnd.pick([1, 2, 3, 3, 4]);
    var newSeakings = game.rnd.pick([1, 2, 2]);
    var newHawkeyes = game.rnd.pick([0, 1, 1, 2, 2, 3]);
    var newTomcats = game.rnd.pick([1, 2, 2, 3]);
    var newWarthogs = FullGameEnabled ? game.rnd.pick([1, 2, 2]) : 0;

    for (i = 0; i < newHarriers; i++) aircraft.push([0, 1, 0, 7 - i]);
    for (i = 0; i < newSeakings; i++) aircraft.push([3, 1, 0, 1 - i]);
    for (i = 0; i < newHawkeyes; i++) aircraft.push([2, 3, 3, 7 - i]);
    for (i = 0; i < newTomcats; i++) aircraft.push([1, 3, 3, 4 - i]);
    for (i = 0; i < newWarthogs; i++) aircraft.push([4, 1, 2, 1 - i]);

    // sometimes a Huey
    if (game.rnd.pick([0, 0, 0, 0, 0, 0, 0, 1]))
        aircraft.push([6, 1, 0, 2]);

    return aircraft;
}

// Random USSR sub-waves; each slot (top to bottom) has its own odds of each type (null: always empty)
function GetRandomUssrWaves(difficulty) {
    var waveCount = game.rnd.pick([[1, 2, 2], [2, 3, 3, 4], [4, 4, 5, 5, 6, 7]][difficulty]);
    var waves = [];

    for (var i = 0; i < waveCount; i++) {
        var slotOdds = GetRandomUssrSlotOdds(difficulty);
        waves.push(slotOdds.map(function (odds) {
            return (odds === null) ? null : game.rnd.pick(odds);
        }));
    }
    return waves;
}

function GetRandomUssrSlotOdds(difficulty) {
    if (difficulty === 0) { //easy
        return [
            null,
            [null, null, null, null, null, 'mig15', 'mig15', 'mig15'],
            [null, null, null, null, 'mig15', 'mig15', 'mig21', 'mig21'],
            FullGameEnabled ? [null, null, null, 'mig15', 'mig21', 'mig21', 'fulcrum', 'foxbat'] : [null, null, null, 'mig15', 'mig21', 'mig21', 'fulcrum', 'fulcrum']
        ];
    }
    if (difficulty == 1) { //medium
        return [
            [null, null, null, null, null, null, 'mig15', 'mig15', 'mig15', 'mig21', 'mig21'],
            [null, null, null, null, null, 'mig15', 'mig15', 'mig15', 'mig21', 'mig21'],
            FullGameEnabled ? [null, null, null, null, 'mig15', 'mig15', 'mig21', 'mig21', 'fulcrum', 'foxbat'] : [null, null, null, null, 'mig15', 'mig15', 'mig21', 'fulcrum'],
            [null, null, null, 'mig15', 'mig21', 'mig21', 'mig21', 'fulcrum', 'bear']
        ];
    }
    //hard
    return [
        [null, null, null, null, null, null, 'mig15', 'mig15', 'mig15', 'mig21', 'mig21', 'mig21', 'fulcrum'],
        FullGameEnabled ? [null, null, null, null, null, 'mig15', 'mig15', 'mig15', 'mig21', 'fulcrum', 'foxbat', 'bear'] : [null, null, null, null, null, 'mig15', 'mig15', 'mig15', 'mig21', 'fulcrum', 'bear'],
        [null, null, null, null, 'mig15', 'mig15', 'mig21', 'mig21', 'fulcrum', 'fulcrum', 'bear'],
        [null, null, null, 'mig15', 'mig21', 'mig21', 'fulcrum', 'fulcrum', 'fulcrum', 'bear']
    ];
}

//=========================== HEALTH, VICTORY AND DEFEAT ================

function UpdateUsaHealthBar(delta) {
    if (Battle.usaHealth > 0)
        Battle.usaHealth -= delta;

    var healthY = DrawHealthBar(UI.usaHealthBar, Battle.usaHealth, usaFullHealth);

    if (healthY >= 400 && Battle.usaAlive) {
        Defeat(0, !Battle.resetting); //carrier destroyed
    }

    DrawHealthBarDelta(UI.usaHealthBarDelta, healthY, Battle.usaHealth, usaFullHealth, delta);
    Battle.usaHealthDelta = 0;
    Battle.resetting = false;
}

function UpdateUssrHealthBar(delta) {
    if (Battle.ussrWaveHealth > 0)
        Battle.ussrWaveHealth -= delta;

    var healthY = DrawHealthBar(UI.ussrHealthBar, Battle.ussrWaveHealth, Battle.ussrWaveFullHealth);
    DrawHealthBarDelta(UI.ussrHealthBarDelta, healthY, Battle.ussrWaveHealth, Battle.ussrWaveFullHealth, delta);
    Battle.ussrHealthDelta = 0;
}

// Lost every aircraft: defeat
function UpdateUsaAircraftHealthStatus() {
    var aircraftRemains = sprite_deck.length === 0 || sprite_deck.some(function (aircraft) {
        return aircraft.shield > 0;
    });

    if (!aircraftRemains && Battle.usaAlive) {
        Defeat(1, true);
    }
}

// defeatType: 0 carrier destroyed, 1 no aircraft left, 2 the U2 was lost
function Defeat(defeatType, showMessages) {
    DestroyAll();
    DestroyAllSelections();

    Battle.usaAlive = false;
    Battle.usaHealth = 0;
    Battle.ussrWaveHealth = 0;
    UI.usaHealthBarDelta.visible = false;
    UI.ussrHealthBarDelta.visible = false;

    if (showMessages) {
        DrawWaveText("  DEFEATED", "  GAME OVER", "");
        DrawDefeatTextInfoPanel(defeatType);
        DrawDefeatExplosions();
        UI.touchIcon.visible = false;
    }
}

//=========================== CLEARING UP ===============================

function DestroyAll() {
    for (var slot = 0; slot < 4; slot++) {
        DestroyUsaChevron(slot);
    }
    for (slot = 0; slot < 4; slot++) {
        DestroyUssrChevron(slot);
    }

    DestroySpriteDeck();
    DestroyUssrProfiles();
    DestroyUsaMissiles();
    DestroyUssrMissiles();
    DestroyUsaProfiles();
}

// Clear the current selection: move squares, buttons, info panel
function DestroyAllSelections() {
    if (UI.infoPanelTitleText) {
        UI.infoPanelTitleText.visible = false;
    }
    UI.graphicsStatusBars.clear();
    DestroyMoveIndicators();
    DestroySpriteButtons();
    DestroyChosenPath();
    DestroyInfoPanel();
}
