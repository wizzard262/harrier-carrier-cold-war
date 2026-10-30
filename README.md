# Harrier Carrier – browser game code

Play it at https://wizzard262.github.io/harrier-carrier-cold-war/ (GitHub Pages, published from `main` on every push). Android version: https://play.google.com/store/apps/details?id=com.harriercarrier.coldwar

The two early prototypes of the carrier deck are in `prototype1/` and `prototype2/` (https://wizzard262.github.io/harrier-carrier-cold-war/prototype1/ and `.../prototype2/`).

Plain JavaScript, no build step. `index.html` loads the libraries and then the game files in order with `<script src>`; everything is in global scope, as before the refactor.

## Libraries (`lib/`)

| File | Library |
| --- | --- |
| `phaser.min.js` | Phaser 2.6.2 (game engine) |
| `phaser-plugin-isometric.min.js` | Phaser Isometric plugin 0.9.4 (the carrier deck) |
| `pathfinding-browser.min.js` | PathFinding.js (A* for moving aircraft on deck) |
| `howler.core.min.js` | howler.js 2.2.4 (music) |

## Game (`js/`, in load order)

| File | What's in it |
| --- | --- |
| `config.js` | Tuning numbers, deck layout, take-off timings, and `AIRCRAFT_STATS`: every aircraft type's shield/fuel/ammo, missile delay, damage and info text |
| `levels.js` | Level data: USA aircraft per level, USSR attack waves, the Admiral's briefings, tutorial hand positions |
| `state.js` | Game state: `sprite_deck`, `usaProfiles`, `ussrProfiles`, missiles, and the `Battle`, `Speed`, `Tutorial` and `UI` objects |
| `audio.js` | Music |
| `aircraft.js` | The aircraft objects (`createAircraft`, `createUsaProfile`, `createUssrProfile`), stats lookups (`GetTypeShieldMax` …), deck-square tests |
| `draw.js` | Drawing helpers, effects, texts, health bars, status bars, info panel |
| `deck.js` | The carrier deck: placing, selecting and moving aircraft, take-off, landing, recharging. `RunMainLoop` runs every aircraft through `UpdateAircraft` each frame |
| `stack.js` | The battle: the USA stack and the USSR attackers, firing, missiles, hits |
| `waves.js` | Levels and waves, random levels, health, victory and defeat |
| `menu.js` | Pause/level menu and fast-forward buttons |
| `tutorial.js` | The tutorial (levels 1 and 2) |
| `main.js` | The Phaser game: `preload`, `create`, and the per-frame `update` |

## The aircraft

Each USA aircraft (`sprite_deck`) is an object: `type`, `direction`, `x`/`y` deck square, `destX`/`destY`, `shield`, `fuel`, `ammo`, `action`, `sprite`, `counter`, `guid`, `slot`.
Its `action` drives everything – see `spriteActionArray` in `config.js` for the full list, and `UpdateAircraft` in `deck.js` for how one action leads to the next.

The battle stack has four altitude slots (0 = lowest). A plane can only shoot the attacker in the same slot.

## The Bear escort level

Started from the menu square right of the Google Play button. Its data (`usaWavesEscort`, `ussrWavesEscort`, `levelTextEscort`) is added after the last level as `ESCORT_LEVEL`, followed by its own victory screen, so finishing level 16 never rolls into it.
The Bear starts in slot 0 and comes back one slot higher in each of the 4 sub-waves. When the rest of a sub-wave is shot down it retreats (`EscortBearLeaves` in `stack.js`); after the last sub-wave it flies on past the carrier. It is left off the USSR health bar, and shooting it down is defeat type 3.
