// Kungen Hoppar Flaggor - Optimerad Spel Logik
const canvas = document.getElementById('gameCanvas');
// Optimera canvas kontext för bättre prestanda
const ctx = canvas.getContext('2d', { 
    alpha: false,  // Ingen transparens = snabbare rendering
    desynchronized: true  // Asynkron rendering
});
const scoreElement = document.getElementById('score');

// Prestanda variabler
let lastTime = 0;
let deltaTime = 0;
let fps = 0;
let frameCount = 0;
let lastFpsTime = 0;

// Spel variabler
let gameSpeed = 3.5;
let score = 0;
let gameRunning = false;
let playerName = '';
let highScores = [];
let audioInitialized = false;
let totalJumps = 0;
let gameStartTime = 0;
let totalCoinsCollected = 0;
let campaignMode = false;
let currentChapter = null;
let mobileScaleFactor = 1;

// Input state tracking för prestanda
let spacePressed = false;
let keys = {};

// Prestanda settings
const PERFORMANCE_SETTINGS = {
    maxParticles: 50,
    maxClouds: 3,
    updateInterval: 16, // ~60fps
    enableEffects: true,
    enablePowerups: true
};

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

// Optimerade objekt arrays med object pooling
const flagPool = [];
const crownPool = [];
const flags = [];
const crowns = [];
const clouds = [];

const flagWidth = 30;
const flagHeight = 80;
const crownSize = 20;

// Memory management och garbage collection optimering
let memoryCleanupInterval;
let performanceMonitor = {
    frameDrops: 0,
    lastGCTime: 0,
    memoryUsage: 0
};

// Object pooling för bättre prestanda
function createObjectPool(type, size) {
    const pool = [];
    for (let i = 0; i < size; i++) {
        if (type === 'flag') {
            pool.push({
                x: 0,
                y: 0,
                active: false,
                passed: false
            });
        } else if (type === 'crown') {
            pool.push({
                x: 0,
                y: 0,
                active: false
            });
        }
    }
    return pool;
}

// Initiera object pools
function initObjectPools() {
    while (flagPool.length < 10) {
        flagPool.push({
            x: 0,
            y: 0,
            active: false,
            passed: false
        });
    }
    
    while (crownPool.length < 10) {
        crownPool.push({
            x: 0,
            y: 0,
            active: false
        });
    }
}

// Optimerad cloud initialization
function initClouds() {
    clouds.length = 0; // Clear existing
    const cloudCount = PERFORMANCE_SETTINGS.maxClouds;
    
    for (let i = 0; i < cloudCount; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 60 + 20,
            size: Math.random() * 20 + 15,
            speed: Math.random() * 0.3 + 0.1
        });
    }
}

// Optimerad king rendering
function drawKing() {
    if (window.swedishCharacter) {
        window.swedishCharacter.drawCharacter(ctx, king.x, king.y, king.width, king.height, king.jumping);
        return;
    }
    
    // Batch drawing för kung
    ctx.save();
    
    // Kung kropp (guld)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(king.x, king.y, king.width, king.height);
    
    // Kung huvud
    ctx.fillStyle = '#FFCC99';
    ctx.fillRect(king.x + 5, king.y - 15, 30, 20);
    
    // Batch krona rendering
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(king.x + 8, king.y - 25, 24, 10);
    
    // Krona jewels - batch
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(king.x + 12, king.y - 22, 3, 3);
    ctx.fillRect(king.x + 18, king.y - 22, 3, 3);
    ctx.fillRect(king.x + 24, king.y - 22, 3, 3);
    
    // Ögon - batch
    ctx.fillStyle = '#000';
    ctx.fillRect(king.x + 12, king.y - 10, 3, 3);
    ctx.fillRect(king.x + 22, king.y - 10, 3, 3);
    
    // Mustache
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(king.x + 10, king.y - 5, 18, 3);
    
    ctx.restore();
}

