// Kungen Hoppar Flaggor - Spel Logik
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Spel variabler
let gameSpeed = 3.5; // Snabbare start
let score = 0;
let gameRunning = false; // Startar pausat för ljud-aktivering
let playerName = '';
let highScores = [];
let audioInitialized = false;

// Kung karaktär
const king = {
    x: 100,
    y: 300,
    width: 40,
    height: 60,
    velocityY: 0,
    jumping: false,
    groundY: 300
};

// Flaggor (hinder)
const flags = [];
const flagWidth = 30;
const flagHeight = 80;

// Kronor (samlarobjekt)
const crowns = [];
const crownSize = 20;

// Bakgrund molndata
const clouds = [];

// Initiera molndata
function initClouds() {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 100 + 20,
            size: Math.random() * 30 + 20,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

// Rita kung
function drawKing() {
    // Kung kropp (guld)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(king.x, king.y, king.width, king.height);
    
    // Kung huvud
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(king.x + 5, king.y - 15, 30, 20);
    
    // Krona
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(king.x + 8, king.y - 25, 24, 10);
    
    // Krona jewels
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(king.x + 12, king.y - 22, 3, 3);
    ctx.fillRect(king.x + 18, king.y - 22, 3, 3);
    ctx.fillRect(king.x + 24, king.y - 22, 3, 3);
    
    // Ögon
    ctx.fillStyle = '#000';
    ctx.fillRect(king.x + 12, king.y - 10, 3, 3);
    ctx.fillRect(king.x + 22, king.y - 10, 3, 3);
    
    // Mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(king.x + 10, king.y - 5, 18, 3);
}

// Rita flagga
function drawFlag(flag) {
    // Flaggstång
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(flag.x, flag.y, 5, flagHeight);
    
    // Svenska flaggan - blå bakgrund
    ctx.fillStyle = '#006AA7';
    ctx.fillRect(flag.x + 5, flag.y, 40, 25);
    
    // Gul kors
    ctx.fillStyle = '#FECC00';
    // Horisontell linje
    ctx.fillRect(flag.x + 5, flag.y + 10, 40, 5);
    // Vertikal linje
    ctx.fillRect(flag.x + 15, flag.y, 5, 25);
}

// Rita krona (samlarobjekt)
function drawCrown(crown) {
    ctx.fillStyle = '#FFD700';
    
    // Krona bas
    ctx.fillRect(crown.x, crown.y + 10, crownSize, 8);
    
    // Krona spetsar
    ctx.fillRect(crown.x + 2, crown.y, 4, 18);
    ctx.fillRect(crown.x + 8, crown.y - 3, 4, 21);
    ctx.fillRect(crown.x + 14, crown.y, 4, 18);
    
    // Glitter effekt
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(crown.x + 4, crown.y + 2, 2, 2);
    ctx.fillRect(crown.x + 10, crown.y - 1, 2, 2);
    ctx.fillRect(crown.x + 16, crown.y + 2, 2, 2);
}

// Rita molndata
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.7, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloud.size * 0.3, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Rita mark
function drawGround() {
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, king.groundY + 60, canvas.width, 40);
    
    // Gräs detaljer
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 10) {
        ctx.fillRect(i, king.groundY + 60, 2, 5);
        ctx.fillRect(i + 5, king.groundY + 65, 2, 3);
    }
}

// Skapa flagga
function createFlag() {
    flags.push({
        x: canvas.width,
        y: king.groundY - flagHeight + 60,
        passed: false
    });
}

// Skapa krona
function createCrown() {
    crowns.push({
        x: canvas.width,
        y: Math.random() * 150 + 100
    });
}

// Kollisionskontroll
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Uppdatera speltillstånd
function update() {
    if (!gameRunning) return;
    
    // Uppdatera kung physics
    if (king.jumping) {
        king.velocityY += 0.8; // Gravitation
        king.y += king.velocityY;
        
        if (king.y >= king.groundY) {
            king.y = king.groundY;
            king.jumping = false;
            king.velocityY = 0;
        }
    }
    
    // Uppdatera molndata
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.size * 2) {
            cloud.x = canvas.width + cloud.size;
            cloud.y = Math.random() * 100 + 20;
        }
    });
    
    // Uppdatera flaggor
    for (let i = flags.length - 1; i >= 0; i--) {
        flags[i].x -= gameSpeed;
        
        // Ta bort flaggor som passerat
        if (flags[i].x < -50) {
            flags.splice(i, 1);
            continue;
        }
        
        // Kollision med flagga = Game Over
        if (checkCollision(king, {
            x: flags[i].x,
            y: flags[i].y,
            width: flagWidth + 15,
            height: flagHeight
        })) {
            gameRunning = false;
            // Spela kollisions- och game over-ljud
            if (window.swedishAudio) {
                window.swedishAudio.playSound('bumpp');
                setTimeout(() => {
                    window.swedishAudio.playSound('nej_da');
                    window.swedishAudio.stopMusic();
                }, 200);
            }
            showGameOver();
            return;
        }
    }
    
    // Uppdatera kronor
    for (let i = crowns.length - 1; i >= 0; i--) {
        crowns[i].x -= gameSpeed;
        
        // Ta bort kronor som passerat
        if (crowns[i].x < -crownSize) {
            crowns.splice(i, 1);
            continue;
        }
        
        // Kollision med krona = Poäng
        if (checkCollision(king, {
            x: crowns[i].x,
            y: crowns[i].y,
            width: crownSize,
            height: crownSize
        })) {
            score += 10;
            scoreElement.textContent = score;
            crowns.splice(i, 1);
            
            // Spela krona-ljud
            if (window.swedishAudio) {
                window.swedishAudio.playSound('kling');
            }
        }
    }
    
    // Öka hastighet gradvis (snabbare acceleration)
    gameSpeed += 0.005;
}

