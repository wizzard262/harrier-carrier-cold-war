/*
 * Harrier Carrier - the Phaser game: loading assets, building the scene, and the per-frame update.
 * Loaded last: every other game/js file must be loaded before this one.
 */

var game = new Phaser.Game(700, 900, Phaser.WEBGL, 'test', null, false, false);
var BasicGame = function (game) { };
BasicGame.Boot = function (game) { };

BasicGame.Boot.prototype = {

    preload: function () {
        game.time.advancedTiming = true;
        game.debug.renderShadow = false;
        game.stage.disableVisibilityChange = true;

        game.plugins.add(new Phaser.Plugin.Isometric(game));

        game.load.atlasJSONHash('tileset', 'assets/tileset.png', 'assets/tileset.js');
        game.load.atlasJSONHash('insigniaset', 'assets/insignia.png', 'assets/insignia.js');
        game.load.image('admiral', 'assets/admiral.png');
        game.load.image('hud', 'assets/hud.png');
        game.load.image('cloud_1', 'assets/cloud_1.png');
        game.load.image('cloud_2', 'assets/cloud_2.png');
        game.load.image('cloud_3', 'assets/cloud_3.png');
        game.load.image('cloud_4', 'assets/cloud_4.png');
        game.load.image('sea_2', 'assets/sea2.png');
        game.load.image('sea_3', 'assets/sea3.png');
        game.load.image('deck_1', 'assets/deck2.png');
        game.load.image('cold_war', 'assets/cold_war.png');
        game.load.image('pause_menu', (FullGameEnabled) ? 'assets/pause_menu.png' : 'assets/pause_menu_lite.png');
        game.load.image('full_game_menu', 'assets/victory_lite.png');

        game.load.spritesheet('fireSprites', 'assets/fire.png', 64, 64, 6);
        game.load.spritesheet('flagSprites', 'assets/flag.png', 84, 92, 2);
        game.load.spritesheet('mouthSprites', 'assets/admiral_mouth.png', 16, 14, 6);
        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        game.iso.anchor.setTo(0.528, 0.14);

        // bitmap fonts: Yellow, Red, Purple, Blue
        game.load.bitmapFont('fontYellow', 'assets/font/font_yellow.png', 'assets/font/font.xml');
        game.load.bitmapFont('fontRed', 'assets/font/font_red.png', 'assets/font/font.xml');
        game.load.bitmapFont('fontPurple', 'assets/font/font_purple.png', 'assets/font/font.xml');
        game.load.bitmapFont('fontBlue', 'assets/font/font_blue.png', 'assets/font/font.xml');
    },

    // Build the scene. The order sprites are created in sets which draws on top.
    create: function () {
        game.time.slowMotion = slowMotionMultiplier;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.minWidth = 320;
        this.scale.minHeight = 427;
        this.scale.maxWidth = 2000;
        this.scale.maxHeight = 2571;
        this.scale.refresh();
        this.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        CreateScenery();
        DrawHealthBars();
        UI.cloud_1.sendToBack();
        UI.cloud_2.sendToBack();
        UI.cloud_3.sendToBack();
        UI.cloud_4.sendToBack();

        CreateAnimations();
        CreateInfoPanel();

        PopulateDeckSprites(Battle.ussrWave);
        DrawDeckSprites();
        SetupDeckSprites();
        DrawRecoveryText();
        DrawMainTitle();
        DrawFoxbatIntel();

        // after the title: first alert, and show the menu button
        game.time.events.add(Phaser.Timer.SECOND * 4, function () {
            DrawWaveText('     alert', '    status', '   defcon 1');
            UI.burger_menu.visible = true;
        });

        UI.graphicsProfile = game.add.graphics(0, 0);
        UI.graphicsInsigniaPanel = game.add.graphics(0, 0);
        UI.graphicsStatusBars = game.add.graphics(0, 0);
        UI.graphicsStatusGroup.add(UI.graphicsStatusBars);

        game.iso.simpleSort(UI.isoGroup);

        cursorPos = new Phaser.Plugin.Isometric.Point3(); // 3D position of the pointer
        SetupBurgerMenu();

        UI.hudSprite = game.add.sprite(100, 0, 'hud');
        UI.hudSprite.visible = false;
        UI.hudSprite.scale.setTo(1.5, 1.5);
        UI.hudSprite.bringToTop();

        UI.pause_menu = game.add.sprite(170, 30, 'pause_menu');
        UI.pause_menu.visible = false;
        UI.pause_menu.bringToTop();

        DrawSea();

        if (musicEnabled) {
            MusicOn();
            game.onBlur.add(function () {
                MusicOff(musicPlaying);
                game.paused = true;
            }, this);
            game.onFocus.add(function () {
                if (musicPlaying)
                    MusicOn();
                game.paused = false;
            }, this);
        }
    },

    update: function () {
        // tutorial level 2 starts at its own first step
        if (Battle.ussrWave == 1 && Tutorial.touchIconPosition < 6) {
            TutorialStep(6);
        }

        if (UI.graphicsProfile)
            UI.graphicsProfile.clear();
        if (UI.graphicsInsigniaPanel)
            UI.graphicsInsigniaPanel.clear();
        if (UI.graphicsStatusBars)
            UI.graphicsStatusBars.clear();

        UpdateUssrWave();
        UpdateProfileStackUsa();
        UpdateMissileUsa();
        UpdateMissileUssr();
        AnimateProfile(ussrProfiles, 'ussr');
        AnimateProfile(usaProfiles, 'usa');
        UpdateUsaHealthBar(Battle.usaHealthDelta);
        UpdateUssrHealthBar(Battle.ussrHealthDelta);
        RunMainLoop();
        DrawTutorialIcon();
        UpdateUsaAircraftHealthStatus();
        DrawSpriteInfoPanel();

        game.world.bringToTop(UI.graphicsStatusGroup);
        game.world.bringToTop(UI.textGroup);
        game.iso.simpleSort(UI.isoGroup);
        game.world.bringToTop(UI.isoGroupTutorial);

        game.iso.unproject(game.input.activePointer.position, cursorPos);
        DrawHud();
        AnimateWater();
    }
};

