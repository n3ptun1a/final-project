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
    background(150, 200, 255);  // blue
} else if (currentLevel === 1) {
    background(240);            // white
} else {
    background(255, 80, 80);    // red
}

  // draw hole
noStroke();
fill(0);
ellipse(holeX, holeY, 30, 30);

  // draw wells
for (var j = 0; j < wells.length; j++) {
	wells[j].show();
}
  // draw wind arrow
stroke(0);
push();
translate(50, 50);
line(0, 0, windX * 1000, windY * 1000);
var ax = windX * 1000, ay = windY * 1000;
fill(0);
triangle(ax, ay, ax - 5, ay - 5, ax + 5, ay + 5);
pop();

  // update & draw ball
ball.update();
ball.show();

  // aiming line
if (isAiming) {
	stroke(0, 150);
	line(ball.x, ball.y, mouseX, mouseY);
}

  // UI: shots & best
noStroke();
fill(0);
textSize(16);
text("shots: " + shots, 10, height - 20);
var b = bestShots[currentLevel];
if (b === undefined) b = "—";
text("best: " + b, 100, height - 20);

  // check win
var dxh = ball.x - holeX;
var dyh = ball.y - holeY;
if (sqrt(dxh * dxh + dyh * dyh) < 15) {
	if (bestShots[currentLevel] === undefined || shots < bestShots[currentLevel]) {
		bestShots[currentLevel] = shots;
		saveBest();
	}
	currentLevel++;
	if (currentLevel >= levels.length) {
		noLoop();
		fill(0);
		textSize(32);
		textAlign(CENTER);
		text("you finished all levels!", width/2, height/2);
	} else {
		initLevel(currentLevel);
	}
}