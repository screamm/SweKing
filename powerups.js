// Svenska Kung Spel - Power-ups System
class SwedishPowerupManager {
    constructor() {
        this.activePowerups = [];
        this.powerupTypes = {
            doubleJump: {
                name: 'Dubbel-hopp',
                icon: '⚡',
                duration: 15000, // 15 sekunder
                color: '#FFD700',
                description: 'Hoppa två gånger i luften!'
            },
            shield: {
                name: 'Kungligt Skydd',
                icon: '🛡️',
                duration: 10000, // 10 sekunder
                color: '#C0C0C0',
                description: 'Immun mot nästa kollision!'
            },
            magnet: {
                name: 'Krona-magnet',
                icon: '🌟',
                duration: 20000, // 20 sekunder
                color: '#FF69B4',
                description: 'Attraherar kronor automatiskt!'
            },
            speed: {
                name: 'Svenska Blixten',
                icon: '💨',
                duration: 12000, // 12 sekunder
                color: '#00BFFF',
                description: 'Dubbel hastighet!'
            },
            superCrown: {
                name: 'Diamant-krona',
                icon: '💎',
                duration: 8000, // 8 sekunder
                color: '#9932CC',
                description: 'Kronor värda 50 poäng!'
            },
            invincible: {
                name: 'Kunglig Immunitet',
                icon: '👑',
                duration: 5000, // 5 sekunder
                color: '#FFD700',
                description: 'Totalt opåverkad av hinder!'
            }
        };
        
        this.spawnedPowerups = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 8000; // Ny power-up var 8:e sekund
    }

    // Spawna power-ups på spelplanen
    spawnPowerup(canvas) {
        if (Date.now() - this.lastSpawnTime < this.spawnInterval) return;
        
        const types = Object.keys(this.powerupTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const powerupInfo = this.powerupTypes[randomType];
        
        this.spawnedPowerups.push({
            type: randomType,
            x: canvas.width,
            y: Math.random() * 200 + 100, // Mellan y=100 och y=300
            width: 30,
            height: 30,
            collected: false,
            icon: powerupInfo.icon,
            color: powerupInfo.color,
            pulsePhase: 0
        });
        
        this.lastSpawnTime = Date.now();
    }

    // Uppdatera power-ups
    update(gameSpeed, canvas) {
        // Uppdatera spawnade power-ups
        for (let i = this.spawnedPowerups.length - 1; i >= 0; i--) {
            const powerup = this.spawnedPowerups[i];
            powerup.x -= gameSpeed;
            powerup.pulsePhase += 0.2;
            
            // Ta bort power-ups som gått utanför skärmen
            if (powerup.x < -powerup.width) {
                this.spawnedPowerups.splice(i, 1);
            }
        }
        
        // Uppdatera aktiva power-ups
        for (let i = this.activePowerups.length - 1; i >= 0; i--) {
            const active = this.activePowerups[i];
            if (Date.now() - active.startTime > active.duration) {
                this.deactivatePowerup(active);
                this.activePowerups.splice(i, 1);
            }
        }
        
        // Spawna nya power-ups
        if (window.gameRunning) {
            this.spawnPowerup(canvas);
        }
    }

    // Rita power-ups
    draw(ctx) {
        this.spawnedPowerups.forEach(powerup => {
            // Rita power-up med pulsande effekt
            const pulseScale = 1 + Math.sin(powerup.pulsePhase) * 0.2;
            const size = powerup.width * pulseScale;
            
            // Bakgrund med glöd
            ctx.save();
            ctx.shadowColor = powerup.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = powerup.color + '40'; // Semi-transparent
            ctx.fillRect(
                powerup.x - size/4, 
                powerup.y - size/4, 
                size * 1.5, 
                size * 1.5
            );
            
            // Power-up ikon
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillStyle = powerup.color;
            ctx.fillText(
                powerup.icon, 
                powerup.x + powerup.width/2, 
                powerup.y + powerup.height/2 + size/4
            );
            ctx.restore();
        });
        
        // Rita aktiva power-up ikoner i HUD
        this.drawActivePowerups(ctx);
    }

    // Rita aktiva power-ups i HUD
    drawActivePowerups(ctx) {
        let yOffset = 60;
        this.activePowerups.forEach(active => {
            const remaining = active.duration - (Date.now() - active.startTime);
            const percentage = remaining / active.duration;
            
            // Bakgrund
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, yOffset, 200, 35);
            
            // Progress bar
            ctx.fillStyle = active.powerup.color;
            ctx.fillRect(12, yOffset + 2, 196 * percentage, 31);
            
            // Ikon och text
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText(
                `${active.powerup.icon} ${active.powerup.name}`, 
                15, 
                yOffset + 22
            );
            
            // Tid kvar
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(
                `${Math.ceil(remaining/1000)}s`, 
                205, 
                yOffset + 22
            );
            
            yOffset += 40;
        });
    }