// Optimerad flag rendering
function drawFlag(flag) {
    ctx.save();
    
    // Flaggstång
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(flag.x, flag.y, 5, flagHeight);
    
    // Svenska flaggan - blå bakgrund
    ctx.fillStyle = '#006AA7';
    ctx.fillRect(flag.x + 5, flag.y, 40, 25);
    
    // Gul kors - batch
    ctx.fillStyle = '#FECC00';
    ctx.fillRect(flag.x + 5, flag.y + 10, 40, 5);
    ctx.fillRect(flag.x + 15, flag.y, 5, 25);
    
    ctx.restore();
}

// Optimerad crown rendering
function drawCrown(crown) {
    ctx.save();
    ctx.fillStyle = '#FFD700';
    
    // Batch crown drawing
    ctx.fillRect(crown.x, crown.y + 10, crownSize, 8);
    ctx.fillRect(crown.x + 2, crown.y, 4, 18);
    ctx.fillRect(crown.x + 8, crown.y - 3, 4, 21);
    ctx.fillRect(crown.x + 14, crown.y, 4, 18);
    
    // Glitter effekt
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(crown.x + 4, crown.y + 2, 2, 2);
    ctx.fillRect(crown.x + 10, crown.y - 1, 2, 2);
    ctx.fillRect(crown.x + 16, crown.y + 2, 2, 2);
    
    ctx.restore();
}

// Mycket optimerad cloud drawing
function drawClouds() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.7, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloud.size * 0.3, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.restore();
}

// Optimerad ground rendering
function drawGround() {
    ctx.save();
    
    // Grundfärg
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, king.groundY + 60, canvas.width, 40);
    
    // Reducerat antal gräs-detaljer för prestanda
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, king.groundY + 60, 2, 5);
        ctx.fillRect(i + 10, king.groundY + 65, 2, 3);
    }
    
    ctx.restore();
}

// Använd object pooling för bättre prestanda
function createFlag() {
    let flag = flagPool.find(f => !f.active);
    if (!flag) {
        flag = {
            x: 0,
            y: 0,
            active: false,
            passed: false
        };
        flagPool.push(flag);
    }
    
    flag.x = canvas.width;
    flag.y = king.groundY - flagHeight + 60;
    flag.active = true;
    flag.passed = false;
    
    flags.push(flag);
}

function createCrown() {
    let crown = crownPool.find(c => !c.active);
    if (!crown) {
        crown = {
            x: 0,
            y: 0,
            active: false
        };
        crownPool.push(crown);
    }
    
    crown.x = canvas.width;
    crown.y = Math.random() * 150 + 100;
    crown.active = true;
    
    crowns.push(crown);
}

// Optimerad kollisionskontroll
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Mycket optimerad update loop
function update(currentTime) {
    if (!gameRunning) return;
    
    // Beräkna delta time för smooth animation
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // FPS räkning
    frameCount++;
    if (currentTime - lastFpsTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastFpsTime = currentTime;
    }
    
    // King physics - optimerad
    if (king.jumping) {
        king.velocityY += 0.8 * (deltaTime / 16);
        king.y += king.velocityY * (deltaTime / 16);
        
        if (king.y >= king.groundY) {
            king.y = king.groundY;
            king.jumping = false;
            king.velocityY = 0;
        }
    }
    
    // Optimerad cloud update
    const cloudSpeed = gameSpeed * 0.2 * (deltaTime / 16);
    clouds.forEach(cloud => {
        cloud.x -= cloudSpeed;
        if (cloud.x < -cloud.size * 2) {
            cloud.x = canvas.width + cloud.size;
            cloud.y = Math.random() * 60 + 20;
        }
    });
    
    // Optimerad flag update - backwards loop för prestanda
    const flagSpeed = gameSpeed * (deltaTime / 16);
    for (let i = flags.length - 1; i >= 0; i--) {
        const flag = flags[i];
        flag.x -= flagSpeed;
        
        if (flag.x < -50) {
            flag.active = false;
            flags.splice(i, 1);
            continue;
        }
        
        // Kollision check - optimerad
        if (checkCollision(king, {
            x: flag.x,
            y: flag.y,
            width: flagWidth + 15,
            height: flagHeight
        })) {
            gameRunning = false;
            handleGameOver();
            return;
        }
    }
    
    // Optimerad crown update
    const crownSpeed = gameSpeed * (deltaTime / 16);
    for (let i = crowns.length - 1; i >= 0; i--) {
        const crown = crowns[i];
        crown.x -= crownSpeed;
        
        if (crown.x < -crownSize) {
            crown.active = false;
            crowns.splice(i, 1);
            continue;
        }
        
        // Crown collision - optimerad
        if (checkCollision(king, {
            x: crown.x,
            y: crown.y,
            width: crownSize,
            height: crownSize
        })) {
            score += 10;
            scoreElement.textContent = score;
            crown.active = false;
            crowns.splice(i, 1);
            
            // Optimerade ljud och events
            if (window.swedishAudio) {
                window.swedishAudio.playSound('kling');
            }
            
            handleCoinCollection();
        }
    }
    
    // Powerups temporärt avaktiverat för att fixa canvas-problemet
    // if (PERFORMANCE_SETTINGS.enablePowerups && window.swedishPowerups) {
    //     window.swedishPowerups.update(gameSpeed, canvas);
    // }
    
    // Obstacles temporärt avaktiverat för att fixa loop-problemet
    // if (window.swedishObstacles) {
    //     window.swedishObstacles.update(king);
    // }
    
    // Effects temporärt avaktiverat
    // if (PERFORMANCE_SETTINGS.enableEffects && window.swedishEffects) {
    //     window.swedishEffects.update(canvas);
    // }
    
    // Gradvis hastighetsökning - optimerad
    gameSpeed += 0.003 * (deltaTime / 16);
}

