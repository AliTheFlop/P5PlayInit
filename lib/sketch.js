// Space Shooter Game - R-Type Inspired (p5play v2 compatible)
// Example for Creative Coding Assignment 3

// Game variables
let gameState = 'loading'; // loading, menu, game, leaderboard
let loadingProgress = 0;
let player;
let enemies = []; // Using regular arrays instead of Groups
let bullets = [];
let powerUps = [];
let stars = [];
let score = 0;
let lives = 3;
let level = 1;
let gameFont;
let shootSound, explosionSound, powerUpSound;
let tripleShootPowerActive = false;
let tripleShootTimer = 0;
let introVideo;
let highScores = [];
let playerName = '';
let inputField;
let startButton;
let playerIdleImg, playerLeftImg, playerRightImg;
let enemyDefault, enemyFast;
let bulletDefault, bulletTriple;

// Preload assets
function preload() {
    // In a full implementation, you'd load actual sounds and videos
    // For this example, we're just defining them
    shootSound = {
        play: function () {
            console.log('Pew!');
        },
    };
    explosionSound = {
        play: function () {
            console.log('Boom!');
        },
    };
    powerUpSound = {
        play: function () {
            console.log('PowerUp!');
        },
    };

    // Load player images
    playerIdleImg = loadImage('/sprites/Idle.png');
    playerLeftImg = loadImage('/sprites/Turn_Left.png');
    playerRightImg = loadImage('/sprites/Turn_Right.png');

    // Load missle images
    enemyDefault = loadImage('/sprites/Missle_Default.png');
    enemyFast = loadImage('/sprites/Missle_Fast.png');

    // Load bullet images
    bulletDefault = loadImage('/sprites/Charge_1.png');
    bulletTriple = loadImage('/sprites/Charge_2.png');
    bulletTripleUp = loadImage('/sprites/Charge_2.png');
    bulletTripleDown = loadImage('/sprites/Charge_2.png');

    // Load JSON data for leaderboard
    highScores = [
        { name: 'PlayerOne', score: 2500, level: 5 },
        { name: 'PlayerTwo', score: 1800, level: 4 },
        { name: 'PlayerThree', score: 1200, level: 3 },
    ];
}

function setup() {
    createCanvas(800, 600);

    // Create player sprite
    player = createSprite(100, height / 2, 40, 40);
    player.shapeColor = color('blue');

    // Setup input field for player name
    inputField = createInput('Player');
    inputField.position(width / 2 - 100, height / 2);
    inputField.size(200, 30);
    inputField.hide();

    // Setup start button
    startButton = createButton('Start Game');
    startButton.position(width / 2 - 50, height / 2 + 50);
    startButton.mousePressed(startGame);
    startButton.hide();

    // Generate stars for background
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: random(width),
            y: random(height),
            size: random(1, 3),
            speed: random(1, 3),
        });
    }

    // Create a mock video element
    introVideo = {
        play: function () {},
        pause: function () {},
        time: function () {
            return 0;
        },
        duration: function () {
            return 10;
        },
    };

    // Setup player images
    player.addAnimation('idle', playerIdleImg);
    player.addAnimation('turnLeft', playerLeftImg);
    player.addAnimation('turnRight', playerRightImg);
}

function draw() {
    background(0);

    // Draw moving stars background
    drawStars();

    // Handle different game states
    switch (gameState) {
        case 'loading':
            drawLoadingScreen();
            break;
        case 'menu':
            drawMenuScreen();
            break;
        case 'game':
            drawGameScreen();
            break;
        case 'leaderboard':
            drawLeaderboardScreen();
            break;
    }
}

function drawStars() {
    fill(255);
    noStroke();
    for (let i = 0; i < stars.length; i++) {
        ellipse(stars[i].x, stars[i].y, stars[i].size);
        stars[i].x -= stars[i].speed;
        if (stars[i].x < 0) {
            stars[i].x = width;
            stars[i].y = random(height);
        }
    }
}

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
    text('Loading...', width / 2, height / 2 - 30);

    // Move to menu screen when loading is complete
    if (loadingProgress >= 100) {
        gameState = 'menu';
        startButton.show();
    }
}

function drawMenuScreen() {
    // Display video placeholder - would be actual video in full implementation
    fill(30, 30, 80);
    rect(width / 2 - 200, 100, 400, 225);
    fill(255);
    textAlign(CENTER);
    text('INTRO VIDEO WOULD PLAY HERE', width / 2, 212);

    // Menu title
    fill(255);
    textSize(48);
    text('SPACE SHOOTER', width / 2, 60);

    // Instructions
    textSize(16);
    text('Arrow keys to move, Space to shoot', width / 2, height / 2 + 150);
    text('Press L to view leaderboard', width / 2, height / 2 + 180);
}

