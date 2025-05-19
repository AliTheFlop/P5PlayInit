let maze;
let playerImageDown, playerImageRight, playerImageUp, playerImageLeft;
let wallImage, grassImage, startImage, finishImage;

let tileW,
    tileH = 20;

let player;

let walls = [];

let startingPositionX, startingPositionY;
let finishPositionX, finishPositionY;

function preload() {
    maze = loadStrings('/lib/maze.txt'); // LOADING THE MAZE TEXT -> gives an array of each line (Our X coordinate for when we initialize the maze)

    wallImage = loadImage('/images/stone.webp'); // Loading the tile images...
    grassImage = loadImage('/images/grass.jpg');
    startImage = loadImage('/images/start.png');
    finishImage = loadImage('/images/finish.png');

    playerImageDown = loadImage('/sprites/player_down.png'); // Player images
    playerImageRight = loadImage('/sprites/player_right.png');
    playerImageLeft = loadImage('/sprites/player_left.png');
    playerImageUp = loadImage('/sprites/player_up.png');
}

function setup() {
    createCanvas(600, 600);
    background(200);

    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            // Nested loop -> i gives us the Y and j gives us the X
            let newTile = createSprite(j * 20, i * 20, tileW, tileH);
            if (maze[i][j] === '0') {
                newTile.addImage(grassImage);
            } else if (maze[i][j] === '1') {
                newTile.addImage(wallImage);
                walls.push(newTile);
            } else if (maze[i][j] === '2') {
                newTile.addImage(startImage);
                startingPositionX = i * 20;
                startingPositionY = j * 20;

                console.log(startingPositionX, startingPositionY);
            } else if (maze[i][j] === '3') {
                newTile.addImage(finishImage);
                finishTile = newTile;
            }
        }
    }

    // Set up player, add relevant images to it
    player = createSprite(18, 18, startingPositionX, startingPositionY);
    player.addImage('down', playerImageDown);
    player.addImage('up', playerImageUp);
    player.addImage('right', playerImageRight);
    player.addImage('left', playerImageLeft);
}

function draw() {
    background(200);
    drawSprites();

    if (keyDown('LEFT_ARROW')) {
        // Move in desired direction (2px) and change to relevant image
        player.position.x -= 2;
        player.changeAnimation('left');
    }
    if (keyDown('RIGHT_ARROW')) {
        player.position.x += 2;
        player.changeAnimation('right');
    }
    if (keyDown('UP_ARROW')) {
        player.position.y -= 2;
        player.changeAnimation('up');
    }
    if (keyDown('DOWN_ARROW')) {
        player.position.y += 2;
        player.changeAnimation('down');
    }

    // Add player to collide with walls. If they collide, it's bad news.
    for (let i = 0; i < walls.length; i++) {
        player.collide(walls[i]);
    }

    // Reset player position if collides with finsih line
    if (player.collide(finishTile)) {
        player.position.y = startingPositionY;
        player.position.x = startingPositionX;
    }
}