// Separata funktioner för game over och coin collection
function handleGameOver() {
    if (window.swedishAudio) {
        window.swedishAudio.playSound('bumpp');
        setTimeout(() => {
            window.swedishAudio.playSound('nej_da');
            window.swedishAudio.stopMusic();
        }, 200);
    }
    
    if (window.swedishAchievements) {
        document.dispatchEvent(new CustomEvent('gameCollision'));
    }
    
    showGameOver();
}

function handleCoinCollection() {
    if (window.swedishAchievements) {
        document.dispatchEvent(new CustomEvent('gameScore', { detail: score }));
        document.dispatchEvent(new CustomEvent('gamePowerup', { detail: 'coin' }));
    }
    
    totalCoinsCollected += 10;
}

// Mycket optimerad draw function med batching
function draw() {
    // Clear med optimering
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Bakgrund - använd enkel gradient istället för effects
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    drawClouds();
    
    // Rita mark
    drawGround();
    
    // Obstacles temporärt avaktiverat
    // if (window.swedishObstacles) {
    //     window.swedishObstacles.draw(ctx);
    // }
    
    // Batch rendering av flaggor
    flags.forEach(drawFlag);
    
    // Batch rendering av kronor  
    crowns.forEach(drawCrown);
    
    // Powerups temporärt avaktiverat
    // if (PERFORMANCE_SETTINGS.enablePowerups && window.swedishPowerups) {
    //     window.swedishPowerups.draw(ctx);
    // }
    
    // Rita kung
    drawKing();
    
    // Effects temporärt avaktiverat för att fixa loop-problemet
    // if (PERFORMANCE_SETTINGS.enableEffects && window.swedishEffects) {
    //     window.swedishEffects.draw(ctx, canvas);
    // }
    
    // Mobile HUD (optimerat)
    if (window.swedishMobile && window.swedishMobile.deviceInfo.isMobile) {
        window.swedishMobile.updateMobileHUD({
            score: score,
            level: Math.floor(score / 100) + 1,
            powerups: PERFORMANCE_SETTINGS.enablePowerups && window.swedishPowerups ? 
                     window.swedishPowerups.getActivePowerups() : []
        });
    }
    
    // Rita FPS counter i development mode
    if (window.location.hostname === 'localhost') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(10, 10, 100, 30);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`FPS: ${fps}`, 15, 30);
        ctx.restore();
    }
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
    
    // Uppdatera menu stats
    if (window.gameMenu) {
        window.gameMenu.updatePlayerStats(score, totalJumps, totalCoinsCollected);
    }
    
    if (isHighScore) {
        // Spela fanfar för nytt rekord
        if (window.swedishAudio) {
            setTimeout(() => window.swedishAudio.playSound('fanfar'), 500);
        }
        
        // Fråga om namn BARA för topplistan
        setTimeout(() => {
            const name = prompt('🏆 NYTT REKORD! 🏆\nSkriv ditt namn för topplistan:', playerName || 'Spelare');
            if (name) {
                playerName = name;
                saveScore(name, score);
            }
            
            // Meddelande efter rekord - knappen för omstart finns redan
            setTimeout(() => {
                alert(`🎉 GRATTIS! Nytt rekord: ${score} kronor! 🎉\n\nKlicka "Starta Spel" för att spela igen.`);
            }, 100);
        }, 500);
        
    } else {
        // Vanlig game over (inget rekord)
        setTimeout(() => {
            alert(`Game Over! 👑💥\nDin poäng: ${score} kronor\n\nKlicka "Starta Spel" för att spela igen.`);
        }, 100);
    }
}

