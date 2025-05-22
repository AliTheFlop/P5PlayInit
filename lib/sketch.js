// Space Shooter Game - R-Type Inspired (p5play v2 compatible)
// Example for Creative Coding Assignment 3

// Game variables
let gameState = "loading"; // loading, menu, game, leaderboard
let loadingProgress = 0;
let player;
let enemies = []; // Using regular arrays instead of Groups
let bullets = [];
let powerUps = [];
let score = 0;
let lives = 3;
let level = 1;
let gameFont;
let shootSound, explosionSound, powerUpSound;
let tripleShootPowerActive = false;
let tripleShootTimer = 0;
let introVideo;
let highScores = [];
let playerName = "Player27";
let inputField;
let startButton;
let playerIdleImg, playerLeftImg, playerRightImg;
let enemyDefault, enemyFast;
let bulletDefault, bulletTriple;
let backgroundVideo;

// Preload assets
function preload() {
    // In a full implementation, you'd load actual sounds and videos
    // For this example, we're just defining them
    shootSound = loadSound("/sound_effects/shoot.mp3");
    explosionSound = loadSound("/sound_effects/explosion.mp3");
    powerUpSound = loadSound("/sound_effects/powerUp.mp3");

    // Load player images
    playerIdleImg = loadImage("/sprites/Idle.png");
    playerLeftImg = loadImage("/sprites/Turn_Left.png");
    playerRightImg = loadImage("/sprites/Turn_Right.png");

    // Load missle images
    enemyDefault = loadImage("/sprites/Missle_Default.png");
    enemyFast = loadImage("/sprites/Missle_Fast.png");

    // Load bullet images
    bulletDefault = loadImage("/sprites/Charge_1.png");
    bulletTriple = loadImage("/sprites/Charge_2.png");
    bulletTripleUp = loadImage("/sprites/Charge_2.png");
    bulletTripleDown = loadImage("/sprites/Charge_2.png");

    // Load background video
    backgroundVideo = createVideo(["/videos/background.mp4"]);
    backgroundVideo.hide();

    // Load JSON data for leaderboard
    highScores = loadJSON("/lib/leaderboard.json");
}

function setup() {
    createCanvas(800, 600);

    // Create player sprite
    player = createSprite(100, height / 2, 40, 40);
    player.shapeColor = color("blue");

    // Setup input field for player name
    inputField = createInput("Player");
    inputField.position(width / 2 - 110, height / 2);
    inputField.size(200, 30);
    inputField.hide();

    // Setup start button
    startButton = createButton("Start Game");
    startButton.position(width / 2 - 50, height / 2 + 50);
    startButton.mousePressed(startGame);
    startButton.hide();

    // Setup backgrond video
    backgroundVideo.volume(0);
    backgroundVideo.elt.muted = true;
    backgroundVideo.size(width, height);
    backgroundVideo.loop();

    // Setup player images
    player.addAnimation("idle", playerIdleImg);
    player.addAnimation("turnLeft", playerLeftImg);
    player.addAnimation("turnRight", playerRightImg);
}

// Part 1 - Loading screen
function drawLoadingScreen() {
    // Simulate loading progress
    loadingProgress += 1;

    // Loading bar
    fill(50);
    rect(width / 2 - 150, height / 2, 300, 20);
    fill(0, 255, 0);
    rect(width / 2 - 150, height / 2, loadingProgress * 3, 20);

    // Loading text
    fill(255);
    textSize(24);
    textAlign(CENTER);
    text("Loading...", width / 2, height / 2 - 30);

    // Move to menu screen when loading is complete
    if (loadingProgress >= 100) {
        gameState = "menu";
        startButton.show();
        inputField.show();
    }
}

// Part 2 - Menu screen
function drawMenuScreen() {
    // Menu title
    fill(255);
    textSize(48);
    textAlign(CENTER); // Center the title horizontally
    let gameTitle = "SPACE SHOOTER";
    text(gameTitle, width / 2, 60); // Draw title at horizontal center

    // Instructions
    textSize(16);
    textAlign(CENTER, CENTER); // Horizontally and vertically center the instruction text
    text("Arrow keys to move, Space to shoot", width / 2, height / 2 + 150);
    text("Press L to view leaderboard", width / 2, height / 2 + 180);
}

