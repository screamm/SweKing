// Svenska Multiplayer & Social Features Manager
class SwedishMultiplayerManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.playerId = null;
        this.currentRoom = null;
        this.playerList = new Map();
        this.dailyChallenges = [];
        this.weeklyTournament = null;
        this.socialSharing = true;
        
        // Game state syncing
        this.syncInterval = null;
        this.lastSyncTime = 0;
        this.playerPositions = new Map();
        
        // Real-time racing
        this.isRacing = false;
        this.raceStartTime = null;
        this.raceOpponents = [];
        
        // Events
        this.eventCallbacks = new Map();
        
        this.initializePlayer();
    }

    initializePlayer() {
        // Generera eller hämta player ID
        this.playerId = localStorage.getItem('swedishKing_playerId') || this.generatePlayerId();
        localStorage.setItem('swedishKing_playerId', this.playerId);
        
        // Hämta användarnamn
        this.playerName = localStorage.getItem('swedishKing_playerName') || 'Okänd Spelare';
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // WebSocket connection
    async connect() {
        try {
            // I production skulle detta vara wss://kungen-hoppar-flaggor.davidrydgren.workers.dev/ws
            // För nu använder vi en mock WebSocket för demonstration
            this.socket = new WebSocket('wss://echo.websocket.org/');
            
            this.socket.onopen = () => {
                console.log('🔗 Ansluten till multiplayer-server!');
                this.connected = true;
                this.sendPlayerJoin();
                this.startHeartbeat();
                this.emit('connected');
            };

            this.socket.onmessage = (event) => {
                this.handleMessage(JSON.parse(event.data));
            };

            this.socket.onclose = () => {
                console.log('📡 Frånkopplad från multiplayer-server');
                this.connected = false;
                this.emit('disconnected');
                this.reconnect();
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket fel:', error);
                this.emit('error', error);
            };

        } catch (error) {
            console.error('❌ Kunde inte ansluta till multiplayer:', error);
        }
    }

    reconnect() {
        if (!this.connected) {
            setTimeout(() => {
                console.log('🔄 Försöker återansluta...');
                this.connect();
            }, 3000);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.stopSync();
    }

    // Message handling
    handleMessage(data) {
        switch (data.type) {
            case 'player_joined':
                this.handlePlayerJoined(data);
                break;
            case 'player_left':
                this.handlePlayerLeft(data);
                break;
            case 'game_state_update':
                this.handleGameStateUpdate(data);
                break;
            case 'race_invitation':
                this.handleRaceInvitation(data);
                break;
            case 'race_start':
                this.handleRaceStart(data);
                break;
            case 'daily_challenges':
                this.handleDailyChallenges(data);
                break;
            case 'leaderboard_update':
                this.handleLeaderboardUpdate(data);
                break;
            case 'tournament_info':
                this.handleTournamentInfo(data);
                break;
        }
    }

    // Send messages
    send(data) {
        if (this.connected && this.socket) {
            this.socket.send(JSON.stringify({
                ...data,
                playerId: this.playerId,
                playerName: this.playerName,
                timestamp: Date.now()
            }));
        }
    }

    sendPlayerJoin() {
        this.send({
            type: 'player_join',
            playerData: {
                name: this.playerName,
                avatar: '👑',
                level: this.getPlayerLevel(),
                country: 'Sverige'
            }
        });
    }

    // Real-time racing
    inviteToRace(friendId) {
        this.send({
            type: 'race_invite',
            targetPlayer: friendId,
            gameMode: 'speed_race',
            duration: 60000 // 1 minut
        });
    }

    acceptRaceInvitation(invitationId) {
        this.send({
            type: 'race_accept',
            invitationId: invitationId
        });
    }

    startRealTimeRace() {
        this.isRacing = true;
        this.raceStartTime = Date.now();
        this.startGameStateSync();
        
        this.emit('race_started', {
            opponents: this.raceOpponents,
            startTime: this.raceStartTime
        });
    }

    updateRaceProgress(score, position) {
        if (this.isRacing) {
            this.send({
                type: 'race_progress',
                score: score,
                position: position,
                timestamp: Date.now() - this.raceStartTime
            });
        }
    }

    endRace(finalScore) {
        this.isRacing = false;
        this.stopSync();
        
        this.send({
            type: 'race_finish',
            finalScore: finalScore,
            completionTime: Date.now() - this.raceStartTime
        });
    }

    // Game state syncing
    startGameStateSync() {
        this.syncInterval = setInterval(() => {
            if (this.isRacing && window.gameRunning) {
                this.syncGameState();
            }
        }, 100); // Sync varje 100ms för smooth multiplayer
    }

    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    syncGameState() {
        if (window.king && window.score !== undefined) {
            this.send({
                type: 'game_state',
                gameData: {
                    kingPosition: { x: window.king.x, y: window.king.y },
                    score: window.score,
                    gameSpeed: window.gameSpeed,
                    isJumping: window.king.jumping
                }
            });
        }
    }

    // Daily Challenges
    async loadDailyChallenges() {
        try {
            const response = await fetch('/api/challenges/daily');
            if (response.ok) {
                this.dailyChallenges = await response.json();
                this.emit('daily_challenges_loaded', this.dailyChallenges);
                return this.dailyChallenges;
            }
        } catch (error) {
            console.log('Kunde inte ladda daily challenges:', error);
        }
        
        // Fallback lokala challenges
        this.dailyChallenges = this.generateLocalDailyChallenges();
        return this.dailyChallenges;
    }

    generateLocalDailyChallenges() {
        const today = new Date().toDateString();
        const challenges = [
            {
                id: 'daily_collector',
                title: '💰 Kronsamlare',
                description: 'Samla 50 kronor idag',
                target: 50,
                progress: this.getChallengeProgress('daily_collector', today),
                reward: 'Guld-krona avatar',
                expires: this.getTomorrowMidnight()
            },
            {
                id: 'daily_jumper',
                title: '🦘 Hoppmästare',
                description: 'Hoppa 100 gånger idag',
                target: 100,
                progress: this.getChallengeProgress('daily_jumper', today),
                reward: 'Blå kung-dräkt',
                expires: this.getTomorrowMidnight()
            },
            {
                id: 'daily_survivor',
                title: '🛡️ Överlevare',
                description: 'Överlev i 2 minuter utan att dö',
                target: 120000, // millisekunder
                progress: this.getChallengeProgress('daily_survivor', today),
                reward: 'Vikingahjälm',
                expires: this.getTomorrowMidnight()
            }
        ];
        
        return challenges;
    }

    updateChallengeProgress(challengeId, progress) {
        const today = new Date().toDateString();
        const key = `challenge_${challengeId}_${today}`;
        localStorage.setItem(key, progress.toString());
        
        // Skicka till server
        this.send({
            type: 'challenge_progress',
            challengeId: challengeId,
            progress: progress
        });
    }

    getChallengeProgress(challengeId, date) {
        const key = `challenge_${challengeId}_${date}`;
        return parseInt(localStorage.getItem(key) || '0');
    }

    getTomorrowMidnight() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime();
    }

    // Weekly Tournament
    async loadWeeklyTournament() {
        try {
            const response = await fetch('/api/tournament/weekly');
            if (response.ok) {
                this.weeklyTournament = await response.json();
                this.emit('weekly_tournament_loaded', this.weeklyTournament);
                return this.weeklyTournament;
            }
        } catch (error) {
            console.log('Kunde inte ladda weekly tournament:', error);
        }

        // Fallback lokal tournament
        this.weeklyTournament = this.generateLocalWeeklyTournament();
        return this.weeklyTournament;
    }

    generateLocalWeeklyTournament() {
        const nextMonday = new Date();
        nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
        nextMonday.setHours(0, 0, 0, 0);

        return {
            id: 'weekly_king_championship',
            title: '👑 Veckans Kung-mästerskap',
            description: 'Tävla om att bli Sveriges bästa kung-hoppare!',
            prize: '1000 guldkronor + Diamant-krona',
            participants: 1337,
            endTime: nextMonday.getTime(),
            leaderboard: [
                { name: 'Kung Carl XVI Gustaf', score: 850, crown: '👑' },
                { name: 'Kronprinsessan Victoria', score: 720, crown: '👸' },
                { name: 'Prins Daniel', score: 650, crown: '🤴' },
                { name: this.playerName, score: window.score || 0, crown: '🏃‍♂️' }
            ]
        };
    }

    // Social Sharing
    async shareScore(score, platform = 'twitter') {
        const shareText = this.generateShareText(score);
        const gameUrl = window.location.href;

        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(gameUrl)}&hashtags=KungenHopparFlaggor,Sverige,Nationaldag`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}&quote=${encodeURIComponent(shareText)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(gameUrl)}&summary=${encodeURIComponent(shareText)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + gameUrl)}`
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            
            // Tracking
            this.send({
                type: 'social_share',
                platform: platform,
                score: score
            });
        }

        // Web Share API för mobiler
        if (navigator.share && platform === 'native') {
            try {
                await navigator.share({
                    title: 'Kungen Hoppar Flaggor 🇸🇪',
                    text: shareText,
                    url: gameUrl
                });
            } catch (error) {
                console.log('Native sharing avbrutet:', error);
            }
        }
    }

    generateShareText(score) {
        const messages = [
            `🇸🇪 Jag hjälpte svenska kungen hoppa över ${Math.floor(score/10)} flaggor och samlade ${score} kronor! 👑`,
            `👑 ${score} kronor samlades för svenska kronan! Kan du slå mitt rekord? 🇸🇪`,
            `🦘 Hoppade som en kung och fick ${score} poäng! Sverige för evigt! 🇸🇪`,
            `🏆 Nya rekord: ${score} kronor för kung och fosterland! 👑🇸🇪`
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Event system
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);
    }

    emit(event, data = null) {
        if (this.eventCallbacks.has(event)) {
            this.eventCallbacks.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
    }

    // Message handlers
    handlePlayerJoined(data) {
        this.playerList.set(data.playerId, data.playerData);
        this.emit('player_joined', data);
    }

    handlePlayerLeft(data) {
        this.playerList.delete(data.playerId);
        this.emit('player_left', data);
    }

    handleGameStateUpdate(data) {
        this.playerPositions.set(data.playerId, data.gameData);
        this.emit('game_state_updated', data);
    }

    handleRaceInvitation(data) {
        this.emit('race_invitation', data);
    }

    handleRaceStart(data) {
        this.raceOpponents = data.opponents;
        this.startRealTimeRace();
    }

    handleDailyChallenges(data) {
        this.dailyChallenges = data.challenges;
        this.emit('daily_challenges_updated', data);
    }

    handleLeaderboardUpdate(data) {
        this.emit('leaderboard_updated', data);
    }

    handleTournamentInfo(data) {
        this.weeklyTournament = data.tournament;
        this.emit('tournament_updated', data);
    }

    // Utility methods
    getPlayerLevel() {
        const totalScore = parseInt(localStorage.getItem('swedishKing_totalScore') || '0');
        return Math.floor(totalScore / 1000) + 1;
    }

    startHeartbeat() {
        setInterval(() => {
            if (this.connected) {
                this.send({ type: 'heartbeat' });
            }
        }, 30000); // Heartbeat varje 30 sekunder
    }

    // Public API methods
    getConnectedPlayers() {
        return Array.from(this.playerList.values());
    }

    getCurrentRaceData() {
        return {
            isRacing: this.isRacing,
            opponents: this.raceOpponents,
            playerPositions: Array.from(this.playerPositions.entries())
        };
    }

    setPlayerName(name) {
        this.playerName = name;
        localStorage.setItem('swedishKing_playerName', name);
        
        if (this.connected) {
            this.send({
                type: 'player_update',
                playerData: { name: name }
            });
        }
    }
}

// Global multiplayer manager
window.swedishMultiplayer = new SwedishMultiplayerManager(); 