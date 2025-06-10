// Svenska Ljudeffekter för Kungen Hoppar Flaggor
class SwedishAudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.musicPlaying = false;
        this.soundEnabled = false;
        this.musicEnabled = false;
        this.masterVolume = 0.7;
        
        // Musik och ljud-teman
        this.themes = {
            default: {
                backgroundMusic: 'svenska_marsch',
                jumpSound: 'hoppla',
                coinSound: 'kling',
                gameOverSound: 'nej_da',
                recordSound: 'fanfar'
            }
        };
        
        this.currentTheme = this.themes.default;
    }

    async initialize() {
        try {
            // Web Audio API kräver user interaction först
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
            return true;
        } catch (error) {
            console.log('Audio not supported:', error);
            return false;
        }
    }

    createSounds() {
        // Svenska ljud-definitioner med Web Audio API
        this.sounds = {
            // Kungligt hopp-ljud
            hoppla: () => this.createTone([400, 600, 800], 0.15, 'triangle'),
            
            // Krona-samling (kling!)
            kling: () => this.createChime([800, 1000, 1200, 1000], 0.3),
            
            // Game Over (åh nej!)
            nej_da: () => this.createGameOverSound(),
            
            // Ny rekord fanfar
            fanfar: () => this.createFanfare(),
            
            // Bakgrundsmusik (svensk marsch-tema)
            svenska_marsch: () => this.createSwedishMarch(),
            
            // Flagga-kollision
            bumpp: () => this.createTone([200, 150, 100], 0.3, 'sawtooth')
        };
    }

    // Skapa enkla toner
    createTone(frequencies, duration, waveType = 'sine') {
        if (!this.audioContext || !this.soundEnabled) return;

        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = waveType;
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + (index * duration / frequencies.length));
            oscillator.connect(gainNode);
            oscillator.start(this.audioContext.currentTime + (index * duration / frequencies.length));
            oscillator.stop(this.audioContext.currentTime + duration);
        });
    }

    // Krona-chime effekt
    createChime(frequencies, duration) {
        if (!this.audioContext || !this.soundEnabled) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const gainNode = this.audioContext.createGain();
                gainNode.connect(this.audioContext.destination);
                
                const oscillator = this.audioContext.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                oscillator.connect(gainNode);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }, index * 50);
        });
    }

    // Game Over ljud (dramatiskt)
    createGameOverSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.audioContext.destination);
        
        // Dramatisk nedåtgående ton
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    // Kunglig fanfar för nya rekord
    createFanfare() {
        if (!this.audioContext || !this.soundEnabled) return;

        // Svenska nationalsång-inspirerad fanfar
        const melody = [
            { freq: 523, time: 0 },    // C
            { freq: 659, time: 0.2 },  // E  
            { freq: 784, time: 0.4 },  // G
            { freq: 1047, time: 0.6 }, // C hög
            { freq: 784, time: 0.8 },  // G
            { freq: 1047, time: 1.0 }  // C hög
        ];

        melody.forEach(note => {
            setTimeout(() => {
                const gainNode = this.audioContext.createGain();
                gainNode.connect(this.audioContext.destination);
                
                const oscillator = this.audioContext.createOscillator();
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.6, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.connect(gainNode);
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, note.time * 1000);
        });
    }

    // Svensk marsch-inspirerad bakgrundsmusik
    createSwedishMarch() {
        if (!this.audioContext || !this.musicEnabled || this.musicPlaying) return;

        this.musicPlaying = true;
        
        // Enkel svensk marsch-melodi (loop)
        const marchMelody = [
            523, 659, 784, 659, 523, 659, 784, 1047,  // Första fras
            784, 659, 523, 659, 784, 659, 523, 392   // Andra fras
        ];
        
        const playMelodyLoop = () => {
            if (!this.musicEnabled || !this.musicPlaying) return;
            
            marchMelody.forEach((freq, index) => {
                setTimeout(() => {
                    if (!this.musicEnabled || !this.musicPlaying) return;
                    
                    const gainNode = this.audioContext.createGain();
                    gainNode.connect(this.audioContext.destination);
                    
                    const oscillator = this.audioContext.createOscillator();
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.15, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    
                    oscillator.connect(gainNode);
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.4);
                }, index * 400);
            });
            
            // Loop musik efter 7 sekunder
            setTimeout(() => {
                if (this.musicEnabled && this.musicPlaying) {
                    playMelodyLoop();
                }
            }, 7000);
        };
        
        playMelodyLoop();
    }

    // Spela specifikt ljud
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // Hantera musik
    startMusic() {
        if (!this.musicPlaying) {
            this.playSound('svenska_marsch');
        }
    }

    stopMusic() {
        this.musicPlaying = false;
    }

    // Aktivera ljud (kräver user interaction)
    async enableAudio() {
        try {
            if (!this.audioContext) {
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Audio initialization failed');
                }
            }
            
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.soundEnabled = true;
            this.musicEnabled = true;
            
            // Spela välkomst-ljud
            setTimeout(() => this.playSound('kling'), 100);
            
            return this.soundEnabled;
        } catch (error) {
            console.log('Audio enable failed:', error);
            // Sätt ljud som inaktiverat om det misslyckas
            this.soundEnabled = false;
            this.musicEnabled = false;
            throw error; // Kasta vidare felet så game.js kan hantera det
        }
    }

    // Toggle funktioner
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
        return this.musicEnabled;
    }

    // Volym kontroll
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Global audio manager
window.swedishAudio = new SwedishAudioManager(); 