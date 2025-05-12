// lets go golfing - dj khaled
// uses p5.Vector, localStorage (according to research)

// globals
let levels = [];
let currentLevel = 0;
let ball;
let holePos;
let wind;            // p5.Vector
let wells = [];      // array of Well
let shots, bestShots = {};

// aiming
let isAiming = false;

function setup() {
	createCanvas(800, 600);
	loadBest();
	initLevel(0);
}

function initLevel(idx) {
  currentLevel = idx;
  var L = levels[idx];

  // create ball
  ball = new Ball(L.startX, L.startY);

  // hole
  holeX = L.holeX;
  holeY = L.holeY;

  // wind
  windX = L.windX;
  windY = L.windY;

  // wells
  wells = [];
  for (var i = 0; i < L.wells.length; i++) {
    var w = L.wells[i];
    wells.push(new Well(w.x, w.y, w.strength));
  }

  shots = 0;
}

function draw() {
  // flat‑color backgrounds
  if (currentLevel === 0) {
    background(150, 200, 255);  // foresty blue
  } else if (currentLevel === 1) {
    background(240);            // snowy white
  } else {
    background(255, 80, 80);    // hellish red
  }

  // draw hole
  noStroke();
  fill(0);
  ellipse(holeX, holeY, 30, 30);

  // draw wells
  for (var j = 0; j < wells.length; j++) {
    wells[j].show();
  }