// Svenska Kung Spel - Huvudmeny System
class SwedishGameMenu {
    constructor() {
        this.currentView = 'main-menu';
        this.playerStats = this.loadPlayerStats();
        this.initializeMenu();
    }

    loadPlayerStats() {
        return {
            totalScore: parseInt(localStorage.getItem('swedishKing_totalScore') || '0'),
            gamesPlayed: parseInt(localStorage.getItem('swedishKing_gamesPlayed') || '0'),
            bestScore: parseInt(localStorage.getItem('swedishKing_bestScore') || '0'),
            totalJumps: parseInt(localStorage.getItem('swedishKing_totalJumps') || '0'),
            totalCoins: parseInt(localStorage.getItem('swedishKing_totalCoins') || '0'),
            level: Math.floor(parseInt(localStorage.getItem('swedishKing_totalScore') || '0') / 1000) + 1
        };
    }

    updatePlayerStats(score, jumps, coins) {
        this.playerStats.totalScore += score;
        this.playerStats.gamesPlayed += 1;
        this.playerStats.totalJumps += jumps;
        this.playerStats.totalCoins += coins;
        
        if (score > this.playerStats.bestScore) {
            this.playerStats.bestScore = score;
        }
        
        this.playerStats.level = Math.floor(this.playerStats.totalScore / 1000) + 1;
        
        // Spara till localStorage
        localStorage.setItem('swedishKing_totalScore', this.playerStats.totalScore.toString());
        localStorage.setItem('swedishKing_gamesPlayed', this.playerStats.gamesPlayed.toString());
        localStorage.setItem('swedishKing_bestScore', this.playerStats.bestScore.toString());
        localStorage.setItem('swedishKing_totalJumps', this.playerStats.totalJumps.toString());
        localStorage.setItem('swedishKing_totalCoins', this.playerStats.totalCoins.toString());
    }

    initializeMenu() {
        this.createMenuHTML();
        this.bindMenuEvents();
        this.hideGameContent(); // Dölj allt spelinnehåll först
        this.showMainMenu();
    }