// Part 3 - Game screen
function drawGameScreen() {
    // Video background for game screen
    image(backgroundVideo, 0, 0, width, height);

    // Game HUD
    fill(255);
    textSize(16);
    textAlign(LEFT);
    text("Score: " + score, 20, 30);
    text("Lives: " + lives, 20, 50);
    text("Level: " + level, 20, 70);

    // Update triple shoot power-up timer
    if (tripleShootPowerActive) {
        tripleShootTimer--;
        // Visual indicator that triple shoot is active
        fill(0, 255, 0, 100);
        ellipse(player.position.x, player.position.y, 60, 60);

        if (tripleShootTimer <= 0) {
            tripleShootPowerActive = false;
        }
    }

    // Control player with keyboard
    controlPlayer();

    // Spawn enemies randomly
    if (frameCount % 60 === 0) {
        spawnEnemy();
    }

    // Spawn power-ups occasionally
    if (frameCount % 300 === 0) {
        spawnPowerUp();
    }

    // Check enemy bounds
    for (let i = enemies.length - 1; i >= 0; i--) {
        // Check if enemy is off-screen
        if (enemies[i].position.x < -50) {
            enemies[i].remove();
            enemies.splice(i, 1);
        }
    }

    // Check for collisions
    checkCollisions();

    // Update all sprites
    drawSprites();
}

// Part 4 - Leaderboard screen
function drawLeaderboardScreen() {
    // Leaderboard title
    fill(255);
    textSize(40);
    textAlign(CENTER);
    text("HIGH SCORES", width / 2, 60);

    // Display high scores
    textSize(20);
    textAlign(LEFT);
    for (let i = 0; i < Object.keys(highScores).length; i++) {
        let y = 120 + i * 40;
        textAlign(CENTER);
        text(i + 1 + ". " + highScores[i].name, width / 2 - 150, y);
        textAlign(CENTER);
        text(highScores[i].score, width / 2 + 50, y);
        textAlign(CENTER);
        text("Level " + highScores[i].level, width / 2 + 150, y);
    }

    // Return to menu instruction
    textSize(16);
    textAlign(CENTER);
    text("Press M to return to menu", width / 2, height - 50);
}

// Check keybinds to control player
function controlPlayer() {
    // Reset velocity
    player.velocity.x = 0;
    player.velocity.y = 0;

    // Move player with arrow keys
    if (keyIsDown(LEFT_ARROW) && player.position.x > 30) {
        player.velocity.x = -5;
    }
    if (keyIsDown(RIGHT_ARROW) && player.position.x < width - 30) {
        player.velocity.x = 5;
    }
    if (keyIsDown(UP_ARROW) && player.position.y > 30) {
        player.velocity.y = -5;
    }
    if (keyIsDown(DOWN_ARROW) && player.position.y < height - 30) {
        player.velocity.y = 5;
    }
}

// Create an enemy (fast or default)
function spawnEnemy() {
    // Randomly decide if this is a fast enemy (20% chance)
    if (random() < 0.2) {
        let enemy = createSprite(width + 20, random(50, height - 50), 32, 32);
        enemy.addImage(enemyFast);
        enemy.velocity.x = -random(8, 5 + level);
        enemy.health = 3;
        enemies.push(enemy);
    } else {
        let enemy = createSprite(width + 20, random(50, height - 50), 32, 32);
        enemy.addImage(enemyDefault);
        enemy.velocity.x = -random(4, 4 + level);
        enemy.health = 2;
        enemies.push(enemy);
    }
}

function spawnPowerUp() {
    let powerUp = createSprite(width + 20, random(50, height - 50), 20, 20);

    // Randomly decide if this is a green power-up (30% chance)
    if (random() < 0.2) {
        powerUp.shapeColor = color("green");
        powerUp.type = "extraLife";
    } else {
        powerUp.shapeColor = color("yellow");
        powerUp.type = "tripleShoot";
    }

    powerUp.velocity.x = -2;
    powerUps.push(powerUp);
}

