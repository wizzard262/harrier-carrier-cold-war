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
            // the browser blocks sound until the player taps or clicks: ask for a tap, and play then
            ShowTapToStart();
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

// Browsers only allow sound after the player clicks or taps (a click made by the page itself doesn't count).
// When the music is blocked, hold the game behind a "tap to start" screen over it: the tap starts the music
// (Howler unlocks audio on it) and the game.
function ShowTapToStart() {
    if (IsWaitingForTap() || !window.game || !game.canvas)
        return;
    var overlay = document.createElement('div');
    overlay.id = 'tap-to-start';
    overlay.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:10;cursor:pointer;background:rgba(0,0,0,0.55);';
    var button = document.createElement('div');
    button.textContent = 'TAP TO START';
    button.style.cssText = 'position:absolute;transform:translate(-50%,-50%);white-space:nowrap;background:#0B3D91;' +
        'border:4px solid #E31B23;color:#FFFFFF;font:bold 28px \'Courier New\',monospace;padding:14px 24px;';
    overlay.appendChild(button);

    // keep the button over the middle of the game (the game scales itself to fit the screen)
    function centre() {
        if (!IsWaitingForTap()) return;
        var rect = game.canvas.getBoundingClientRect();
        button.style.left = (rect.left + rect.width / 2) + 'px';
        button.style.top = (rect.top + rect.height / 2) + 'px';
        requestAnimationFrame(centre);
    }

    overlay.addEventListener('click', function () {
        overlay.parentNode.removeChild(overlay);
        game.paused = false;
    });
    document.body.appendChild(overlay);
    game.paused = true;
    centre();
}

function IsWaitingForTap() {
    return !!document.getElementById('tap-to-start');
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
