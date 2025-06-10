// Svenska Kung Spel - Visuella Effekter & Partikelsystem
class SwedishEffectsManager {
    constructor() {
        this.particles = [];
        this.timeOfDay = this.getCurrentTimeOfDay();
        this.weather = 'clear';
        this.weatherTimer = 0;
        this.seasonalElements = [];
        
        this.effectTypes = {
            glitter: {
                color: '#FFD700',
                size: 3,
                lifetime: 60,
                speed: 2,
                gravity: 0.1
            },
            explosion: {
                color: '#FF4500',
                size: 5,
                lifetime: 30,
                speed: 5,
                gravity: 0.2
            },
            stars: {
                color: '#FFFFFF',
                size: 2,
                lifetime: 120,
                speed: 1,
                gravity: 0.05
            },
            rainbow: {
                colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
                size: 4,
                lifetime: 90,
                speed: 1.5,
                gravity: 0.08
            },
            snow: {
                color: '#FFFFFF',
                size: 4,
                lifetime: 200,
                speed: 0.5,
                gravity: 0.02
            }
        };
    }

    // Få aktuell tid på dagen
    getCurrentTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'day';
        if (hour < 22) return 'evening';
        return 'night';
    }

    // Få aktuell säsong
    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }

    // Skapa glitter-effekt (när man samlar kronor)
    createGlitter(x, y, amount = 10) {
        for (let i = 0; i < amount; i++) {
            this.particles.push({
                type: 'glitter',
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 2,
                color: `hsl(${45 + Math.random() * 30}, 100%, ${70 + Math.random() * 30}%)`,
                lifetime: this.effectTypes.glitter.lifetime,
                maxLifetime: this.effectTypes.glitter.lifetime,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }

    // Skapa explosion-effekt (vid kollision)
    createExplosion(x, y, amount = 15) {
        for (let i = 0; i < amount; i++) {
            const angle = (i / amount) * Math.PI * 2;
            const speed = Math.random() * 5 + 3;
            
            this.particles.push({
                type: 'explosion',
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                size: Math.random() * 4 + 3,
                color: `hsl(${Math.random() * 60}, 100%, ${60 + Math.random() * 40}%)`,
                lifetime: this.effectTypes.explosion.lifetime,
                maxLifetime: this.effectTypes.explosion.lifetime,
                rotation: 0,
                rotationSpeed: 0
            });
        }
    }

    // Skapa stjärnfall i bakgrunden
    createStarfall(canvas) {
        if (this.timeOfDay === 'night' && Math.random() < 0.02) {
            this.particles.push({
                type: 'stars',
                x: canvas.width + 10,
                y: Math.random() * 100,
                velocityX: -3 - Math.random() * 2,
                velocityY: 1 + Math.random(),
                size: Math.random() * 2 + 1,
                color: '#FFFFFF',
                lifetime: this.effectTypes.stars.lifetime,
                maxLifetime: this.effectTypes.stars.lifetime,
                rotation: 0,
                rotationSpeed: 0,
                trail: []
            });
        }
    }

    // Skapa regnbåge (efter regn)
    createRainbow(canvas) {
        if (this.weather === 'rainbow') {
            const colors = this.effectTypes.rainbow.colors;
            for (let i = 0; i < colors.length; i++) {
                this.particles.push({
                    type: 'rainbow',
                    x: canvas.width / 2 + i * 20,
                    y: 150,
                    velocityX: 0,
                    velocityY: 0.5,
                    size: 8,
                    color: colors[i],
                    lifetime: 180,
                    maxLifetime: 180,
                    rotation: 0,
                    rotationSpeed: 0,
                    opacity: 0.7
                });
            }
        }
    }

    // Skapa snöfall
    createSnowfall(canvas) {
        const season = this.getCurrentSeason();
        if (season === 'winter' || this.weather === 'snow') {
            if (Math.random() < 0.3) {
                this.particles.push({
                    type: 'snow',
                    x: Math.random() * (canvas.width + 20),
                    y: -10,
                    velocityX: (Math.random() - 0.5) * 0.5,
                    velocityY: Math.random() * 1 + 0.5,
                    size: Math.random() * 3 + 2,
                    color: '#FFFFFF',
                    lifetime: this.effectTypes.snow.lifetime,
                    maxLifetime: this.effectTypes.snow.lifetime,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.05,
                    opacity: 0.8
                });
            }
        }
    }

    // Uppdatera alla partiklar
    update(canvas) {
        // Uppdatera tid och väder
        this.updateTimeAndWeather();
        
        // Skapa säsongspartiklar
        this.createStarfall(canvas);
        this.createSnowfall(canvas);
        this.createRainbow(canvas);
        
        // Uppdatera befintliga partiklar
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Uppdatera position
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            
            // Applicera gravitation
            const gravity = this.effectTypes[particle.type]?.gravity || 0.1;
            particle.velocityY += gravity;
            
            // Uppdatera rotation
            particle.rotation += particle.rotationSpeed;
            
            // Minska livstid
            particle.lifetime--;
            
            // Uppdatera trail för stjärnor
            if (particle.type === 'stars' && particle.trail) {
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > 8) {
                    particle.trail.shift();
                }
            }
            
            // Ta bort döda partiklar
            if (particle.lifetime <= 0 || 
                particle.x < -50 || particle.x > canvas.width + 50 ||
                particle.y > canvas.height + 50) {
                this.particles.splice(i, 1);
            }
        }
    }

    // Uppdatera tid och väder
    updateTimeAndWeather() {
        this.timeOfDay = this.getCurrentTimeOfDay();
        this.weatherTimer++;
        
        // Ändra väder ibland
        if (this.weatherTimer > 1800) { // Var 30:e sekund (60fps)
            this.weatherTimer = 0;
            const weatherTypes = ['clear', 'rain', 'snow', 'rainbow'];
            this.weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        }
    }

    // Rita alla partiklar
    draw(ctx, canvas) {
        // Rita bakgrundseffekter först
        this.drawBackground(ctx, canvas);
        
        // Rita alla partiklar
        this.particles.forEach(particle => {
            this.drawParticle(ctx, particle);
        });
    }

    // Rita bakgrundsgradient baserat på tid
    drawBackground(ctx, canvas) {
        // Säkerhetskoll för canvas dimensioner
        if (!canvas || !canvas.height || !isFinite(canvas.height)) {
            console.warn('⚠️ Canvas height is not finite, skipping background');
            return;
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        switch(this.timeOfDay) {
            case 'morning':
                gradient.addColorStop(0, '#FFE4B5'); // Ljus orange
                gradient.addColorStop(1, '#98FB98'); // Ljusgrön
                break;
            case 'day':
                gradient.addColorStop(0, '#87CEEB'); // Himelsblå
                gradient.addColorStop(1, '#98FB98'); // Ljusgrön
                break;
            case 'evening':
                gradient.addColorStop(0, '#FF6347'); // Röd-orange
                gradient.addColorStop(1, '#FFD700'); // Guld
                break;
            case 'night':
                gradient.addColorStop(0, '#191970'); // Midnattsblå
                gradient.addColorStop(1, '#2F4F4F'); // Mörkgrå
                break;
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Rita måne eller sol
        this.drawCelestialBodies(ctx, canvas);
    }

    // Rita sol/måne
    drawCelestialBodies(ctx, canvas) {
        if (this.timeOfDay === 'night') {
            // Måne
            ctx.fillStyle = '#F5F5DC';
            ctx.beginPath();
            ctx.arc(canvas.width - 100, 80, 25, 0, Math.PI * 2);
            ctx.fill();
            
            // Kraterdetaljer
            ctx.fillStyle = '#E6E6FA';
            ctx.beginPath();
            ctx.arc(canvas.width - 95, 75, 3, 0, Math.PI * 2);
            ctx.arc(canvas.width - 105, 85, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Stjärnor
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * 150;
                ctx.fillRect(x, y, 1, 1);
            }
        } else {
            // Sol
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(canvas.width - 100, 80, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Solstrålar
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x1 = canvas.width - 100 + Math.cos(angle) * 35;
                const y1 = 80 + Math.sin(angle) * 35;
                const x2 = canvas.width - 100 + Math.cos(angle) * 45;
                const y2 = 80 + Math.sin(angle) * 45;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            ctx.shadowBlur = 0;
        }
    }

    // Rita individuell partikel
    drawParticle(ctx, particle) {
        ctx.save();
        
        // Sätt opacitet baserat på livstid
        const alpha = particle.lifetime / particle.maxLifetime;
        ctx.globalAlpha = particle.opacity || alpha;
        
        // Flytta till partikelns position
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        
        switch(particle.type) {
            case 'glitter':
                this.drawGlitterParticle(ctx, particle);
                break;
            case 'explosion':
                this.drawExplosionParticle(ctx, particle);
                break;
            case 'stars':
                this.drawStarParticle(ctx, particle);
                break;
            case 'rainbow':
                this.drawRainbowParticle(ctx, particle);
                break;
            case 'snow':
                this.drawSnowParticle(ctx, particle);
                break;
        }
        
        ctx.restore();
    }

    // Rita glitter-partikel
    drawGlitterParticle(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 5;
        
        // Stjärnform
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Rita explosion-partikel
    drawExplosionParticle(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Rita stjärn-partikel
    drawStarParticle(ctx, particle) {
        // Rita trail
        if (particle.trail && particle.trail.length > 1) {
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.trail[0].x - particle.x, particle.trail[0].y - particle.y);
            
            for (let i = 1; i < particle.trail.length; i++) {
                ctx.lineTo(
                    particle.trail[i].x - particle.x, 
                    particle.trail[i].y - particle.y
                );
            }
            ctx.stroke();
        }
        
        // Rita stjärna
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Rita regnbåge-partikel
    drawRainbowParticle(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size * 4);
    }

    // Rita snö-partikel
    drawSnowParticle(ctx, particle) {
        ctx.fillStyle = particle.color;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 3;
        
        // Snöflinga-form
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Snöflinga-detaljer
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * particle.size * 1.5,
                Math.sin(angle) * particle.size * 1.5
            );
            ctx.stroke();
        }
    }

    // Skapa power-up effekt
    createPowerupEffect(x, y, color) {
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            
            this.particles.push({
                type: 'glitter',
                x: x,
                y: y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: color,
                lifetime: 60,
                maxLifetime: 60,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }
    }

    // Rensa alla partiklar
    clear() {
        this.particles = [];
    }

    // Få aktuellt väder
    getWeather() {
        return this.weather;
    }

    // Sätt väder manuellt
    setWeather(weather) {
        this.weather = weather;
    }
}

// Globala instans
window.swedishEffects = new SwedishEffectsManager(); 