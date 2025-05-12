// lets go golfing - dj khaled
// uses p5.Vector, localStorage (according to research)

// levels who wouldve thunk it
let levels = [
	{
		startX: 100, startY: 500,
		holeX: 700,   holeY: 100,
		windX: 0.02,  windY: 0,
		wells: [
			{ x: 200, y: 300, strength: 100 },
			{ x: 400, y: 200, strength: 200 }
		]
	},
	{
		startX: 50,  startY: 550,
		holeX: 750,  holeY: 50,
		windX: -0.01, windY: 0,
		wells: [
			{ x: 300, y: 400, strength: 300 },
			{ x: 500, y: 150, strength: 150 }
		]
	}
];

// globals
let currentLevel = 0;
let ball;
let holeX, holeY; // misused holePos, didnt even reintroduce throughout the rest of the program lol
let windX, windY;  // (i think I had forgot to change holePos in my openprocessing window as well so it worked there but I just noticed it was mismatched)
let wind;            // p5.Vector
let wells = [];      // array of Well
let shots, bestShots = {}; // see loadBest

// aiming
let isAiming = false;

function setup() {
	createCanvas(800, 600);
	loadBest(); // forgot to mention!! this is where i plan to implement a function that i will declare later that will save the users best score on each hole
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
  // flat‑color backgrounds (changed to grass)
	clear();
	drawGrassWallpaper();

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
}

function mousePressed() {
  var dx = mouseX - ball.x; //checks for mouse input
  var dy = mouseY - ball.y;
  if (sqrt(dx*dx + dy*dy) < ball.r) {
  	isAiming = true;
  }
}

function mouseReleased() { // shoot the ball!
	if (isAiming) {
		var vx = (ball.x - mouseX) * 0.1;
		var vy = (ball.y - mouseY) * 0.1;
		ball.velX += vx;
		ball.velY += vy;
		shots++;
		isAiming = false;
	}
}

// ---- grass ----- (borrowed my own code from the wallpaper sketch)
function drawGrassWallpaper() {
	let tile = 50;
  // grass angle = wind direction + 90°
	let grassAngle = atan2(windY, windX) + PI/2;

	for (let y = 0; y < height; y += tile) {
		for (let x = 0; x < width;  x += tile) {
			drawTileGrass(x, y, tile, grassAngle);
		}
	}
}

function drawTileGrass(x, y, size, angle) {
	push();
    // move origin to center of this tile
	translate(x + size/2, y + size/2);
    // lean into wind
	rotate(angle);

    // alternate light/dark green
	let checker = ((x/size) + (y/size)) % 2;
	if (checker < 1) {
      fill(144, 238, 144, 150);  // light green, semi‑transparent
  } else {
      fill(34, 139, 34, 150);    // dark green, semi‑transparent
  }
  noStroke();

    // draw a triangle blade with base at bottom
  triangle(
      -size/2,  size/2,   // bottom left
       size/2,  size/2,   // bottom right
           0,   -size/2   // top center
           );
  pop();
}

// ----- ball class -----
class Ball {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.velX = 0;
		this.velY = 0;
		this.r    = 12;
	}
	update() {
    // wind
		this.velX += windX;
		this.velY += windY;
    // wells
		for (var i = 0; i < wells.length; i++) {
      var w = wells[i]; // applies whatever comes next for each well
      var dx = w.x - this.x; // distance from ball to well
      var dy = w.y - this.y;
      var distSq = dx*dx + dy*dy;
      if (distSq < 1) distSq = 1; // no div by 0 on my watch
      var force = w.strength / distSq;
      var d = sqrt(dx*dx + dy*dy);
      if (d > 0) {
      	dx /= d; dy /= d;
      }
      this.velX += dx * force;
      this.velY += dy * force;
  }
    // movement and such blah blah
  this.x += this.velX;
  this.y += this.velY;
  this.velX *= 0.995;
  this.velY *= 0.995;
    // bounds
  if (this.x < 0) this.x = 0;
  if (this.x > width) this.x = width;
  if (this.y < 0) this.y = 0;
  if (this.y > height) this.y = height;
}
show() {
	stroke(0);
	fill(200, 200, 0);
	ellipse(this.x, this.y, this.r*2, this.r*2);
}
}

// ----- Well class -----
class Well {
	constructor(x, y, strength) {
		this.x = x;
		this.y = y;
		this.strength = strength;
	}
	show() {
		noFill();
		stroke(0, 0, 200, 100);
		ellipse(this.x, this.y, this.strength*0.5, this.strength*0.5);
	}
}

// ----- localStorage helpers -----
function loadBest() {
	var js = localStorage.getItem("gg_best");
	if (js) bestShots = JSON.parse(js);
}
function saveBest() {
	localStorage.setItem("gg_best", JSON.stringify(bestShots));
}