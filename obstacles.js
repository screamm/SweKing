// Svenska Kung Spel - Avancerat Hindersystem
class SwedishObstacleManager {
    constructor() {
        this.obstacles = [];
        this.obstacleTypes = {
            wave: {
                name: 'Våg',
                icon: '🌊',
                width: 60,
                height: 40,
                color: '#00BFFF',
                difficulty: 1,
                movement: 'sine',
                jumpRequired: true
            },
            bird: {
                name: 'Örn',
                icon: '🦅',
                width: 35,
                height: 25,
                color: '#8B4513',
                difficulty: 2,
                movement: 'horizontal',
                jumpRequired: false // Duck required
            },
            hill: {
                name: 'Kulle',
                icon: '⛰️',
                width: 80,
                height: 60,
                color: '#228B22',
                difficulty: 2,
                movement: 'static',
                jumpRequired: true
            },
            wind: {
                name: 'Vindby',
                icon: '🌪️',
                width: 50,
                height: 100,
                color: '#87CEEB',
                difficulty: 3,
                movement: 'spiral',
                jumpRequired: false // Affects jump physics
            },
            pit: {
                name: 'Grop',
                icon: '🕳️',
                width: 70,
                height: 30,
                color: '#2F4F4F',
                difficulty: 3,
                movement: 'static',
                jumpRequired: true
            },
            thundercloud: {
                name: 'Åskmoln',
                icon: '⛈️',
                width: 90,
                height: 50,
                color: '#4B0082',
                difficulty: 4,
                movement: 'flash',
                jumpRequired: false // Lightning strikes
            }
        };
        
        this.lastSpawnTime = 0;
        this.spawnInterval = 3000; // Ny hinder var 3:e sekund
        this.difficultyLevel = 1;
    }

    // Spawna nytt hinder
    spawnObstacle(canvas, gameSpeed) {
        if (Date.now() - this.lastSpawnTime < this.spawnInterval) return;
        
        // Välj hindertyp baserat på svårighetsgrad
        const availableTypes = Object.keys(this.obstacleTypes).filter(
            type => this.obstacleTypes[type].difficulty <= this.difficultyLevel
        );
        
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const obstacleInfo = this.obstacleTypes[randomType];
        
        let yPosition;
        switch(randomType) {
            case 'wave':
                yPosition = 320; // Vid marken
                break;
            case 'bird':
                yPosition = Math.random() * 150 + 100; // I luften
                break;
            case 'hill':
                yPosition = 280; // Vid marken
                break;
            case 'wind':
                yPosition = 150; // Mitt i luften
                break;
            case 'pit':
                yPosition = 350; // Under marken
                break;
            case 'thundercloud':
                yPosition = 50; // Högt uppe
                break;
            default:
                yPosition = 300;
        }
        
        this.obstacles.push({
            type: randomType,
            x: canvas.width,
            y: yPosition,
            width: obstacleInfo.width,
            height: obstacleInfo.height,
            color: obstacleInfo.color,
            icon: obstacleInfo.icon,
            movement: obstacleInfo.movement,
            phase: 0,
            originalY: yPosition,
            animationSpeed: Math.random() * 0.1 + 0.05,
            active: true,
            flashTimer: 0
        });
        
        this.lastSpawnTime = Date.now();
        
        // Öka svårighetsgrad gradvis
        if (Math.random() < 0.1) { // 10% chans att öka svårighetsgrad
            this.difficultyLevel = Math.min(4, this.difficultyLevel + 0.1);
        }
    }

    // Uppdatera alla hinder
    update(gameSpeed, canvas) {
        // Uppdatera befintliga hinder
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Grundläggande rörelse
            obstacle.x -= gameSpeed;
            obstacle.phase += obstacle.animationSpeed;
            
            // Specifik rörelse för olika hindertyper
            this.updateObstacleMovement(obstacle);
            
            // Ta bort hinder som gått utanför skärmen
            if (obstacle.x < -obstacle.width) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Spawna nya hinder
        if (window.gameRunning) {
            this.spawnObstacle(canvas, gameSpeed);
        }
    }

