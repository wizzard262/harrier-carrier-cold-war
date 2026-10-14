/*
 * Harrier Carrier - level data
 *   usaWaves[level]   USA aircraft on deck at the start: [typeIndex (see spriteTypeArray), direction, x, y]
 *   ussrWaves[level]  USSR attack sub-waves, each 4 altitude slots from the top: type or null
 *   levelText         the Admiral's briefing for each level (5 lines)
 *   defeatText        the Admiral's debrief when you lose
 *   touchIconTutorial tutorial hand positions: [x, y, icon, fade ms]
 *   tiles_sea         water tiles around the carrier
 */

var touchIconTutorial = [
    [270, 475, 'touch_icon_left', 1000],    //start on deck :0
    [285, 400, 'touch_icon_left', 1000],    //take off arrow :1
    [-200, -200, 'touch_icon_left', 1000],  //hide off screen :2
    [300, 100, 'wait_icon', 1000],          //wait icon :3
    [160, 320, 'touch_icon_bottom', 1000],  //return to carrier icon :4
    [-300, -300, 'touch_icon_left', 2000],  //hide off screen :5

    [300, 100, 'wait_icon', 1000],           //wait icon :6
    [400, 480, 'touch_icon_left', 1000],     //deck on fuel :7
    [290, 540, 'touch_icon_left', 1000],     //deck on shield :8
    [300, 100, 'wait_icon', 1000],           //wait icon :9
    [290, 540, 'touch_icon_left', 1000],     //deck on shield  :10
    [175, 590, 'touch_icon_left', 1000],     //deck on ammo :11
    [300, 100, 'wait_icon', 1000],           //wait icon :12
    [175, 590, 'touch_icon_left', 1000],     //deck on ammo :13
    [175, 510, 'touch_icon_left', 1000],     //take off arrow :14
    [-100, -100, 'touch_icon_left', 1000],   //hide off screen :15
    [300, 100, 'wait_icon', 1000],           //wait icon :16
    [160, 320, 'touch_icon_bottom', 1000],   //return to carrier icon :17
    [300, 100, 'wait_icon', 1000],           //wait icon :18
    [175, 590, 'touch_icon_left', 1000],     //deck on ammo :19
    [175, 510, 'touch_icon_left', 1000],     //take off arrow :20
    [300, 100, 'wait_icon', 1000],           //wait icon :21
    [160, 320, 'touch_icon_bottom', 1000],   //return to carrier icon :22
    [300, 100, 'wait_icon', 1000],           //wait icon :23
];

var tiles_sea = [
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 0, 2, 3],
    [1, 1, 1, 1, 1, 1, 3, 0]
];

// type, direction, x, y
var usaWaves = [
        [
           [0, 1, 0, 1]
        ],
        [
           [0, 2, 1, 0]
        ],
        [
            [0, 1, 0, 1],
            [0, 1, 0, 2]
        ],
        [
            [1, 0, 3, 2],
            [3, 1, 0, 0]
        ],
        [
            [0, 1, 0, 1],
            [0, 1, 0, 2],
            [2, 0, 3, 2]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 1],
            [0, 1, 0, 2],
            [0, 1, 0, 3],
            [0, 1, 0, 4],
            [0, 1, 0, 5],
            [0, 1, 0, 6],
            [0, 1, 0, 7]
        ],
        [
            [1, 0, 3, 0],
            [1, 0, 3, 2],
            [1, 0, 1, 5],
            [1, 0, 1, 6],
            [1, 0, 1, 7]
        ],
        [
            [3, 1, 0, 0],
            [3, 1, 0, 1],
            [0, 1, 0, 2],
            [0, 1, 0, 3],
            [0, 1, 0, 4],
            [0, 1, 0, 5],
            [0, 1, 0, 6],
            [0, 1, 0, 7],
            [1, 3, 3, 2],
            [1, 3, 3, 3],
            [2, 3, 3, 4],
            [2, 3, 3, 5]
        ]
];

 var usaWaves2 = [
    [
        [3, 1, 0, 0],
        [4, 0, 3, 2]
    ],
    [
        [2, 0, 3, 2],
        [2, 0, 3, 3],
        [2, 0, 3, 4],
        [1, 0, 3, 5]
    ],
    [
        [3, 1, 0, 0],
        [3, 1, 0, 1]
    ],
    [
         [4, 0, 3, 2],
         [4, 0, 3, 3],
         [4, 0, 3, 4],
         [4, 0, 3, 5],
         [4, 0, 3, 6],
         [4, 0, 3, 7]
    ],
    [
         [3, 1, 0, 0],
         [3, 1, 0, 1],
         [1, 3, 1, 1],
         [2, 1, 2, 2],
         [0, 2, 2, 4],
         [4, 3, 3, 7],
         [0, 3, 3, 0],
         [0, 3, 0, 7]
    ],
    [
        [6, 1, 0, 0],
        [6, 0, 0, 1],
        [6, 2, 0, 2],
        [6, 3, 0, 3],
        [6, 2, 0, 4],
        [6, 3, 0, 5],
        [6, 2, 0, 6],
        [6, 0, 0, 7],
        [6, 0, 1, 0],
        [1, 3, 1, 1],
        [6, 2, 1, 2],
        [6, 1, 1, 3],
        [6, 1, 1, 4],
        [6, 0, 1, 5],
        [6, 1, 1, 6],
        [6, 3, 1, 7],
        [6, 1, 2, 0],
        [6, 1, 2, 1],
        [6, 0, 2, 2],
        [6, 3, 2, 3],
        [6, 2, 2, 4],
        [6, 2, 2, 5],
        [6, 3, 2, 6],
        [6, 0, 2, 7],
        [6, 2, 3, 0],
        [6, 0, 3, 1],
        [6, 3, 3, 2],
        [6, 2, 3, 3],
        [6, 2, 3, 4],
        [1, 1, 3, 5],
        [6, 0, 3, 6],
        [6, 3, 3, 7]
    ],
    [
        [7, 0, 0, 0],
        [0, 1, 0, 1],
        [0, 1, 0, 2],
        [0, 1, 0, 3]
    ],
    [
        [3, 1, 0, 0],
        [3, 1, 0, 1],
        [0, 1, 0, 2],
        [0, 1, 0, 3],
        [0, 1, 0, 4],
        [0, 1, 0, 5],
        [0, 1, 0, 6],
        [0, 1, 0, 7],
        [1, 3, 3, 2],
        [1, 3, 3, 3],
        [4, 3, 3, 4],
        [4, 3, 3, 5],
        [2, 3, 3, 6],
        [2, 3, 3, 7]
    ]
];