// Rita allt
function draw() {
    // Rensa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rita bakgrund gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Rita molndata
    drawClouds();
    
    // Rita mark
    drawGround();
    
    // Rita flaggor
    flags.forEach(drawFlag);
    
    // Rita kronor
    crowns.forEach(drawCrown);
    
    // Rita kung
    drawKing();
}

// Topplista funktioner
async function saveScore(name, score) {
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, score })
        });
        if (response.ok) {
            loadHighScores();
        }
    } catch (error) {
        console.log('Kunde inte spara poäng:', error);
    }
}

async function loadHighScores() {
    try {
        const response = await fetch('/api/scores');
        if (response.ok) {
            highScores = await response.json();
            updateHighScoreDisplay();
        }
    } catch (error) {
        console.log('Kunde inte ladda topplista:', error);
    }
}

function updateHighScoreDisplay() {
    const highScoreList = document.getElementById('highScoreList');
    if (highScoreList) {
        highScoreList.innerHTML = highScores
            .slice(0, 5)
            .map((entry, index) => 
                `<div class="score-entry">
                    <span class="rank">${index + 1}.</span>
                    <span class="name">${entry.name}</span>
                    <span class="score-value">${entry.score}</span>
                </div>`
            ).join('');
    }
}

function showGameOver() {
    const isHighScore = highScores.length < 10 || score > highScores[highScores.length - 1].score;
    
    if (isHighScore) {
        // Spela fanfar för nytt rekord
        if (window.swedishAudio) {
            setTimeout(() => window.swedishAudio.playSound('fanfar'), 500);
        }
        
        const name = prompt('🏆 NYTT REKORD! 🏆\nSkriv ditt namn för topplistan:', playerName || 'Spelare');
        if (name) {
            playerName = name;
            saveScore(name, score);
        }
    }
    
    setTimeout(() => {
        if (confirm(`Game Over! 👑💥\nDin poäng: ${score} kronor\n\nVill du spela igen?`)) {
            resetGame();
        }
    }, 100);
}

// Återställ spel
function resetGame() {
    king.y = king.groundY;
    king.jumping = false;
    king.velocityY = 0;
    flags.length = 0;
    crowns.length = 0;
    score = 0;
    gameSpeed = 3.5; // Snabbare start
    scoreElement.textContent = score;
    gameRunning = true;
    
    // Starta bakgrundsmusik igen
    if (window.swedishAudio && window.swedishAudio.musicEnabled) {
        setTimeout(() => window.swedishAudio.startMusic(), 500);
    }
}

// Huvudspelloop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Kontroller
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !king.jumping && gameRunning) {
        event.preventDefault();
        king.jumping = true;
        king.velocityY = -15;
        
        // Spela hopp-ljud
        if (window.swedishAudio) {
            window.swedishAudio.playSound('hoppla');
        }
    }
});

// Audio kontroller
function initializeAudioControls() {
    const startBtn = document.getElementById('startGameBtn');
    const gameControls = document.getElementById('gameControls');
    const audioControls = document.getElementById('audioControls');
    const soundToggle = document.getElementById('soundToggle');
    const musicToggle = document.getElementById('musicToggle');
    const volumeDown = document.getElementById('volumeDown');
    const volumeUp = document.getElementById('volumeUp');

    // Starta spel med ljud
    startBtn.addEventListener('click', async () => {
        if (window.swedishAudio) {
            await window.swedishAudio.enableAudio();
            audioInitialized = true;
            
            // Visa kontroller och starta spel
            startBtn.style.display = 'none';
            gameControls.style.display = 'block';
            audioControls.style.display = 'flex';
            
            // Starta spel och musik
            gameRunning = true;
            window.swedishAudio.startMusic();
        }
    });

    // Ljud on/off
    soundToggle.addEventListener('click', () => {
        if (window.swedishAudio) {
            const enabled = window.swedishAudio.toggleSound();
            soundToggle.classList.toggle('active', enabled);
            soundToggle.textContent = enabled ? '🔊 Ljud' : '🔇 Ljud';
        }
    });

    // Musik on/off
    musicToggle.addEventListener('click', () => {
        if (window.swedishAudio) {
            const enabled = window.swedishAudio.toggleMusic();
            musicToggle.classList.toggle('active', enabled);
            musicToggle.textContent = enabled ? '🎵 Musik' : '🎵 Musik';
        }
    });

    // Volym kontroller
    volumeDown.addEventListener('click', () => {
        if (window.swedishAudio) {
            const newVolume = Math.max(0, window.swedishAudio.masterVolume - 0.1);
            window.swedishAudio.setVolume(newVolume);
        }
    });

    volumeUp.addEventListener('click', () => {
        if (window.swedishAudio) {
            const newVolume = Math.min(1, window.swedishAudio.masterVolume + 0.1);
            window.swedishAudio.setVolume(newVolume);
        }
    });
}

// Skapa nya objekt
setInterval(() => {
    if (gameRunning && Math.random() < 0.7) {
        createFlag();
    }
}, 2000);

setInterval(() => {
    if (gameRunning && Math.random() < 0.5) {
        createCrown();
    }
}, 1500);

// Starta spel
initClouds();
loadHighScores(); // Ladda topplista vid start
initializeAudioControls(); // Initiera ljud-kontroller
gameLoop(); 