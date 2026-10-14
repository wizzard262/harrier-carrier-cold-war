/*
 * Harrier Carrier - music
 * Two 80s synth tracks, played alternately (Howler.js).
 */

var musicPlaying = true;
var audioTrack = 0;
var soundMusic;
var soundMusic2;

if (musicEnabled) {
    soundMusic = new Howl({
        src: 'assets/audio.mp4',
        loop: false,
        volume: 1,
        onend: function () {
            MusicOn();
        }
    });
    soundMusic2 = new Howl({
        src: 'assets/audio2.mp4',
        loop: false,
        volume: 1,
        onend: function () {
            MusicOn();
        }
    });
}

// Start the next track
function MusicOn() {
    MusicOff();
    musicPlaying = true;
    if (audioTrack === 0) {
        audioTrack = 1;
        soundMusic.play();
    }
    else {
        audioTrack = 0;
        soundMusic2.play();
    }
}

// Stop the music. Pass true to remember it should resume (e.g. when the game loses focus).
function MusicOff(musicPlay) {
    musicPlaying = !!musicPlay;
    soundMusic.stop();
    soundMusic2.stop();
}