//random level
var usaWavesRandom = [];

var ussrWaves = [
    [
        [
            null,
            null,
            null,
            'mig15'
        ]
    ],
    [
        [
            null,
            null,
            null,
            'mig15'
        ]
    ],
    [
        [
            null,
            null,
            'mig21',
            null
        ]
    ],
    [
        [
            null,
            null,
            'mig15',
            'mig21'
        ]
    ],
    [
        [
            null,
            'mig15',
            null,
            'mig15'
        ]
    ],
    [
        [
            'mig15',
            'mig15',
            'mig15',
            'mig15',
        ],
        [
            null,
            null,
            null,
            'bear'
        ]
    ],
    [
        [
            null,
            'fulcrum',
            null,
            'fulcrum'
        ]
    ],
    [
        [
            'mig15',
            'mig21',
            'mig21',
            'mig15'
        ],
        [
            null,
            null,
            'fulcrum',
            'fulcrum'
        ],
        [
            null,
            null,
            null,
            'mig15'
        ],
        [
            null,
            null,
            null,
            'bear'
        ],
        [
            null,
            null,
            'bear',
            'mig21'
        ]
    ]
];

var ussrWaves2 = [
    [
        [
            'foxbat',
            null,
            null,
            'mig15'
        ],
        [
            null,
            null,
            null,
            'fulcrum'
        ],
        [
            null,
            null,
            null,
            'mig21'
        ]
    ],
    [
        [
            'bear',
            null,
            null,
            null
        ]
    ],
    [
        [
            null,
            'foxbat',
            null,
            null
        ],
        [
            null,
            null,
            'foxbat',
            'foxbat'
        ],
        [
            null,
            'foxbat',
            'foxbat',
            'foxbat'
        ]
    ],
    [
        [
            null,
            'fulcrum',
            'fulcrum',
            'fulcrum'
        ],
        [
            null,
            'fulcrum',
            'fulcrum',
            'fulcrum'
        ],
        [
            null,
            'fulcrum',
            'fulcrum',
            'fulcrum'
        ]
    ],
    [
        [
            null,
            null,
            null,
            'mig15'
        ],
        [
            'mig21',
            'bear',
            null,
            'fulcrum',
        ],
        [
            null,
            null,
            null,
            'mig21'
        ],
        [
            'mig21',
            'fulcrum',
            'bear',
            'mig21'
        ]
    ],
    [
        [
            'mig15',
            'mig15',
            'mig15',
            'mig15'
        ],
        [
            null,
            'mig15',
            'mig15',
            'mig15'
        ]
    ],
    [
        [
            null,
            'mig15',
            null,
            'mig15'
        ],
        [
            null,
            null,
            'mig21',
            'mig21'
        ]
    ],
    [
        [
            'mig15',
            null,
            null,
            null
        ],
        [
            null,
            'mig21',
            null,
            null
        ],
        [
            null,
            null,
            'fulcrum',
            null
        ],
        [
            null,
            null,
            null,
            'bear'
        ],
        [
            null,
            'mig15',
            null,
            'mig15'
        ],
        [
            'mig21',
            null,
            'mig21',
            null
        ],
        [
            null,
            null,
            null,
            'mig15'
        ],
        [
            null,
            null,
            'foxbat',
            'mig15'
        ],
        [
            null,
            'fulcrum',
            'fulcrum',
            'fulcrum'
        ],
        [
            null,
            'bear',
            null,
            'bear'
        ],
        [
            'bear',
            'foxbat',
            'fulcrum',
            'mig21'
        ]
    ],
    //this level needed to reset level 16 correctly
    [
        [null, null, null, null]
    ]
];