    createMenuHTML() {
        const gameContainer = document.querySelector('.game-container');
        
        // Skapa huvudmeny HTML
        const menuHTML = `
            <!-- Huvudmeny -->
            <div id="mainMenu" class="menu-screen">
                <div class="menu-header">
                    <h1>🇸🇪 KUNGEN HOPPAR FLAGGOR 👑</h1>
                    <div class="subtitle">Svenska Nationaldags-spelet som gör dig till kung!</div>
                </div>
                
                <div class="player-info">
                    <div class="player-level">Level ${this.playerStats.level} Kung</div>
                    <div class="player-stats">
                        <span>🏆 Bästa: ${this.playerStats.bestScore}</span>
                        <span>🎮 Spel: ${this.playerStats.gamesPlayed}</span>
                        <span>💰 Kronor: ${this.playerStats.totalCoins}</span>
                    </div>
                </div>

                <div class="menu-buttons">
                    <button class="menu-btn solo-btn" onclick="gameMenu.startSoloGame()">
                        <div class="btn-icon">👑</div>
                        <div class="btn-text">
                            <div class="btn-title">SPELA SOLO</div>
                            <div class="btn-desc">Klassisk kung-hoppning för en spelare</div>
                        </div>
                    </button>

                    <button class="menu-btn challenges-btn" onclick="gameMenu.showChallengesMenu()">
                        <div class="btn-icon">⭐</div>
                        <div class="btn-text">
                            <div class="btn-title">DAGENS UTMANINGAR</div>
                            <div class="btn-desc">Speciella mål och belöningar</div>
                        </div>
                    </button>

                    <button class="menu-btn leaderboard-btn" onclick="gameMenu.showLeaderboard()">
                        <div class="btn-icon">📊</div>
                        <div class="btn-text">
                            <div class="btn-title">TOPPLISTA</div>
                            <div class="btn-desc">Se de bästa svenska spelarna</div>
                        </div>
                    </button>

                    <button class="menu-btn howto-btn" onclick="gameMenu.showHowToPlay()">
                        <div class="btn-icon">❓</div>
                        <div class="btn-text">
                            <div class="btn-title">HUR MAN SPELAR</div>
                            <div class="btn-desc">Lär dig grunderna</div>
                        </div>
                    </button>

                    <button class="menu-btn settings-btn" onclick="gameMenu.showSettings()">
                        <div class="btn-icon">⚙️</div>
                        <div class="btn-text">
                            <div class="btn-title">INSTÄLLNINGAR</div>
                            <div class="btn-desc">Ljud, grafik och kontroller</div>
                        </div>
                    </button>

                    <button class="menu-btn about-btn" onclick="gameMenu.showAbout()">
                        <div class="btn-icon">🇸🇪</div>
                        <div class="btn-text">
                            <div class="btn-title">OM SPELET</div>
                            <div class="btn-desc">Skapad för svenska nationaldagen</div>
                        </div>
                    </button>

                    <button class="menu-btn campaign-btn" onclick="gameMenu.showCampaign()">
                        <div class="btn-icon">📚</div>
                        <div class="btn-text">
                            <div class="btn-title">KAMPANJ MODE</div>
                            <div class="btn-desc">Berättelse & uppdrag</div>
                        </div>
                    </button>

                    <button class="menu-btn achievements-btn" onclick="gameMenu.showAchievements()">
                        <div class="btn-icon">🏆</div>
                        <div class="btn-text">
                            <div class="btn-title">ACHIEVEMENTS</div>
                            <div class="btn-desc">Utmärkelser & mål</div>
                        </div>
                    </button>

                    <button class="menu-btn customize-btn" onclick="gameMenu.showCustomization()">
                        <div class="btn-icon">👑</div>
                        <div class="btn-text">
                            <div class="btn-title">ANPASSA KUNG</div>
                            <div class="btn-desc">Outfits & tillbehör</div>
                        </div>
                    </button>
                </div>

                <div class="menu-footer">
                    <div class="social-links">
                        <button class="social-link" onclick="gameMenu.shareGame('twitter')">🐦 Twitter</button>
                        <button class="social-link" onclick="gameMenu.shareGame('facebook')">📘 Facebook</button>
                        <button class="social-link" onclick="gameMenu.shareGame('whatsapp')">💬 WhatsApp</button>
                    </div>
                    <div class="version-info">v3.0 - Optimerat för Prestanda! 🚀</div>
                </div>
            </div>



            <!-- Challenges Menu -->
            <div id="challengesMenu" class="menu-screen" style="display: none;">
                <div class="menu-header">
                    <h2>⭐ DAGENS UTMANINGAR</h2>
                    <button class="back-btn" onclick="gameMenu.showMainMenu()">← Tillbaka</button>
                </div>
                <div id="challengesList" class="challenges-container">
                    <!-- Challenges kommer laddas här -->
                </div>
            </div>

            <!-- Settings Menu -->
            <div id="settingsMenu" class="menu-screen" style="display: none;">
                <div class="menu-header">
                    <h2>⚙️ INSTÄLLNINGAR</h2>
                    <button class="back-btn" onclick="gameMenu.showMainMenu()">← Tillbaka</button>
                </div>

                <div class="settings-container">
                    <div class="setting-item">
                        <label>🔊 Ljudeffekter</label>
                        <button id="soundToggleMenu" class="setting-toggle active">På</button>
                    </div>
                    
                    <div class="setting-item">
                        <label>🎵 Bakgrundsmusik</label>
                        <button id="musicToggleMenu" class="setting-toggle active">På</button>
                    </div>

                    <div class="setting-item">
                        <label>🔉 Volym</label>
                        <input type="range" id="volumeSlider" min="0" max="100" value="70" class="volume-slider">
                    </div>

                    <div class="setting-item">
                        <label>👑 Spelarnamn</label>
                        <input type="text" id="playerNameSetting" class="name-input" placeholder="Skriv ditt namn...">
                    </div>

                    <div class="setting-item">
                        <label>🎮 Kontroller</label>
                        <div class="controls-info">MELLANSLAG = Hoppa</div>
                    </div>
                </div>
            </div>

            <!-- How to Play Menu -->
            <div id="howtoMenu" class="menu-screen" style="display: none;">
                <div class="menu-header">
                    <h2>❓ HUR MAN SPELAR</h2>
                    <button class="back-btn" onclick="gameMenu.showMainMenu()">← Tillbaka</button>
                </div>

                <div class="howto-container">
                    <div class="howto-section">
                        <h3>🎯 Mål</h3>
                        <p>Hjälp svenska kungen att hoppa över flaggor och samla så många kronor som möjligt!</p>
                    </div>

                    <div class="howto-section">
                        <h3>🎮 Kontroller</h3>
                        <p><strong>MELLANSLAG</strong> - Få kungen att hoppa</p>
                        <p><strong>Timing</strong> - Hoppa precis innan flaggorna för bästa resultat</p>
                    </div>

                    <div class="howto-section">
                        <h3>💰 Poängsystem</h3>
                        <p><strong>Kronor:</strong> +10 poäng per krona du samlar</p>
                        <p><strong>Överlevnad:</strong> Ju längre du klarar dig, desto snabbare blir spelet</p>
                    </div>

                    <div class="howto-section">
                        <h3>⭐ Utmaningar</h3>
                        <p><strong>Dagliga mål:</strong> Nya utmaningar varje dag</p>
                        <p><strong>Veckoturnering:</strong> Tävla mot andra för stora priser</p>
                    </div>

                    <div class="howto-section">
                        <h3>🏁 Multiplayer</h3>
                        <p><strong>Real-time racing:</strong> Tävla mot andra spelare live</p>
                        <p><strong>Utmana vänner:</strong> Skicka race-inbjudningar</p>
                    </div>
                </div>
            </div>

            <!-- About Menu -->
            <div id="aboutMenu" class="menu-screen" style="display: none;">
                <div class="menu-header">
                    <h2>🇸🇪 OM SPELET</h2>
                    <button class="back-btn" onclick="gameMenu.showMainMenu()">← Tillbaka</button>
                </div>

                <div class="about-container">
                    <div class="about-section">
                        <h3>👑 Kungen Hoppar Flaggor</h3>
                        <p>Ett roligt svenska nationaldag-spel där du hjälper kungen att hoppa över flaggor och samla kronor!</p>
                    </div>

                    <div class="about-section">
                        <h3>🛠️ Teknologi</h3>
                        <p><strong>Frontend:</strong> Vanilla JavaScript + HTML5 Canvas</p>
                        <p><strong>Backend:</strong> Cloudflare Workers + D1 Database</p>
                        <p><strong>Multiplayer:</strong> WebSockets för real-time features</p>
                        <p><strong>Audio:</strong> Web Audio API för svenska ljudeffekter</p>
                    </div>

                    <div class="about-section">
                        <h3>🎨 Features</h3>
                        <p>✅ Svenska ljudeffekter och musik</p>
                        <p>✅ Real-time multiplayer racing</p>
                        <p>✅ Dagliga utmaningar och veckoturnering</p>
                        <p>✅ Social sharing på alla plattformar</p>
                        <p>✅ Permanent topplista</p>
                        <p>✅ Responsiv design för alla enheter</p>
                    </div>

                    <div class="about-section">
                        <h3>🇸🇪 För Sverige</h3>
                        <p>Skapad med kärlek för svenska nationaldagen och alla som älskar Sverige!</p>
                        <p><em>Leve Kungen! 👑</em></p>
                    </div>
                </div>
            </div>
        `;

        // Lägg till menu före befintligt innehåll
        gameContainer.insertAdjacentHTML('afterbegin', menuHTML);
    }