// Återställ spel
function resetGame() {
    // Stoppa spelet
    gameRunning = false;
    
    // Återställ kung
    king.y = king.groundY;
    king.jumping = false;
    king.velocityY = 0;
    
    // Återanvänd objekt istället för att skapa nya
    flags.forEach(flag => returnObjectToPool(flag, flagPool));
    crowns.forEach(crown => returnObjectToPool(crown, crownPool));
    
    flags.length = 0;
    crowns.length = 0;
    score = 0;
    gameSpeed = 3.5;
    scoreElement.textContent = score;
    gameStartTime = Date.now();
    
    // Reset prestanda variabler
    lastTime = 0;
    frameCount = 0;
    fps = 60;
    
    // Nollställ räknare
    totalJumps = 0;
    totalCoinsCollected = 0;
    
    // Stoppa musik
    if (window.swedishAudio) {
        window.swedishAudio.stopMusic();
    }
    
    console.log('🔄 Spel återställt med memory cleanup');
}

// Mycket optimerad game loop med timing
function gameLoop(currentTime) {
    if (!lastTime) lastTime = currentTime;
    
    update(currentTime);
    draw();
    requestAnimationFrame(gameLoop);
}

// Förbättrad tangentbords-hantering för att förhindra scrollning
document.addEventListener('keydown', (event) => {
    // Förhindra space från att scrolla sidan ALLTID
    if (event.code === 'Space') {
        event.preventDefault();
        
        // Hopp endast om spelet körs och kungen inte hoppar redan
        if (!king.jumping && gameRunning && !spacePressed) {
            spacePressed = true;
            jump();
        }
    }
    
    // Andra förkortningar för bättre kontroll
    if (event.code === 'KeyP' && gameRunning) {
        event.preventDefault();
        togglePause();
    }
    
    // Håll koll på alla tangenter för framtida funktioner
    keys[event.code] = true;
}, { passive: false });

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        spacePressed = false;
    }
    keys[event.code] = false;
}, { passive: false });

// Förhindra kontextmeny på högerklick för bättre spelupplevelse
document.addEventListener('contextmenu', (event) => {
    if (event.target.tagName === 'CANVAS') {
        event.preventDefault();
    }
});

// Förhindra zoom med ctrl/cmd + scroll på canvas
document.addEventListener('wheel', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.target.tagName === 'CANVAS') {
        event.preventDefault();
    }
}, { passive: false });

// Global jump function
function jump() {
    if (king.jumping || !gameRunning) return;
    
    king.jumping = true;
    king.velocityY = -15;
    
    // Spela hopp-ljud
    if (window.swedishAudio) {
        window.swedishAudio.playSound('hoppla');
    }
    
    // Räkna hopp
    totalJumps++;
    
    // Trigger achievements
    if (window.swedishAchievements) {
        document.dispatchEvent(new CustomEvent('gameJump'));
    }
}

// Campaign mode functions
function startCampaignMode(chapter) {
    campaignMode = true;
    currentChapter = chapter;
    
    // Sätt miljö baserat på kapitel
    if (window.swedishEffects) {
        window.swedishEffects.setEnvironment(chapter.environment);
        window.swedishEffects.setWeather(chapter.weather);
    }
    
    // Anpassa spelhastighet baserat på svårighetsgrad
    setDifficulty(chapter.difficulty);
    
    // Starta spelet
    gameRunning = true;
    gameStartTime = Date.now();
}