//random level
var ussrWavesRandom = [];

var levelText = [
    [
        ['Hostile bandit attacking!'],
        ['This is basic training'],
        ['hotshot so listen up: stay'],
        ['sharp, watch your six,'],
        ['KEEP CALM and TAP AIRCRAFT'],
    ],
    [
        [' Your HARRIER is depleted.'],
        [' Before engaging recharge:'],
        [' - PURPLE fuel'],
        [' - YELLOW shield'],
        [' - RED ammo'],
    ],
    [
        ['Bogey detected at higher'],
        ['altitude. Stack 2 HARRIERS'],
        ['to make contact. DO NOT'],
        ['exceed your BINGO, return'],
        ['to mother and reprovision'],
    ],
    [
        ['Use CAT to deploy TOMCAT'],
        ['Use SEAKING to jam that'],
        ['threat ASAP! Maintain a'],
        ['high-level of situation'],
        ['awareness at all times!'],
    ],
    [
        ['The HAWKEYE can facilitate'],
        ['a strategic air-superiorty'],
        ['outcome. It\'s RADAR will'],
        ['improve the fire-rate of'],
        ['your combat assets. Hooyah!'],
    ],
    [
        ['Reports of multiple'],
        ['hostiles incoming. Scramble'],
        ['the whole Air-Wing!'],
        ['Be advised we suspect they'],
        ['may be escorting a BOMBER!'],
    ],
    [
        ['F14\'s cost taxpayers US$38M'],
        ['per unit.Prang it and it\'ll'],
        ['come out your pay Ace! Keep'],
        ['CAT TRACK and RUNWAY clear'],
        ['of aircraft, or else.....']
    ],
    [
        ['The Reds are mounting a'],
        ['major offensive. Protect'],
        ['your healthbar and don\'t'],
        ['let this go FUBAR!'],
        ['Good luck Ace!']
    ]
];

var levelText2 = [
    [
        ['Intel indicates a FOXBAT'],
        ['will attempt to defect if'],
        ['it can breakaway from it\'s'],
        ['squadron. Clear it\'s path!'],
        ['Expect a retaliation!']
    ],
    [
        ['A BOMBER is approacing at'],
        ['high-altitude. Intercept.'],
        ['SIERRA-HOTEL flying may '],
        ['prevent this turning into'],
        ['another CHARLIE-FOXTROT!'],
    ],
    [
        ['More FOXBATs approaching.'],
        ['Exfiltrate as many as'],
        ['possible. Use Electronic'],
        ['Counter Measures to protect'],
        ['the boat. Chocks away!']
    ],
    [
        ['A full squadron of FULCRUMs'],
        ['is on the horizon. Use our'],
        ['massive superior firepower'],
        ['to gain tactical advantage'],
        ['in the operational theatre.']
    ],
    [
        ['SEAKINGS can buy you time'],
        ['whilst threat level is low.'],
        ['Tidy up the flight-deck and'],
        ['replenish assets resources'],
        ['before you proceed.']
    ],
    [
        ['Saigon has fallen! HUEYs'],
        ['on evac are compromizing'],
        ['flight-deck operations'],
        ['Ditch them ASAP and'],
        ['don\'t let them return!']
    ],
     [
        ['Our U2 has been spotted!'],
        ['It can\'t land on a carrier.'],
        ['Keep it flying to prevent'],
        ['another embarrassing major'],
        ['international incident'],
     ],
     [
        ['This is the big one!'],
        ['The Soviets have deployed'],
        ['everything they have left!'],
        ['Western democratic freedom'],
        ['will hinge on this battle']
     ],
     [
        ['Congratulations TOPGUN!'],
        ['That was some real Ace'],
        ['flying son! You\'ve saved'],
        ['the free world from the'],
        ['Commies. Outstanding!']
     ]
];

var defeatText = [
    [
        ['What is your major'],
        ['malfunction numbnuts? You'],
        ['lost the carrier! See me'],
        ['in ready room at T-MINUS'],
        ['oh-six-hundred hours.'],
    ],
    [
        ['You have compromized the '],
        ['carriers operation capacity'],
        ['by losing all its aircraft!'],
        ['Reinforcements are on-route.'],
        ['ETA Zero Dark Thirty'],
    ],
    [
        ['You lost the U2 over Soviet'],
        ['airspace!(1st May 1960)'],
        ['Major political incident.'],
        ['Try cycling the U2 around'],
        ['when missiles approach']
    ]
];

if (FullGameEnabled) {
    usaWaves = usaWaves.concat(usaWaves2);
    ussrWaves = ussrWaves.concat(ussrWaves2);
    levelText = levelText.concat(levelText2);
}
else
{
    ussrWaves = ussrWaves.concat([[[null, null, null, null]]]);
    levelText = levelText.concat(
    [
      [
        ['Go to Google Play and'],
        ['get full game: including'],
        ['A10 tankbuster, U2 spyplane'],
        ['Bell Huey helipcoter and'],
        ['Mig 25 Foxbat defector!']
      ]
    ]
    );
}
