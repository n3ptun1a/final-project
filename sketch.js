let mic;
let micLevel;
let pitch = 0;

let currentScreen = "mainMenu";
let unlockedLevels = [true, false, false];

let currentLevel = null;
let platforms = [];
let snowflakes = [];
let fireCinders = [];

let ball;
let victorySound;

function setup() {
  createCanvas(800, 600);
  
  mic = new p5.AudioIn();
  mic.start();
  
  ball = new Player();
  
  // Load sound for victory
  victorySound = loadSound('data/victorySound.mp3');
}

function draw() {
  background(200);

  if(currentScreen == "mainMenu"){
    drawMainMenu();
  } else if(currentScreen == "settings"){
    drawSettings();
  } else if(currentScreen == "info"){
    drawInfo();
  } else if(currentScreen == "levelSelect"){
    drawLevelSelect();
  } else if(currentScreen == "playing"){
    playGame();
  }
}

function drawMainMenu(){
  textSize(40);
  textAlign(CENTER);
  text("MIC ADVENTURE", width/2, 100);
  rect(width/2 - 100, 200, 200, 50);
  text("PLAY", width/2, 235);
  rect(width/2 - 100, 270, 200, 50);
  text("INFO", width/2, 305);
  rect(width/2 - 100, 340, 200, 50);
  text("SETTINGS", width/2, 375);
}

function drawSettings(){
  textSize(30);
  text("settings lol", width/2, height/2);
}

function drawInfo(){
  textSize(30);
  text("info screen", width/2, height/2);
}

function drawLevelSelect(){
  textSize(40);
  text("Pick a Level", width/2, 100);

  textSize(30);
  text(unlockedLevels[0] ? "1-1" : "1-1 (locked)", width/2, 180);
  text(unlockedLevels[1] ? "1-2" : "1-2 (locked)", width/2, 250);
  text(unlockedLevels[2] ? "1-3" : "1-3 (locked)", width/2, 320);
}

function mousePressed(){
  if(currentScreen == "mainMenu"){
    if(mouseY > 200 && mouseY < 250) currentScreen = "levelSelect";
    if(mouseY > 270 && mouseY < 320) currentScreen = "info";
    if(mouseY > 340 && mouseY < 390) currentScreen = "settings";
  }

  if(currentScreen == "levelSelect"){
    if(mouseY > 150 && mouseY < 200 && unlockedLevels[0]) startLevel(1);
    if(mouseY > 220 && mouseY < 270 && unlockedLevels[1]) startLevel(2);
    if(mouseY > 290 && mouseY < 340 && unlockedLevels[2]) startLevel(3);
  }
}

function startLevel(n){
  currentLevel = n;
  currentScreen = "playing";

  ball.reset();

  platforms = [];
  if(n == 1){
    platforms.push(new Platform(0, 550, 800, 50)); // ground
  } else if(n == 2){
    platforms.push(new Platform(0, 550, 800, 50)); // ground
  } else if(n == 3){
    platforms.push(new Platform(0, 550, 800, 50)); // ground
  }

  // Add snowflakes or fire cinders
  if(n == 2){
    for (let i = 0; i < 50; i++){
      snowflakes.push(new Snowflake());
    }
  } else if(n == 3){
    for (let i = 0; i < 50; i++){
      fireCinders.push(new FireCinder());
    }
  }
}

function playGame(){
  micLevel = mic.getLevel();
  pitch = mic.getLevel() * 500;

  if(currentLevel == 1){
    background(150,200,255); // blue sky
  } else if(currentLevel == 2){
    background(255); // white for snow
    // Snow effect for 1-2
    for (let snowflake of snowflakes){
      snowflake.update();
      snowflake.show();
    }
  } else {
    background(255,80,80); // red for fire
    // Fire cinders for 1-3
    for (let fire of fireCinders){
      fire.update();
      fire.show();
    }
  }

  ball.update();
  ball.show();

  for(let i = 0; i < platforms.length; i++){
    platforms[i].show();
  }

  drawMicUI();
}

function drawMicUI(){
  fill(255);
  rect(20, 20, 150, 20);
  fill(0,255,0);
  rect(20, 20, micLevel * 150 * 10, 20);

  fill(255);
  rect(20, 50, 150, 20);
  fill(0,0,255);
  rect(20 + 75, 50, (pitch - 128)/128 * 75, 20);
}

class Player {
  constructor(){
    this.reset();
  }

  reset(){
    this.x = 50;
    this.y = 500;
    this.vx = 0;
    this.vy = 0;
    this.color = color(255,255,0);
    this.sticky = false;
  }

  update(){
    if(micLevel > 0.01){
      this.vx += micLevel * 2;
    } else {
      this.vx *= 0.9;
    }

    if(pitch < 100){
      this.vy = -10;
      this.color = color(0,0,255); // blue
    } else if(pitch > 200){
      this.sticky = true;
      this.color = color(0,255,0); // green
    } else {
      this.sticky = false;
      this.color = color(255,255,0); // yellow
    }

    if(!this.sticky){
      this.vy += 0.5;
    }

    this.x += this.vx;
    this.y += this.vy;

    for(let i=0; i<platforms.length; i++){
      let p = platforms[i];
      if(this.x > p.x && this.x < p.x + p.w && this.y + 10 > p.y && this.y + 10 < p.y + p.h){
        this.y = p.y - 10;
        this.vy = 0;
        if(p.x > 700){
          this.winLevel();
        }
      }
    }

    if(this.y > height){
      this.reset();
    }
  }

  show(){
    fill(this.color);
    ellipse(this.x, this.y, 20, 20);

    if(micLevel < 0.01){
      fill(255,0,0);
      ellipse(this.x, this.y - 30, 30, 30);
      fill(255);
      textSize(12);
      textAlign(CENTER);
      text("Speak up!", this.x, this.y - 40);
    }
  }

  winLevel(){
    victorySound.play();
    unlockedLevels[currentLevel] = true;
    currentScreen = "levelSelect";
  }
}

class Platform {
  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  show(){
    fill(100);
    rect(this.x, this.y, this.w, this.h);
  }
}

// Snowflakes for level 1-2
class Snowflake {
  constructor(){
    this.x = random(width);
    this.y = random(-500, -50);
    this.size = random(5, 10);
    this.speed = random(1, 3);
  }

  update(){
    this.y += this.speed;
    if(this.y > height){
      this.y = random(-500, -50);
    }
  }

  show(){
    fill(255);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
}

// Fire cinders for level 1-3
class FireCinder {
  constructor(){
    this.x = random(width);
    this.y = random(-500, -50);
    this.size = random(2, 5);
    this.speed = random(2, 4);
    this.color = color(random(255), random(100, 200), 0);
  }

  update(){
    this.y += this.speed;
    if(this.y > height){
      this.y = random(-500, -50);
    }
  }

  show(){
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
}