    // Uppdatera specifik rörelse för hindertyper
    updateObstacleMovement(obstacle) {
        switch(obstacle.movement) {
            case 'sine':
                // Vågor som rör sig upp och ner
                obstacle.y = obstacle.originalY + Math.sin(obstacle.phase) * 20;
                break;
                
            case 'horizontal':
                // Fåglar som flyger fram och tillbaka
                obstacle.y = obstacle.originalY + Math.sin(obstacle.phase * 2) * 30;
                break;
                
            case 'spiral':
                // Vindbyar som snurrar
                obstacle.y = obstacle.originalY + Math.sin(obstacle.phase * 3) * 40;
                break;
                
            case 'flash':
                // Åskmoln som blinkar
                obstacle.flashTimer += 1;
                if (obstacle.flashTimer > 60) { // Blixtar var 60:e frame
                    obstacle.flashTimer = 0;
                    this.createLightning(obstacle);
                }
                break;
        }
    }

    // Skapa blixt från åskmoln
    createLightning(cloud) {
        this.obstacles.push({
            type: 'lightning',
            x: cloud.x + cloud.width/2 - 5,
            y: cloud.y + cloud.height,
            width: 10,
            height: 200,
            color: '#FFFF00',
            icon: '⚡',
            movement: 'static',
            phase: 0,
            originalY: cloud.y + cloud.height,
            animationSpeed: 0,
            active: true,
            lifetime: 30 // Försvinner efter 30 frames
        });
    }

    // Rita alla hinder
    draw(ctx) {
        this.obstacles.forEach(obstacle => {
            this.drawObstacle(ctx, obstacle);
        });
    }

    // Rita specifikt hinder
    drawObstacle(ctx, obstacle) {
        ctx.save();
        
        switch(obstacle.type) {
            case 'wave':
                this.drawWave(ctx, obstacle);
                break;
            case 'bird':
                this.drawBird(ctx, obstacle);
                break;
            case 'hill':
                this.drawHill(ctx, obstacle);
                break;
            case 'wind':
                this.drawWind(ctx, obstacle);
                break;
            case 'pit':
                this.drawPit(ctx, obstacle);
                break;
            case 'thundercloud':
                this.drawThundercloud(ctx, obstacle);
                break;
            case 'lightning':
                this.drawLightning(ctx, obstacle);
                break;
        }
        
        ctx.restore();
    }

    // Rita våg
    drawWave(ctx, obstacle) {
        ctx.fillStyle = obstacle.color;
        ctx.beginPath();
        for (let x = 0; x < obstacle.width; x += 5) {
            const waveY = obstacle.y + Math.sin((x + obstacle.phase * 10) * 0.2) * 10;
            if (x === 0) {
                ctx.moveTo(obstacle.x + x, waveY);
            } else {
                ctx.lineTo(obstacle.x + x, waveY);
            }
        }
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
        
        // Vit skum på toppen
        ctx.fillStyle = 'white';
        ctx.fillRect(obstacle.x, obstacle.y - 5, obstacle.width, 8);
    }

    // Rita fågel
    drawBird(ctx, obstacle) {
        const wingFlap = Math.sin(obstacle.phase * 8) * 5;
        
        // Kropp
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(obstacle.x + 10, obstacle.y + 8, 15, 8);
        
        // Vingar
        ctx.fillStyle = '#654321';
        ctx.fillRect(obstacle.x + 5, obstacle.y + wingFlap, 10, 6);
        ctx.fillRect(obstacle.x + 20, obstacle.y + wingFlap, 10, 6);
        
        // Huvud
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(obstacle.x + 22, obstacle.y + 5, 8, 8);
        
        // Näbb
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(obstacle.x + 30, obstacle.y + 8, 5, 3);
    }

