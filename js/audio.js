/*
 * Harrier Carrier - music
 * Two 80s synth tracks, played alternately (Howler.js).
 * They stream from the site (html5 audio), so a track starts as soon as its first part has downloaded,
 * and each track downloads only when it is first played.
 */

var musicPlaying = true;
var audioTrack = 0;
var soundMusic;
var soundMusic2;

function CreateMusicTrack(src) {
    var track = new Howl({
        src: [src],
        html5: true,     // stream, rather than download and decode the whole 4.8 MB file before playing
        preload: false,  // download when first played
        loop: false,
        volume: 1,
        onend: function () {
            MusicOn();
        },
        onplayerror: function () {
            // the browser blocks sound until the player taps or clicks: play then
            track.once('unlock', function () {
                if (musicPlaying && CurrentMusicTrack() === track && !track.playing())
                    track.play();
            });
        }
    });
    return track;
}

if (musicEnabled) {
    soundMusic = CreateMusicTrack('assets/audio.mp4');
    soundMusic2 = CreateMusicTrack('assets/audio2.mp4');
}

// the track that is playing (or was last started)
function CurrentMusicTrack() {
    return (audioTrack === 1) ? soundMusic : soundMusic2;
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

// Stop the music. Pass true to remember it should resume.
function MusicOff(musicPlay) {
    musicPlaying = !!musicPlay;
    soundMusic.stop();
    soundMusic2.stop();
}

// Pause the song (when the game loses focus), keeping its place
function MusicPause() {
    CurrentMusicTrack().pause();
}

// Carry on with the paused song from where it was
function MusicResume() {
    var track = CurrentMusicTrack();
    if (!track.playing())
        track.play();
}
