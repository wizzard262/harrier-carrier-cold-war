/// <reference path="phaser.js" />

// using canvas here just because it runs faster for the body debug stuff
var game = new Phaser.Game(1600, 800, Phaser.CANVAS, 'test', null, true, false);

var BasicGame = function (game) { };

BasicGame.Boot = function (game) {
    // nothing here
};

var isoGroup
var water = [];
var tileHarrier;
var harrierCounter =0;
BasicGame.Boot.prototype =
{
    preload: function () {
        game.time.advancedTiming = true;
        game.debug.renderShadow = false;
        game.stage.disableVisibilityChange = true;

        game.plugins.add(new Phaser.Plugin.Isometric(game));

        game.load.atlasJSONHash('tileset', 'assets/tileset.png', 'assets/tileset.js');

        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        game.iso.anchor.setTo(0.5, 0.1);
    },
    create: function () {
        isoGroup = game.add.group();

        // we won't really be using IsoArcade physics, but I've enabled it anyway so the debug bodies can be seen
        isoGroup.enableBody = true;
        isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;

        var tileArray = [];
        tileArray[0] = 'water';
        tileArray[1] = 'harrier';
        tileArray[2] = 'grass';
        tileArray[3] = 'stone';
        tileArray[4] = 'wood';
        tileArray[5] = 'watersand';
        tileArray[6] = 'grasssand';
        tileArray[7] = 'sandstone';
        tileArray[8] = 'bush1';
        tileArray[9] = 'bush2';
        tileArray[10] = 'mushroom';
        tileArray[11] = 'wall';
        tileArray[12] = 'window';
		tileArray[13] = 'woodblock';
		tileArray[14] = 'woodblockslope';
		tileArray[15] = 'woodblockslope2';
		tileArray[16] = 'woodblockslope3';
		tileArray[17] = 'tower';
		tileArray[18] = 'woodblockslope4';

        var tiles = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 13, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 17, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 13, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 17, 13, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 13, 13, 13, 13, 13, 13, 14, 0, 0, 0, 0, 0, 0, 0,
			
        ];

        var size = 32;

        var i = 0;
		var tile;

		
        for (var y = size; y <= game.physics.isoArcade.bounds.frontY - size; y += size) {
            for (var x = size; x <= game.physics.isoArcade.bounds.frontX - size; x += size) {

                // this bit would've been so much cleaner if I'd ordered the tileArray better, but I can't be bothered fixing it :P
                tile = game.add.isoSprite(x, y, 0, 'tileset', tileArray[tiles[i]], isoGroup);
                //tile = game.add.isoSprite(x, y, tileArray[tiles[i]].match("water") ? 0 : game.rnd.pick([2, 3, 4]), 'tileset', tileArray[tiles[i]], isoGroup);
                tile.anchor.set(0.5, 0.5);
                tile.smoothed = false;
                tile.body.moves = false;

                if (tiles[i] === 13) {
                    tile.isoZ += 40;
                }

                if (tiles[i] === 14) {
                    tile.isoZ += 39;
                }

                if (tiles[i] === 15) {
                    tile.isoZ += 47;
                }

                if (tiles[i] === 16) {
                    tile.isoZ += 92;
                }
						
                if (tiles[i] === 17) {
                    tile.isoZ += 84;
                    tile = game.add.isoSprite(x - 90, y - 49, 84, 'tileset', tileArray[tiles[i]], isoGroup);
                }
				
				if (tiles[i] === 18) {
                    tile.isoZ += 48;
                }
				
                if (tiles[i] === 13 || tiles[i] === 14 || tiles[i] === 15 || tiles[i] === 16  || tiles[i] === 17 ) {
                    tile = game.add.isoSprite(x - 65, y - 30, 0, 'tileset', tileArray[tiles[13]], isoGroup);
                }

                // if (tiles[i] <= 10 && (tiles[i] < 5 || tiles[i] > 6)) {
                //     tile.scale.x = game.rnd.pick([-1, 1]);
                // }

                if (tiles[i] === 0) {
                    water.push(tile);
                }
                i++;
            }
        }

		// harrier
        tileHarrier = game.add.isoSprite(300, 200,1, 'tileset', tileArray[1]);
    },
    update: function () {
        water.forEach(function (w) {
            w.isoZ = (3 * Math.sin((game.time.now - (w.isoY * 3)) * 0.005)) +(-1 * Math.sin((game.time.now + (w.isoX * 30)) * 0.002));
            w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.4), 0.8, 1);
        });
		
		if(harrierCounter == 600){
				tileHarrier.isoZ = 100;
				tileHarrier.isoY = -500;
		}
		else if(harrierCounter > 600){
				if(tileHarrier.isoZ > 0){
					tileHarrier.isoZ = tileHarrier.isoZ - 0.7 + game.rnd.pick([0,-1,1]);
				}
				else{
					harrierCounter = -150;
				}
				tileHarrier.isoY = tileHarrier.isoY + 0.02 * (360 - tileHarrier.isoY);
		}
		else if(harrierCounter >360 && harrierCounter < 500){			
			tileHarrier.isoY = tileHarrier.isoY + 0.2* (harrierCounter  - 360);
		}
		else if(harrierCounter >100){			
			if(tileHarrier.isoZ < 60){
				tileHarrier.isoZ = tileHarrier.isoZ + 0.5;
			}
			else{				
				tileHarrier.isoZ = tileHarrier.isoZ + game.rnd.pick([0,-0.5,0.5]);
			}		
		}	
		harrierCounter++;
		
		//tileHarrier = game.add.isoSprite(tileHarrier.x, tileHarrier.y +1, 300, 'tileset', 'harrier', isoGroup);
		
    },
    render: function () {
        isoGroup.forEach(function (tile) {
          //  game.debug.body(tile, 'rgba(189, 221, 235, 0.6)', false);
        });
        game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
        // game.debug.text(Phaser.VERSION, 2, game.world.height - 2, "#ffff00");
    }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');