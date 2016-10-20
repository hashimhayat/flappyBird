var flappy, game, platforms;
var flappy_img, backdrop, coin_img, logo, doc;
var theme, coin_sound, button_sound, dead_sound;
var platforms, coins;
var startButton, restartButton, slider, documentation;
var RESTART;

var screenW = window.innerWidth;    // Screen Width
var screenH = window.innerHeight;   // Screen Height

function preload(){
  flappy_img = loadImage("images/flappy.png");
  backdrop = loadImage("images/background.png");
  coin_img = loadImage("images/coin.png");
  logo = loadImage("images/logo.png");
  theme = loadSound("sounds/theme.mp3");
  coin_sound = loadSound("sounds/coin_collect.mp3");
  button_sound = loadSound("sounds/buttonSound.mp3");
  dead_sound = loadSound("sounds/deadSound.mp3");
}

function setup() {

  // Inits the start screen and starts a new game.
  buttonHandler();

  game = new Game();
  platforms = new Array();
  coins = new Array();
  flappy = new Flappy(200,100);
  createCanvas(screenW,game.h);
  displayStartScreen();
  RESTART = false;
  theme.play();
}

function draw() {

  // Playing theme song in a loop.
  if (theme.isPlaying() == false) {
    theme.play();
  }

  // If Restart button clicked, restart game.
  if (RESTART && game.gameEnd) {
    game = new Game();
    platforms = new Array();
    coins = new Array();
    flappy = new Flappy(200,100);
    RESTART = false;
  }

  game.start();

  // Flappy Bird functionality
  if (game.initBird){
    flappy.jump();
    flappy.show();
    flappy.drops();
  }
}

/*
  Flappy Bird Class
  Attributes: position, speed, images.
  Methods: show, jump, drop check.
*/

function Flappy(x,y){
  
  this.img_alive = flappy_img;
  this.x = x;
  this.y = y;
  this.w = this.img_alive.width;
  this.h = this.img_alive.height;
  this.image_dead;
  
  this.gravity = 5;
  this.xspeed = 10;
  this.yspeed = this.gravity*3;
   
  this.coins = 0;
  this.state = true;     // 1 for Alive 2 for Dead
  
  // Displays the Flappy Bird   
  this.show = function(){
    if (this.state == true && game.startScreen == false)
      image(flappy_img, this.x,this.y);
  }
  
  // Jumping Mechanism
  this.jump = function(){
    this.y += this.gravity;
    if (keyIsDown(32)|| touchIsDown && game.startScreen == false) {
      this.y -= this.yspeed;
    }
  }

  // Check if Flappy Hits the ground
  this.drops = function(){
    if (this.y + this.h > game.h){
        game.gameEnd = true;
    }
  }
  
}

/*
  Plaform Class: Hurdles in the game
  Attributes: Position on screen, dimensions.
  Methods: create(plant), checks for collisions, inactive
*/

function Platform(x,y){
  
  this.x = x;
  this.y = y;
  this.w = 50;
  this.h = game.h;
  this.active = true;
  
  this.img;
  this.show = true;
  
  // Displays a moving hurdle
  this.plant = function(){
    fill(50);
    rect(this.x+game.x, this.y, this.w, this.h);
  }

  // Checks for collision between Flappy and hurdle
  this.collision = function(){
    if (this.x+game.x - this.w <= flappy.x && this.y <= flappy.y + this.w && this.active){
      game.gameEnd = true;
      dead_sound.play();
    }
  }

  // Inactives a hurdle when flappy passes it
  this.inactive = function(){
    if (this.x+game.x < flappy.x){
      this.active = false;
    }
  }

}

/*
  Coin Class: Manages Coins
  Attributes: Position, Dimentions, Image
  Methods: Create(plant), checks for collision, 
*/

function Coin(x,y){
  
  this.x = x;
  this.y = y;
  this.w;
  this.h;
  
  this.img = coin_img;
  this.sound;
  this.show = true;
  
  // Puts a coin at a position
  this.plant = function(){
    if (this.show == true){
      image(this.img, this.x+game.x,this.y);
    } 
  }

  // Checks for collision, Flappy collects it.
  this.collision = function(){
    if (dist(this.x+game.x, this.y, flappy.x, flappy.y) < 50){
      this.show = false;
      game.coin_count += 1;
      coin_sound.play();
    }
  }
}

/*
  Game Class: Backbone of the whole game
  Keep tracks of the major variables of the game.
  Performs all the backend operations and functionality.
*/

