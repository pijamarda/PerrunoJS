/**
 * Define an object to hold all our images for the game so images
 * are only ever created once. This type of object is known as a
 * singleton.
 */
console.log("load perruno");
var imageRepository = new function() 
{
	// Define images
	this.background = new Image();
	this.perro = new Image();
	this.hueso = new Image();
	// Ensure all images have loaded before starting the game
	var numImages = 3;
	var numLoaded = 0;
	function imageLoaded() 
	{
		numLoaded++;
		if (numLoaded === numImages) 
		{
			window.init();
		}
	}

	this.background.onload = function() {
		imageLoaded();
	}
	this.perro.onload = function() {
		imageLoaded();
	}
	this.hueso.onload = function() {
		imageLoaded();
	}

// Set images src 
	this.background.src = "img/jardin.png"; 
	this.perro.src = "img/perro_peque.png";
	this.hueso.src = "img/huesito.png";
}

/**
 * Creates the Drawable object which will be the base class for
 * all drawable objects in the game. Sets up default variables
 * that all child objects will inherit, as well as the default
 * functions.
 */
function Drawable() 
{
	this.init = function(x, y, width, height) 
	{
		// Default variables
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	// Define abstract function to be implemented in child objects 
	this.draw = function() { }; 
} 

/**
 * Creates the Background object which will become a child of
 * the Drawable object. The background is drawn on the "background"
 * canvas and creates the illusion of moving by panning the image.
 */

function Background() 
{
	this.speed = 0; // Redefine speed of the background for panning
	// Implement abstract function
	this.draw = function() 
	{
		// Pan background
		this.y += this.speed;
		this.context.drawImage(imageRepository.background, this.x, this.y);
		// Draw another image at the top edge of the first image
		this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);

		// If the image scrolled off the screen, reset 
		if (this.y >= this.canvasHeight) 
			this.y = 0; 
	}; 
}
Background.prototype = new Drawable();

/**
 * Create the Ship object that the player controls. The ship is
 * drawn on the "ship" canvas and uses dirty rectangles to move
 * around the screen.
 */
function Perro() 
{
	this.speed = 3;
	//this.bulletPool = new Pool(30);
	//this.bulletPool.init();
	var fireRate = 15;
	var counter = 0;
	this.draw = function() 
	{
		this.context.drawImage(imageRepository.perro, this.x, this.y);
	};
	this.move = function() 
	{
		counter++;
		// Determine if the action is move action
		if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up) 
		{
			// The ship moved, so erase it’s current image so it can
			// be redrawn in it’s new location
			this.context.clearRect(this.x, this.y, this.width, this.height);
			// Update x and y according to the direction to move and
			// redraw the ship. Change the else if’s to if statements
			// to have diagonal movement.
			if (KEY_STATUS.left) 
			{
				this.x -= this.speed
				if (this.x <= 0) // Keep player within the screen
					this.x = 0;
			} else if (KEY_STATUS.right) 
			{
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) 
			{
				this.y -= this.speed
				if (this.y <= this.canvasHeight/4*3)
					this.y = this.canvasHeight/4*3;
			} else if (KEY_STATUS.down) 
			{
				this.y += this.speed
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}
			// Finish by redrawing the ship
			this.draw();
		}
		if (KEY_STATUS.space && counter >= fireRate) 
		{
			//this.fire();
			counter = 0;
		}
	};

	/* 
	* Fires two bullets 
	 
	this.fire = function() 
	{ 
		this.bulletPool.getTwo(this.x+6, this.y, 3, this.x+33, this.y, 3); 
	}; */
} 
Perro.prototype = new Drawable()

/**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() 
{
	/*
	 * Gets canvas information and context and sets up all game
	 * objects.
	 * Returns true if the canvas is supported and false if it
	 * is not. This is to stop the animation script from constantly
	 * running on older browsers.
	 */
	this.init = function() 
	{
		// Get the canvas element
		this.bgCanvas = document.getElementById('background');
		this.perroCanvas = document.getElementById('perro');
		this.mainCanvas = document.getElementById('main');
		// Test to see if canvas is supported
		if (this.bgCanvas.getContext) 
		{
			this.bgContext = this.bgCanvas.getContext('2d');
			this.perroContext = this.perroCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');
			// Initialize objects to contain their context and canvas
			// information
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			Perro.prototype.context = this.perroContext;
			Perro.prototype.canvasWidth = this.perroCanvas.width;
			Perro.prototype.canvasHeight = this.perroCanvas.height;
			//Bullet.prototype.context = this.mainContext;
			//Bullet.prototype.canvasWidth = this.mainCanvas.width;
			//Bullet.prototype.canvasHeight = this.mainCanvas.height;
			// Initialize the background object
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0
			// Initialize the ship object
			this.perro = new Perro();
			// Set the ship to start near the bottom middle of the canvas
			var perroStartX = this.perroCanvas.width/2 - imageRepository.perro.width;
			var perroStartY = this.perroCanvas.height/4*3 + imageRepository.perro.height*2;
			this.perro.init(perroStartX, perroStartY, imageRepository.perro.width,
			               imageRepository.perro.height);
			return true;
		} 
		else 
		{
			return false;
		}
	};

	// Start the animation loop 
	this.start = function() 
	{ 
		this.perro.draw();
		animate(); 
	}; 
} 

/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() 
{
	requestAnimFrame( animate );
	game.background.draw();
	game.perro.move();
}

/** 
* requestAnim shim layer by Paul Irish 
* Finds the first API that works to optimize the animation loop, 
* otherwise defaults to setTimeout(). 
*/

window.requestAnimFrame = (function()
{
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element)
			{
				window.setTimeout(callback, 1000 / 60);
			};
})();

/**
 * Initialize the Game and starts it.
 */
var game = new Game();

function init() 
{ 
	if(game.init()) 
		game.start(); 
}; 

console.log("load perruno");

// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = 
{
	32: 'space',
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
}

// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) 
{
	KEY_STATUS[ KEY_CODES[ code ]] = false;
}

/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) 
{
	// Firefox and opera use charCode instead of keyCode to
	// return which key was pressed.
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if (KEY_CODES[keyCode]) 
	{
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = true;
	}
}

/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) 
{
	var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
	if (KEY_CODES[keyCode]) 
	{
		e.preventDefault();
		KEY_STATUS[KEY_CODES[keyCode]] = false;
	}
}


this.bgCanvas = document.getElementById('background');

document.getElementById('perro').addEventListener("mousedown", getPosition, false);

function getPosition(event)
{
  var x = event.x;
  var y = event.y;

  var canvas = document.getElementById("perro");

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  //alert("x:" + x + " y:" + y);
  console.log("x:" + x + " y:" + y);
}