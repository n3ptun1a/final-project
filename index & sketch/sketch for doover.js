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