function Game(){
  
  this.backdrop = backdrop;           // Background Image
  this.x = 0;                         // horizontal position of the game
  this.y = 0;
  this.w = this.backdrop.width;
  this.h = this.backdrop.height;
  this.frameSpeed = 2;                // Speed at the game moves
  this.gameEnd = false;               // State variable that keeps track of the state of the game
  this.startScreen = true;            // State variable for start screen
  this.initBird = false;              // Inits a new Flappy Bird
  this.skip = 0;
  this.coin_count = 0;

  this.start = function(){
    
    image(this.backdrop,0,0);
    RESTART = false;

    // Main functionality of the game.

    if (this.startScreen){
      displayStartScreen();
    } else {

      if (this.gameEnd == true){

          /*
              When game ends:
              - stop the background theme
              - displays the end screen
              - stops the motion of the screen
              - kills the poor flappy bird
          */

          theme.stop();
          displayEndScreen();
          this.x = 0;
          flappy.state = false;
      } else {

          /*
              When game starts:
              - inits flappy
              - append platforms and coins into global arrays
              - moves the game screen horizontally
              - displays frontend graphics
          */

          this.initBird = true
          this.addPlatforms();
          this.addCoins();
          this.x -= this.frameSpeed;
          this.skip += 80;
          showGraphics();
      }     
    }
  }


  // Creates new platforms/hurdles at random positions with random heights
  // and append in them into a global array called 'platforms'
  this.addPlatforms = function(){
      height = random(200,300);
      var r = random(0,10);
      if (r > 5){
        append(platforms, new Platform(this.skip+500,height));
      } 
  }
  // Creates new coins at random positions with random heights
  // and append in them into a global array called 'coins'
  this.addCoins = function(){
      height = random(80,150);
      var r = random(0,10);
      if (r < 5){
        append(coins, new Coin(this.skip+300,height));
      }    
  }

}

// Display FrontEnd Graphics
function showGraphics(){

  textSize(18);
  text(game.coin_count, 110,50);
  image(coin_img, 50,20);
  image(logo, screenW-logo.width-50,30);

  // Go through the array of hurdles and display them, check for collision and inactive them if necessary.
  for (var i = 0; i < platforms.length; i++){
    platforms[i].plant();
    platforms[i].collision();
    platforms[i].inactive();
  }

  // Go through the array of coins and display them, check for collision and inactive them if necessary.
  for (var i = 0; i < coins.length; i++){
    coins[i].plant();
    if (coins[i].show == true){
      coins[i].collision();
    }
    
  }
}

// Start Screen Layout
function displayStartScreen(){
  if (game.startScreen == true) {
    startButton.style('display', 'inline-block');
    slider.style('display', 'inline-block');
    restartButton.style('display', 'none');
    image(backdrop,0,0);
    image(logo, screenW-logo.width-50,30);
    textSize(50);
    var phrase = "Welcome to Flappy Bird";
    text(phrase,screenW/2-textWidth(phrase)/2,130);
    textSize(22);
    phrase = "Use Space or tap your touch screen to Jump!";
    text(phrase,screenW/2-textWidth(phrase)/2,170);
    textSize(16);
    text("1       gravity       10",screenW/2-58, 280);
  }
}

// Game End Screen Layout
function displayEndScreen(){
  image(backdrop,0,0);
  restartButton.style('display', 'inline-block');
  image(logo, screenW-logo.width-50,30);
  textSize(50);
  text("GAME OVER!",screenW-360,130);

  textSize(50);
  text(game.coin_count, 180,86);
  image(coin_img, 50,20,100,100);
  image(logo, screenW-logo.width-50,30);

}

// Function that trigers froms start button to begin the game
function onClickStart(){
  button_sound.play();
  startButton.style('display', 'none');
  slider.style('display', 'none');
  game.startScreen = false;
}

// Function that trigers from the restart button at the end of the game to reset the game
function onClickRestart(){
  button_sound.play();
  if (game.gameEnd == true) {
    RESTART = true;
  }
}

// Handles HTML elements like buttons and slider
function buttonHandler(){
  startButton = select("#startButton");
  restartButton = select("#restartButton");
  slider = select("#range1");
  documentation = select("#myBtn");
  documentation.position(screenW-190, 370);
  startButton.position(screenW/2-42, 180);
  slider.position(screenW/2-58, 250);
  restartButton.position(screenW-200, 140);
  restartButton.style('display', 'none');
}

// Gets valye from Slider
function updateRange(clickedRange) {
  flappy.gravity = int(clickedRange.value);
}