function setDifficulty(difficulty) {
    const difficultySettings = {
        easy: { speed: 2.5, flagFreq: 3000, crownFreq: 2000 },
        medium: { speed: 3.5, flagFreq: 2500, crownFreq: 1800 },
        hard: { speed: 4.5, flagFreq: 2000, crownFreq: 1500 },
        extreme: { speed: 5.5, flagFreq: 1500, crownFreq: 1200 },
        legendary: { speed: 7.0, flagFreq: 1000, crownFreq: 1000 }
    };
    
    const settings = difficultySettings[difficulty] || difficultySettings.medium;
    gameSpeed = settings.speed;
    
    // Rensa gamla intervaller
    clearIntervals();
    
    // Sätt nya intervaller
    setInterval(() => {
        if (gameRunning && Math.random() < 0.7) {
            createFlag();
        }
    }, settings.flagFreq);
    
    setInterval(() => {
        if (gameRunning && Math.random() < 0.5) {
            createCrown();
        }
    }, settings.crownFreq);
}

function clearIntervals() {
    // Denna funktion skulle behöva hålla koll på interval IDs
    // För enkelhetens skull hoppar vi över detta för nu
}

function togglePause() {
    gameRunning = !gameRunning;
    
    if (gameRunning) {
        if (window.swedishAudio) {
            window.swedishAudio.startMusic();
        }
    } else {
        if (window.swedishAudio) {
            window.swedishAudio.stopMusic();
        }
    }
}

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
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            // Starta spel - knappen behålls synlig för omstart
            if (gameControls) gameControls.style.display = 'block';
            if (audioControls) audioControls.style.display = 'flex';
            
            // Återställ spelet innan start
            resetGame();
            gameRunning = true;
            
            // Aktivera ljud automatiskt
            if (window.swedishAudio) {
                try {
                    await window.swedishAudio.enableAudio();
                    audioInitialized = true;
                    window.swedishAudio.startMusic();
                    console.log('🎵 Ljud aktiverat automatiskt!');
                } catch (error) {
                    console.log('🔇 Kunde inte aktivera ljud automatiskt:', error);
                    // Spelet fortsätter ändå
                }
            }
        });
    }

    // Ljud on/off
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            if (window.swedishAudio) {
                const enabled = window.swedishAudio.toggleSound();
                soundToggle.classList.toggle('active', enabled);
                soundToggle.textContent = enabled ? '🔊 Ljud' : '🔇 Ljud';
            }
        });
    }

    // Musik on/off
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            if (window.swedishAudio) {
                const enabled = window.swedishAudio.toggleMusic();
                musicToggle.classList.toggle('active', enabled);
                musicToggle.textContent = enabled ? '🎵 Musik' : '🎵 Musik';
            }
        });
    }

    // Volym kontroller
    if (volumeDown) {
        volumeDown.addEventListener('click', () => {
            if (window.swedishAudio) {
                const newVolume = Math.max(0, window.swedishAudio.masterVolume - 0.1);
                window.swedishAudio.setVolume(newVolume);
            }
        });
    }

    if (volumeUp) {
        volumeUp.addEventListener('click', () => {
            if (window.swedishAudio) {
                const newVolume = Math.min(1, window.swedishAudio.masterVolume + 0.1);
                window.swedishAudio.setVolume(newVolume);
            }
        });
    }
}

// Objekt skapas nu via createOptimizedIntervals() för bättre prestanda

