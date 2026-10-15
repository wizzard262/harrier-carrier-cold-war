# Harrier Carrier – browser game code

Plain JavaScript, no build step. `index.htm` loads the libraries and then the game files in order with `<script src>`; everything is in global scope, as before the refactor.

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
