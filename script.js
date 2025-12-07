const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Load images
const playerImg = new Image(); playerImg.src = "assets/player.png";
const bulletImg = new Image(); bulletImg.src = "assets/bullet.png";
const enemyImgs = [new Image(), new Image()];
enemyImgs[0].src = "assets/enemy1.png";
enemyImgs[1].src = "assets/enemy2.png";
const powerupImg = new Image(); powerupImg.src = "assets/powerup.png";
const explosionImg = new Image(); explosionImg.src = "assets/explosion.png";

// Load sounds
const shootSound = new Audio("assets/shoot.wav");
const explosionSound = new Audio("assets/explosion.wav");
const bgMusic = new Audio("assets/bg-music.mp3"); bgMusic.loop = true; bgMusic.volume = 0.3;
bgMusic.play();

// Game variables
let keys = {}, bullets=[], enemies=[], powerups=[];
let player = {x: canvas.width/2-25, y: canvas.height-60, width:50, height:50, speed:5, shield:false, doubleShot:false};
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver=false;
let enemySpawnTimer=0;

// Event listeners
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
document.getElementById("restartBtn").addEventListener("click", restartGame);

// Game loop
function gameLoop() {
    if(gameOver) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Player movement
    if(keys["ArrowLeft"] && player.x>0) player.x -= player.speed;
    if(keys["ArrowRight"] && player.x+player.width<canvas.width) player.x += player.speed;
    if(keys[" "] && bullets.length<5) shoot();

    // Spawn enemies
    enemySpawnTimer++;
    if(enemySpawnTimer>90){
        spawnEnemy();
        enemySpawnTimer=0;
    }

    // Update enemies
    enemies.forEach((enemy,i)=>{
        enemy.y += enemy.speed;
        if(enemy.y>canvas.height){
            enemies.splice(i,1);
            if(!player.shield) endGame();
        }
    });

    // Update bullets
    bullets.forEach((bullet,i)=>{
        bullet.y -= bullet.speed;
        // Collision with enemies
        enemies.forEach((enemy,j)=>{
            if(collides(bullet,enemy)){
                bullets.splice(i,1);
                enemies.splice(j,1);
                score+=10;
                explosionSound.play();
            }
        });
        if(bullet.y<0) bullets.splice(i,1);
    });

    // Powerups
    powerups.forEach((p,i)=>{
        p.y += 2;
        if(collides(player,p)){
            activatePowerup(p.type);
            powerups.splice(i,1);
        }
        if(p.y>canvas.height) powerups.splice(i,1);
    });

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw enemies
    enemies.forEach(e=> ctx.drawImage(enemyImgs[e.type], e.x, e.y, e.width, e.height));

    // Draw bullets
    bullets.forEach(b=> ctx.drawImage(bulletImg, b.x, b.y, b.width, b.height));

    // Draw powerups
    powerups.forEach(p=> ctx.drawImage(powerupImg,p.x,p.y,30,30));

    // HUD
    document.getElementById("score").innerText = "Score: "+score;
    document.getElementById("highscore").innerText = "High Score: "+highScore;

    requestAnimationFrame(gameLoop);
}

// Shoot function
function shoot(){
    bullets.push({x:player.x+player.width/2-5, y:player.y, width:10, height:20, speed:8});
    if(player.doubleShot) bullets.push({x:player.x+player.width/2-15, y:player.y, width:10, height:20, speed:8});
    shootSound.play();
}

// Spawn enemy
function spawnEnemy(){
    let type = Math.floor(Math.random()*enemyImgs.length);
    let x = Math.random()*(canvas.width-50);
    enemies.push({x:x, y:-50, width:50, height:50, speed:2+level/2, type:type});
}

// Collision detection
function collides(a,b){
    return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
}

// Powerup activation
function activatePowerup(type){
    if(type=="shield") player.shield=true;
    if(type=="doubleShot") player.doubleShot=true;
    if(type=="speed") player.speed +=2;
}

// End game
function endGame(){
    gameOver=true;
    if(score>highScore){
        highScore=score;
        localStorage.setItem("highScore",highScore);
    }
    alert("Game Over! Score: "+score);
}

// Restart game
function restartGame(){
    bullets=[]; enemies=[]; powerups=[];
    score=0; gameOver=false;
    player.x=canvas.width/2-25;
    player.y=canvas.height-60;
    player.shield=false; player.doubleShot=false;
    gameLoop();
}

// Initial start
gameLoop();