// Social sharing functions (förenklad utan multiplayer)
function shareToTwitter() {
    const text = `🇸🇪 Jag fick ${score} kronor i Kungen Hoppar Flaggor! Kan du slå mitt rekord?`;
    const url = 'https://kungen-hoppar-flaggor.davidrydgren.workers.dev';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareToFacebook() {
    const url = 'https://kungen-hoppar-flaggor.davidrydgren.workers.dev';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareToWhatsApp() {
    const text = `🇸🇪 Jag fick ${score} kronor i Kungen Hoppar Flaggor! Spela här: https://kungen-hoppar-flaggor.davidrydgren.workers.dev`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareNative() {
    if (navigator.share) {
        navigator.share({
            title: '🇸🇪 Kungen Hoppar Flaggor',
            text: `Jag fick ${score} kronor! Kan du slå mitt rekord?`,
            url: 'https://kungen-hoppar-flaggor.davidrydgren.workers.dev'
        });
    } else {
        // Fallback till clipboard
        const text = `🇸🇪 Jag fick ${score} kronor i Kungen Hoppar Flaggor! https://kungen-hoppar-flaggor.davidrydgren.workers.dev`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Länk kopierad till urklipp!');
        });
    }
}

// Prestanda-kontroller för olika enheter
function detectDevicePerformance() {
    // Detektera enhetens prestanda baserat på olika faktorer
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    let deviceScore = 100; // Base score
    
    // GPU prestanda
    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer.includes('Intel')) deviceScore -= 20;
            if (renderer.includes('Mobile')) deviceScore -= 30;
        }
    } else {
        deviceScore -= 40; // Ingen WebGL support
    }
    
    // CPU/Minne approximation
    if (navigator.hardwareConcurrency <= 2) deviceScore -= 20;
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) deviceScore -= 20;
    
    // Skärmstorlek (mobiler = lägre prestanda)
    if (window.innerWidth <= 768) deviceScore -= 15;
    
    return Math.max(deviceScore, 30); // Minimum 30%
}

function adjustPerformanceSettings() {
    const performanceScore = detectDevicePerformance();
    
    if (performanceScore < 60) {
        // Låg prestanda enhet
        PERFORMANCE_SETTINGS.enableEffects = false;
        PERFORMANCE_SETTINGS.enablePowerups = false;
        PERFORMANCE_SETTINGS.maxClouds = 2;
        PERFORMANCE_SETTINGS.maxParticles = 20;
        console.log('🐌 Låg prestanda detekterad - effekter begränsade');
    } else if (performanceScore < 80) {
        // Medium prestanda
        PERFORMANCE_SETTINGS.maxClouds = 3;
        PERFORMANCE_SETTINGS.maxParticles = 35;
        console.log('⚡ Medium prestanda detekterad');
    } else {
        // Hög prestanda - använd alla features
        console.log('🚀 Hög prestanda detekterad - alla effekter aktiverade');
    }
    
    return performanceScore;
}

// Responsiv canvas sizing för bättre prestanda
function setupResponsiveCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const container = canvas.parentElement;
    
    // Grundstorlek baserat på skärm
    let baseWidth = 800;
    let baseHeight = 400;
    
    // Anpassa för olika skärmstorlekar
    if (window.innerWidth <= 480) {
        // Mobil
        baseWidth = Math.min(window.innerWidth - 40, 360);
        baseHeight = Math.round(baseWidth * 0.5);
    } else if (window.innerWidth <= 768) {
        // Tablet
        baseWidth = Math.min(window.innerWidth - 60, 600);
        baseHeight = Math.round(baseWidth * 0.5);
    } else {
        // Desktop - behåll originalstorlek
        baseWidth = 800;
        baseHeight = 400;
    }
    
    // Sätt canvas storlek för bättre prestanda
    canvas.width = baseWidth;
    canvas.height = baseHeight;
    
    // Uppdatera spelobjekt proportionellt
    const scaleX = baseWidth / 800;
    const scaleY = baseHeight / 400;
    mobileScaleFactor = Math.min(scaleX, scaleY);
    
    // Anpassa kung position
    king.groundY = baseHeight - 100;
    king.y = king.groundY;
    
    // Anpassa flaggor och kronor
    clouds.forEach(cloud => {
        cloud.y = Math.min(cloud.y, baseHeight * 0.25);
    });
    
    console.log(`📱 Canvas anpassad: ${baseWidth}x${baseHeight} (skala: ${mobileScaleFactor.toFixed(2)})`);
    
    return { width: baseWidth, height: baseHeight, scale: mobileScaleFactor };
}

// Window resize handler för responsivitet
function handleResize() {
    setupResponsiveCanvas();
}

// Debounced resize handler för prestanda
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 150);
});