    // Kollisionskontroll
    checkCollisions(king) {
        for (let i = this.spawnedPowerups.length - 1; i >= 0; i--) {
            const powerup = this.spawnedPowerups[i];
            
            if (this.checkCollision(king, powerup) && !powerup.collected) {
                this.collectPowerup(powerup.type, i);
                return true;
            }
        }
        return false;
    }

    // Samla power-up
    collectPowerup(type, index) {
        const powerupInfo = this.powerupTypes[type];
        
        // Markera som samlad
        this.spawnedPowerups[index].collected = true;
        this.spawnedPowerups.splice(index, 1);
        
        // Aktivera power-up
        this.activePowerups.push({
            type: type,
            powerup: powerupInfo,
            startTime: Date.now(),
            duration: powerupInfo.duration
        });
        
        // Spela ljud
        if (window.swedishAudio) {
            window.swedishAudio.playSound('powerup');
        }
        
        // Visa meddelande
        this.showPowerupMessage(powerupInfo);
        
        console.log(`Power-up aktiverad: ${powerupInfo.name}`);
    }

    // Visa power-up meddelande
    showPowerupMessage(powerupInfo) {
        const message = document.createElement('div');
        message.className = 'powerup-message';
        message.innerHTML = `
            <span class="powerup-icon">${powerupInfo.icon}</span>
            <span class="powerup-text">${powerupInfo.name}</span>
        `;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, ${powerupInfo.color}, #fff);
            color: #000;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: powerupPop 2s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        // Ta bort efter animation
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }

    // Avaktivera power-up
    deactivatePowerup(active) {
        console.log(`Power-up avaktiverad: ${active.powerup.name}`);
        
        // Specifik avaktivering för olika typer
        switch(active.type) {
            case 'shield':
                // Återställ skydd
                if (window.king) window.king.hasShield = false;
                break;
            case 'speed':
                // Återställ hastighet hanteras i game.js
                break;
        }
    }

    // Kontrollera aktiva power-ups
    hasPowerup(type) {
        return this.activePowerups.some(active => active.type === type);
    }

    // Kollisionskontroll hjälpfunktion
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    // Få magnet-radius
    getMagnetRadius() {
        return this.hasPowerup('magnet') ? 100 : 0;
    }

    // Få hastighets-multiplikator
    getSpeedMultiplier() {
        return this.hasPowerup('speed') ? 2 : 1;
    }

    // Få krona-värde multiplikator
    getCrownMultiplier() {
        return this.hasPowerup('superCrown') ? 5 : 1;
    }

    // Kontrollera om spelaren är immun
    isInvincible() {
        return this.hasPowerup('invincible') || this.hasPowerup('shield');
    }

    // Kan dubbel-hoppa
    canDoubleJump() {
        return this.hasPowerup('doubleJump');
    }

    // Använd dubbel-hopp (används i game.js)
    useDoubleJump() {
        // Implementation i game.js
    }

    // Rensa alla power-ups (vid game over)
    clear() {
        this.activePowerups = [];
        this.spawnedPowerups = [];
    }
}

// CSS för power-up animationer
const powerupCSS = `
@keyframes powerupPop {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }
    20% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
    }
    80% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
    }
}

.powerup-message {
    display: flex;
    align-items: center;
    gap: 10px;
}

.powerup-icon {
    font-size: 24px;
}

.powerup-text {
    font-family: Arial, sans-serif;
}
`;

// Lägg till CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = powerupCSS;
document.head.appendChild(styleSheet);

// Globala instans
window.swedishPowerups = new SwedishPowerupManager(); 