// Sky, sea, carrier deck, title art and the fast-forward buttons
function CreateScenery() {
    UI.admiral = game.add.sprite(130, 685, 'admiral');
    UI.admiral.visible = false;
    UI.admiral.scale.setTo(2, 2);

    UI.cloud_1 = game.add.sprite(-50, 0, 'cloud_1');
    UI.cloud_2 = game.add.sprite(-50, 100, 'cloud_2');
    UI.cloud_3 = game.add.sprite(-50, 200, 'cloud_3');
    UI.cloud_4 = game.add.sprite(-50, 300, 'cloud_4');
    UI.sea_5 = game.add.sprite(-50, 391, 'sea_2');
    UI.deck_1 = game.add.sprite(-3, 443, 'deck_1');
    UI.cold_war = game.add.sprite(100, 220, 'cold_war');

    SetupFfwd();

    UI.cold_war.scale.setTo(1.5, 1.5);
    UI.cold_war.visible = false;
    [UI.cloud_1, UI.cloud_2, UI.cloud_3, UI.cloud_4].forEach(function (cloud) {
        cloud.scale.setTo(4.5, 4);
    });
    UI.sea_5.scale.setTo(1.4, 1);
}

// The Admiral's mouth, crash fire and the flag
function CreateAnimations() {
    UI.mouthAnimation = game.add.sprite(246, 791, 'mouthSprites');
    UI.mouthAnimation.animations.add('mouths');
    UI.mouthAnimation.scale.setTo(2, 2);
    UI.mouthAnimation.visible = false;

    UI.fireAnimation = game.add.sprite(-300, -300, 'fireSprites');
    UI.fireAnimation.animations.add('flames');
    UI.fireAnimation.x = 0;
    UI.fireAnimation.y = 0;
    UI.fireAnimation.visible = false;

    UI.flagAnimation = game.add.sprite(60, 565, 'flagSprites');
    UI.flagAnimation.animations.add('flags');
    UI.flagAnimation.animations.play('flags', 0.5, true);
    UI.flagAnimation.bringToTop();
    UI.flagAnimation.scale.setTo(0.5, 0.5);
}

// Medal panel, tutorial hands, the info panel (bottom right) and its texts, and the sprite groups
function CreateInfoPanel() {
    UI.spriteInsigniaPanel = SetFlatSprite(170, 400, 100, 'insigniaset', 'insignia_11', UI.usaProfileGroup);
    UI.spriteInsigniaPanel.scale.setTo(4, 4);
    UI.spriteInsigniaPanel.visible = false;

    Tutorial.touchIconPosition = 0;
    UI.touchIcon = SetFlatSprite(0, 0, 0, 'tileset', 'touch_icon_left', UI.usaProfileGroup);
    UI.touchIcon.scale.setTo(3, 3);
    UI.touchIcon.visible = false;

    UI.touchIconFfwd = SetFlatSprite(0, 0, 0, 'tileset', 'touch_icon_left', UI.usaProfileGroup);
    UI.touchIconFfwd.scale.setTo(3, 3);
    UI.touchIconFfwd.visible = false;

    UI.spriteInfoPanelProfile = SetFlatSprite(350, 760, 101, 'tileset', 'nothing', UI.usaProfileGroup);
    UI.spriteInfoPanelBackground = SetFlatSprite(380, 710, 100, 'tileset', 'info_panel_background', UI.usaProfileGroup);
    UI.spriteInfoPanelBackground.scale.setTo(10, 6);
    UI.missileChevronStatusBar = SetFlatSprite(280, 825, 101, 'tileset', 'nothing', UI.usaProfileGroup);

    UI.isoGroup = game.add.group();
    UI.isoGroupTutorial = game.add.group();
    UI.graphicsStatusGroup = game.add.group();
    UI.textGroup = game.add.group();

    var panelText = function (x, y) {
        return game.make.text(x, y, '', { font: "18px Courier", fill: "#000000" });
    };
    UI.infoPanelTextFireRate = panelText(220, 825);
    UI.infoPanelTextFireRate.fontWeight = 'bold';
    UI.infoPanelText2 = panelText(400, 845);
    UI.infoPanelText3 = panelText(400, 865);

    UI.infoPanelLevelText1 = panelText(395, 725);
    UI.infoPanelLevelText2 = panelText(395, 750);
    UI.infoPanelLevelText3 = panelText(395, 775);
    UI.infoPanelLevelText4 = panelText(395, 800);
    UI.infoPanelLevelText5 = panelText(395, 825);
    UI.infoPanelLevelText6 = panelText(395, 850);

    UI.infoPanelAmmoText = game.add.bitmapText(400, 760, 'fontRed', '', 20);
    UI.infoPanelShieldText = game.add.bitmapText(400, 780, 'fontYellow', '', 20);
    UI.infoPanelFuelText = game.add.bitmapText(400, 800, 'fontPurple', '', 20);

    [UI.infoPanelTextFireRate, UI.infoPanelText2, UI.infoPanelText3,
        UI.infoPanelLevelText1, UI.infoPanelLevelText2, UI.infoPanelLevelText3,
        UI.infoPanelLevelText4, UI.infoPanelLevelText5, UI.infoPanelLevelText6,
        UI.infoPanelAmmoText, UI.infoPanelShieldText, UI.infoPanelFuelText
    ].forEach(function (text) {
        UI.textGroup.add(text);
    });
}

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