    // Rita kulle
    drawHill(ctx, obstacle) {
        ctx.fillStyle = obstacle.color;
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.quadraticCurveTo(
            obstacle.x + obstacle.width/2, 
            obstacle.y, 
            obstacle.x + obstacle.width, 
            obstacle.y + obstacle.height
        );
        ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
        
        // Gräs på toppen
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 5; i++) {
            const grassX = obstacle.x + i * (obstacle.width/4);
            const grassY = obstacle.y + (Math.pow((grassX - obstacle.x - obstacle.width/2), 2) / (obstacle.width/4));
            ctx.fillRect(grassX, grassY - 5, 2, 8);
        }
    }

    // Rita vindby
    drawWind(ctx, obstacle) {
        const rotation = obstacle.phase * 2;
        ctx.translate(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2);
        ctx.rotate(rotation);
        
        ctx.strokeStyle = obstacle.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let r = 10; r < 40; r += 10) {
            ctx.arc(0, 0, r, 0, Math.PI * 1.5);
        }
        ctx.stroke();
        
        // Partiklar
        ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + rotation;
            const x = Math.cos(angle) * 30;
            const y = Math.sin(angle) * 30;
            ctx.fillRect(x-2, y-2, 4, 4);
        }
    }

    // Rita grop
    drawPit(ctx, obstacle) {
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Mörka sidor för djup-effekt
        ctx.fillStyle = '#0F0F0F';
        ctx.fillRect(obstacle.x, obstacle.y, 5, obstacle.height);
        ctx.fillRect(obstacle.x + obstacle.width - 5, obstacle.y, 5, obstacle.height);
        
        // Gräs vid kanterna
        ctx.fillStyle = '#228B22';
        ctx.fillRect(obstacle.x - 3, obstacle.y - 5, 6, 5);
        ctx.fillRect(obstacle.x + obstacle.width - 3, obstacle.y - 5, 6, 5);
    }

    // Rita åskmoln
    drawThundercloud(ctx, obstacle) {
        const flash = Math.sin(obstacle.phase * 6) > 0.8;
        
        ctx.fillStyle = flash ? '#FFFF99' : '#2F2F2F';
        
        // Moln-form
        ctx.beginPath();
        ctx.arc(obstacle.x + 20, obstacle.y + 20, 18, 0, Math.PI * 2);
        ctx.arc(obstacle.x + 40, obstacle.y + 15, 22, 0, Math.PI * 2);
        ctx.arc(obstacle.x + 60, obstacle.y + 20, 18, 0, Math.PI * 2);
        ctx.arc(obstacle.x + 70, obstacle.y + 35, 15, 0, Math.PI * 2);
        ctx.arc(obstacle.x + 50, obstacle.y + 40, 20, 0, Math.PI * 2);
        ctx.arc(obstacle.x + 25, obstacle.y + 35, 15, 0, Math.PI * 2);
        ctx.fill();
        
        if (flash) {
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 20;
        }
    }

    // Rita blixt
    drawLightning(ctx, obstacle) {
        obstacle.lifetime--;
        if (obstacle.lifetime <= 0) {
            obstacle.active = false;
            return;
        }
        
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y);
        
        // Sicksack-mönster för blixt
        let currentY = obstacle.y;
        const segments = 8;
        for (let i = 1; i <= segments; i++) {
            const x = obstacle.x + (Math.random() - 0.5) * 20;
            currentY += obstacle.height / segments;
            ctx.lineTo(x, currentY);
        }
        
        ctx.stroke();
    }

    // Kollisionskontroll
    checkCollisions(king) {
        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];
            
            if (!obstacle.active) continue;
            
            if (this.checkCollision(king, obstacle)) {
                return this.handleCollision(obstacle, king);
            }
        }
        return false;
    }

    // Hantera kollision
    handleCollision(obstacle, king) {
        switch(obstacle.type) {
            case 'wind':
                // Vindby påverkar hopp-fysik
                if (king.jumping) {
                    king.velocityY *= 1.5; // Starkare hopp
                }
                return false; // Inte dödligt
                
            case 'bird':
                // Fågel kräver duckning (implementeras senare)
                return true; // Kollision
                
            case 'lightning':
                // Blixt är dödlig
                return true;
                
            default:
                return true; // Standard kollision
        }
    }

    // Kollisionskontroll hjälpfunktion
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Rensa alla hinder
    clear() {
        this.obstacles = [];
        this.difficultyLevel = 1;
    }

    // Få aktuell svårighetsgrad
    getDifficulty() {
        return this.difficultyLevel;
    }

    // Sätt svårighetsgrad
    setDifficulty(level) {
        this.difficultyLevel = Math.max(1, Math.min(4, level));
    }
}

// Globala instans
window.swedishObstacles = new SwedishObstacleManager(); 