// Runs when u shoot // creates the bullets
function shoot() {
    if (tripleShootPowerActive) {
        // Straight bullet
        let bulletStraight = createSprite(
            player.position.x + 30,
            player.position.y,
            10,
            10
        );
        bulletStraight.addImage(bulletDefault);
        bulletStraight.velocity.x = 10;
        bullets.push(bulletStraight);

        // Up diagonal bullet
        let bulletUp = createSprite(
            player.position.x + 30,
            player.position.y,
            10,
            10
        );
        bulletUp.addImage(bulletTripleUp);
        bulletUp.velocity.x = 9;
        bulletUp.velocity.y = -3;
        bullets.push(bulletUp);

        // Down diagonal bullet
        let bulletDown = createSprite(
            player.position.x + 30,
            player.position.y,
            10,
            10
        );
        bulletDown.addImage(bulletTripleDown);
        bulletDown.velocity.x = 9;
        bulletDown.velocity.y = 3;
        bullets.push(bulletDown);
    } else {
        // Regular single bullet
        let bullet = createSprite(
            player.position.x + 30,
            player.position.y,
            10,
            10
        );
        bullet.addImage(bulletDefault);
        bullet.velocity.x = 10;
        bullets.push(bullet);
    }

    // Play shoot sound
    shootSound.play();
}

// Checks all collisions
function checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i] && enemies[j] && bullets[i].overlap(enemies[j])) {
                enemies[j].health -= 1;
                bullets[i].remove();
                bullets.splice(i, 1);

                // If enemy health reaches 0, destroy itttttt
                if (enemies[j].health <= 0) {
                    enemies[j].remove();
                    enemies.splice(j, 1);
                    explosionSound.play();
                    score += 10;

                    // Level up every 30 points
                    if (score % 30 === 0) {
                        level++;
                    }
                }

                break;
            }
        }
    }

    // Check player-enemy collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (player.overlap(enemies[i])) {
            enemies[i].remove();
            enemies.splice(i, 1);
            lives--;
            explosionSound.play();

            // if game over -> add name to list & sort
            if (lives <= 0) {
                // New array cause highScores loads as an object ;-;
                let newHighScores = Object.values(highScores);

                newHighScores.push({
                    name: playerName,
                    score: score,
                    level: level,
                });

                // Sort the high scores in descending order
                newHighScores.sort((a, b) => b.score - a.score);

                highScores = newHighScores;

                gameState = "leaderboard";
                inputField.show();
                startButton.show();
            }
        }
    }

    // Check player-powerup collisions
    for (let i = powerUps.length - 1; i >= 0; i--) {
        if (player.overlap(powerUps[i])) {
            let powerUpType = powerUps[i].type;
            powerUps[i].remove();
            powerUps.splice(i, 1);
            powerUpSound.play();

            if (powerUpType === "extraLife") {
                lives++; // Extra life as power up
            } else if (powerUpType === "tripleShoot") {
                tripleShootPowerActive = true;
                tripleShootTimer = 300; // Active for 300 frames
            }
        }
    }
}

// Check if a key is pressed
function keyPressed() {
    // Shooting
    if (keyCode === 32 && gameState === "game") {
        shoot();
    }

    // View leaderboard from menu
    if (key === "l" && gameState === "menu") {
        gameState = "leaderboard";
        inputField.show();
        startButton.show();
    }

    // Return to menu from leaderboard
    if (key === "m" && gameState === "leaderboard") {
        gameState = "menu";
        startButton.show();
        inputField.show();
        resetGame();
    }
}

// BEGIN GAME
function startGame() {
    gameState = "game";
    playerName = inputField.value();
    if (playerName === "") {
        playerName = "Cool Guy";
    }
    inputField.hide();
    startButton.hide();
    resetGame();
}

// RESET THE GAME
function resetGame() {
    // Reset variables
    score = 0;
    lives = 3;
    level = 1;
    tripleShootPowerActive = false;
    tripleShootTimer = 0;

    // Clear sprites
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].remove();
    }
    enemies = [];

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].remove();
    }
    bullets = [];

    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].remove();
    }
    powerUps = [];

    // Reset position
    player.position.x = 100;
    player.position.y = height / 2;
}

// DRAW GAME
function draw() {
    background(0);

    switch (gameState) {
        case "loading":
            drawLoadingScreen();
            break;
        case "menu":
            drawMenuScreen();
            break;
        case "game":
            drawGameScreen();
            break;
        case "leaderboard":
            drawLeaderboardScreen();
            break;
    }
}