function drawGameScreen() {
    // Game HUD
    fill(255);
    textSize(16);
    textAlign(LEFT);
    text('Score: ' + score, 20, 30);
    text('Lives: ' + lives, 20, 50);
    text('Level: ' + level, 20, 70);

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

    // Move enemies and check bounds
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

function drawLeaderboardScreen() {
    // Leaderboard title
    fill(255);
    textSize(40);
    textAlign(CENTER);
    text('HIGH SCORES', width / 2, 60);

    // Display high scores
    textSize(20);
    textAlign(LEFT);
    for (let i = 0; i < highScores.length; i++) {
        let y = 120 + i * 40;
        text(i + 1 + '. ' + highScores[i].name, width / 2 - 150, y);
        text(highScores[i].score, width / 2 + 50, y);
        text('Level ' + highScores[i].level, width / 2 + 150, y);
    }

    // Return to menu instruction
    textSize(16);
    textAlign(CENTER);
    text('Press M to return to menu', width / 2, height - 50);
}

function controlPlayer() {
    // Reset velocity
    player.velocity.x = 0;
    player.velocity.y = 0;

    // Move player with arrow keys
    if (keyIsDown(LEFT_ARROW) && player.position.x > 50) {
        player.velocity.x = -5;
    }
    if (keyIsDown(RIGHT_ARROW) && player.position.x < width - 50) {
        player.velocity.x = 5;
    }
    if (keyIsDown(UP_ARROW) && player.position.y > 50) {
        player.velocity.y = -5;
    }
    if (keyIsDown(DOWN_ARROW) && player.position.y < height - 50) {
        player.velocity.y = 5;
    }
}

function spawnEnemy() {
    // Randomly decide if this is a fast enemy (20% chance)
    if (random() < 0.2) {
        let enemy = createSprite(width + 20, random(50, height - 50), 32, 32);
        enemy.addImage(enemyFast);
        enemy.velocity.x = -random(5, 5 + level); // Purple enemies are faster
        enemy.health = 3; // Purple enemies take more hits
        enemies.push(enemy);
    } else {
        let enemy = createSprite(width + 20, random(50, height - 50), 32, 32);
        enemy.addImage(enemyDefault);
        enemy.velocity.x = -random(3, 4 + level);
        enemy.health = 2;
        enemies.push(enemy);
    }
}

function spawnPowerUp() {
    let powerUp = createSprite(width + 20, random(50, height - 50), 20, 20);

    // Randomly decide if this is a green power-up (30% chance)
    if (random() < 0.3) {
        powerUp.shapeColor = color('green');
        powerUp.type = 'tripleShoot';
    } else {
        powerUp.shapeColor = color('yellow');
        powerUp.type = 'extraLife';
    }

    powerUp.velocity.x = -2;
    powerUps.push(powerUp);
}

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

function checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i] && enemies[j] && bullets[i].overlap(enemies[j])) {
                enemies[j].health -= 1;
                bullets[i].remove();
                bullets.splice(i, 1);

                // If enemy health reaches 0, destroy it
                if (enemies[j].health <= 0) {
                    enemies[j].remove();
                    enemies.splice(j, 1);
                    explosionSound.play();
                    score += 10;

                    // Level up every 200 points
                    if (score % 30 === 0) {
                        level++;
                    }
                }

                // Break the inner loop as bullet is already removed
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

            // Game over condition
            if (lives <= 0) {
                gameState = 'leaderboard';
                inputField.show();
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

            if (powerUpType === 'extraLife') {
                lives++; // Extra life as power up
            } else if (powerUpType === 'tripleShoot') {
                tripleShootPowerActive = true;
                tripleShootTimer = 300; // Active for 5 seconds (assuming 60fps)
            }
        }
    }
}

function keyPressed() {
    // Shooting
    if (keyCode === 32 && gameState === 'game') {
        // Space bar
        shoot();
    }

    // View leaderboard from menu
    if (key === 'l' && gameState === 'menu') {
        gameState = 'leaderboard';
    }

    // Return to menu from leaderboard
    if (key === 'm' && gameState === 'leaderboard') {
        gameState = 'menu';
        startButton.show();
        resetGame();
    }
}

function startGame() {
    gameState = 'game';
    startButton.hide();
    resetGame();
}

function resetGame() {
    // Reset game variables
    score = 0;
    lives = 3;
    level = 1;
    tripleShootPowerActive = false;
    tripleShootTimer = 0;

    // Clear all sprites
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

    // Reset player position
    player.position.x = 100;
    player.position.y = height / 2;
}