    bindMenuEvents() {
        // Settings events
        document.getElementById('soundToggleMenu').addEventListener('click', () => {
            this.toggleAudioSetting('sound');
        });

        document.getElementById('musicToggleMenu').addEventListener('click', () => {
            this.toggleAudioSetting('music');
        });

        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (window.swedishAudio) {
                window.swedishAudio.setVolume(volume);
            }
        });

        document.getElementById('playerNameSetting').addEventListener('change', (e) => {
            const name = e.target.value.trim();
            if (name && window.swedishMultiplayer) {
                window.swedishMultiplayer.setPlayerName(name);
            }
        });
    }

    toggleAudioSetting(type) {
        const button = document.getElementById(type + 'ToggleMenu');
        const isActive = button.classList.contains('active');
        
        if (type === 'sound' && window.swedishAudio) {
            window.swedishAudio.soundEnabled = !isActive;
        } else if (type === 'music' && window.swedishAudio) {
            window.swedishAudio.musicEnabled = !isActive;
        }
        
        button.classList.toggle('active');
        button.textContent = isActive ? 'Av' : 'På';
    }

    // Navigation methods
    showMainMenu() {
        this.hideAllMenus();
        document.getElementById('mainMenu').style.display = 'block';
        this.currentView = 'main-menu';
    }

    showChallengesMenu() {
        this.hideAllMenus();
        document.getElementById('challengesMenu').style.display = 'block';
        this.loadChallengesIntoMenu();
        this.currentView = 'challenges-menu';
    }

    showSettings() {
        this.hideAllMenus();
        document.getElementById('settingsMenu').style.display = 'block';
        this.loadSettingsValues();
        this.currentView = 'settings';
    }

    showHowToPlay() {
        this.hideAllMenus();
        document.getElementById('howtoMenu').style.display = 'block';
        this.currentView = 'howto';
    }

    showAbout() {
        this.hideAllMenus();
        document.getElementById('aboutMenu').style.display = 'block';
        this.currentView = 'about';
    }

    showCampaign() {
        this.hideAllMenus();
        if (window.swedishStory) {
            window.swedishStory.openStoryModeUI();
        }
    }

    showAchievements() {
        this.hideAllMenus();
        if (window.swedishAchievements) {
            window.swedishAchievements.openAchievementsUI();
        }
    }

    showCustomization() {
        this.hideAllMenus();
        if (window.swedishCharacter) {
            window.swedishCharacter.openCustomizationUI();
        }
    }

    hideAllMenus() {
        const menus = ['mainMenu', 'challengesMenu', 'settingsMenu', 'howtoMenu', 'aboutMenu'];
        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) menu.style.display = 'none';
        });
    }

    hideGameContent() {
        // Dölj hela det gamla spel-UI:t
        const legacyContent = document.getElementById('legacyGameContent');
        if (legacyContent) legacyContent.style.display = 'none';
    }

    showGameContent() {
        // Visa hela det gamla spel-UI:t
        const legacyContent = document.getElementById('legacyGameContent');
        if (legacyContent) legacyContent.style.display = 'block';
        
        // Visa specifika spelelement
        const gameElements = ['gameControls', 'audioControls'];
        gameElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'block';
        });
        
        // Visa canvas och score
        const canvas = document.getElementById('gameCanvas');
        const score = document.querySelector('.score');
        if (canvas) canvas.style.display = 'block';
        if (score) score.style.display = 'block';
        
        const audioControls = document.getElementById('audioControls');
        if (audioControls) audioControls.style.display = 'flex';
    }

    // Game launch methods
    async startSoloGame() {
        this.hideAllMenus();
        this.showGameContent();
        
        // Initiera ljud
        if (window.swedishAudio) {
            await window.swedishAudio.enableAudio();
            window.swedishAudio.startMusic();
        }
        
        // Starta spel
        if (window.resetGame) {
            window.resetGame();
        }
        
        window.gameRunning = true;
        window.gameStartTime = Date.now();
    }

    async loadChallengesIntoMenu() {
        // Förenklad challenges utan multiplayer
        const container = document.getElementById('challengesList');
        
        const localChallenges = [
            {
                title: "Första Hopp",
                description: "Hoppa 10 gånger",
                progress: this.playerStats.totalJumps,
                target: 10,
                reward: "Bronsskölden 🛡️"
            },
            {
                title: "Kronssamlare",
                description: "Samla 100 kronor",
                progress: this.playerStats.totalCoins,
                target: 100,
                reward: "Guldkrona 👑"
            },
            {
                title: "Ihärdig Spelare",
                description: "Spela 5 spel",
                progress: this.playerStats.gamesPlayed,
                target: 5,
                reward: "Erfarenhetspoäng ⭐"
            }
        ];
        
        container.innerHTML = localChallenges.map(challenge => {
            const progressPercent = Math.min(100, (challenge.progress / challenge.target) * 100);
            const isCompleted = challenge.progress >= challenge.target;
            
            return `
                <div class="challenge-menu-item ${isCompleted ? 'completed' : ''}">
                    <div class="challenge-header">
                        <h3>${challenge.title}</h3>
                        <span class="challenge-reward">🎁 ${challenge.reward}</span>
                    </div>
                    <p>${challenge.description}</p>
                    <div class="challenge-progress">
                        <div class="challenge-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="challenge-stats">
                        <span>${challenge.progress}/${challenge.target}</span>
                        <span class="challenge-status">${isCompleted ? '✅ Klar!' : '⏳ Pågående'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadSettingsValues() {
        // Ladda nuvarande inställningar
        if (window.swedishAudio) {
            document.getElementById('soundToggleMenu').classList.toggle('active', window.swedishAudio.soundEnabled);
            document.getElementById('musicToggleMenu').classList.toggle('active', window.swedishAudio.musicEnabled);
            document.getElementById('volumeSlider').value = window.swedishAudio.masterVolume * 100;
        }
        
        // Ladda spelarnamn från localStorage
        const savedName = localStorage.getItem('swedishKing_playerName');
        if (savedName) {
            document.getElementById('playerNameSetting').value = savedName;
        }
    }

    shareGame(platform) {
        const shareText = "🇸🇪 Spela Kungen Hoppar Flaggor - Det roligaste svenska nationaldag-spelet! 👑";
        const gameUrl = window.location.href;

        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(gameUrl)}&hashtags=KungenHopparFlaggor,Sverige,Nationaldag`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}&quote=${encodeURIComponent(shareText)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + gameUrl)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    // Public methods för att visa specifika menyer
    showLeaderboard() {
        this.hideAllMenus();
        this.showGameContent();
        const highScoresSection = document.querySelector('.high-scores');
        if (highScoresSection) {
            highScoresSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initiera menu när sidan laddas
window.gameMenu = null;

document.addEventListener('DOMContentLoaded', () => {
    window.gameMenu = new SwedishGameMenu();
}); 