// Optimerat initiering med prestanda-anpassning
function initializeGame() {
    console.log('🎮 Initierar Kungen Hoppar Flaggor...');
    
    // Sätt upp responsiv canvas först
    setupResponsiveCanvas();
    
    // Anpassa prestanda innan allt annat
    const performanceScore = adjustPerformanceSettings();
    
    // Initiera object pools för bättre prestanda
    initObjectPools();
    
    // Initiera grundläggande spel-element
    initClouds();
    
    // Ladda asynkront för snabbare start
    loadHighScores().catch(e => console.log('Topplista ej tillgänglig'));
    
    // Initiera kontroller
    initializeAudioControls();
    
    // Starta render loop med prestanda-mätning
    console.log(`📊 Prestanda-poäng: ${performanceScore}%`);
    gameLoop();
    
    // Skapa intervaller för spel-objekt med optimerad timing
    createOptimizedIntervals();
    
    // Starta memory management
    startMemoryManagement();
    
    console.log('✅ Spel initierat och optimerat!');
}

// Optimerade intervaller baserat på prestanda
function createOptimizedIntervals() {
    const baseInterval = PERFORMANCE_SETTINGS.updateInterval;
    
    // Flagg-intervall
    setInterval(() => {
        if (gameRunning && Math.random() < 0.7) {
            createFlag();
        }
    }, baseInterval * 125); // ~2000ms på 60fps
    
    // Krona-intervall
    setInterval(() => {
        if (gameRunning && Math.random() < 0.5) {
            createCrown();
        }
    }, baseInterval * 94); // ~1500ms på 60fps
}

// Optimerat spel-start med prestanda-kontroll
function initializeAndStartGame() {
    resetGame();
    gameRunning = true;
    gameStartTime = Date.now();
    lastTime = 0; // Reset timing
    
    // Starta bakgrundsmusik med fade-in
    if (window.swedishAudio && window.swedishAudio.musicEnabled) {
        setTimeout(() => window.swedishAudio.startMusic(), 500);
    }
    
    console.log('🚀 Spelet startat!');
}

// Globala funktioner för menyn
window.resetGame = resetGame;
window.initializeAndStartGame = initializeAndStartGame;

// Initiera när sidan laddas
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Memory management och garbage collection optimering
function startMemoryManagement() {
    // Städa upp minne var 30:e sekund
    memoryCleanupInterval = setInterval(() => {
        cleanupUnusedObjects();
        monitorPerformance();
    }, 30000);
}

function cleanupUnusedObjects() {
    // Rensa inaktiva objekt från pools
    while (flagPool.length > 15) {
        flagPool.pop();
    }
    
    while (crownPool.length > 15) {
        crownPool.pop();
    }
    
    // Force garbage collection om tillgängligt (Chrome DevTools)
    if (window.gc && typeof window.gc === 'function') {
        window.gc();
        performanceMonitor.lastGCTime = Date.now();
    }
    
    console.log('🧹 Memory cleanup utfört');
}

function monitorPerformance() {
    // Övervaka prestanda och anpassa inställningar
    if (fps < 45 && PERFORMANCE_SETTINGS.enableEffects) {
        console.log('⚠️ Låg FPS detekterad - minskar effekter');
        PERFORMANCE_SETTINGS.enableEffects = false;
        PERFORMANCE_SETTINGS.maxParticles = 20;
        PERFORMANCE_SETTINGS.maxClouds = 2;
    }
    
    // Räkna frame drops
    if (fps < 30) {
        performanceMonitor.frameDrops++;
    }
    
    // Memory användning (om tillgängligt)
    if (performance.memory) {
        performanceMonitor.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        
        if (performanceMonitor.memoryUsage > 100) {
            console.log('🚨 Hög memory-användning:', performanceMonitor.memoryUsage, 'MB');
        }
    }
}

function stopMemoryManagement() {
    if (memoryCleanupInterval) {
        clearInterval(memoryCleanupInterval);
    }
}

// Optimerat objekt-återanvändning med begränsning
function returnObjectToPool(obj, pool, maxSize = 10) {
    if (pool.length < maxSize) {
        obj.active = false;
        obj.x = 0;
        obj.y = 0;
        pool.push(obj);
    }
} 