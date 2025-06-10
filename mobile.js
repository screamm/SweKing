// Svenska Kung Spel - Mobile Experience & Responsiv Design
class SwedishMobileManager {
    constructor() {
        this.touchControls = {
            enabled: false,
            lastTouch: null,
            swipeThreshold: 50,
            tapThreshold: 200
        };
        
        this.deviceInfo = {
            isMobile: this.detectMobile(),
            isTablet: this.detectTablet(),
            orientation: this.getOrientation(),
            pixelRatio: window.devicePixelRatio || 1,
            platform: this.detectPlatform()
        };
        
        this.responsiveSettings = {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200
            },
            scaleFactor: 1,
            uiScale: 1
        };
        
        this.performance = {
            targetFPS: this.deviceInfo.isMobile ? 30 : 60,
            qualityLevel: this.deviceInfo.isMobile ? 'medium' : 'high',
            particleCount: this.deviceInfo.isMobile ? 50 : 200
        };
        
        this.vibrationPatterns = {
            jump: [10],
            powerup: [50, 50, 50],
            collision: [100],
            victory: [200, 100, 200, 100, 200],
            gameOver: [500]
        };
        
        this.init();
    }

    // Initiera mobile manager
    init() {
        this.setupTouchControls();
        this.setupResponsiveDesign();
        this.setupPerformanceOptimizations();
        this.setupOrientationHandling();
        this.setupPWAFeatures();
        this.createMobileUI();
    }

    // Detektera mobil enhet
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Detektera tablet
    detectTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.screen.width >= 768;
    }

    // Få skärmorientering
    getOrientation() {
        if (screen.orientation) {
            return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
        }
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    // Detektera plattform
    detectPlatform() {
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return 'ios';
        if (/Android/i.test(navigator.userAgent)) return 'android';
        if (/Windows Phone/i.test(navigator.userAgent)) return 'windows';
        return 'unknown';
    }

    // Sätt upp touch-kontroller
    setupTouchControls() {
        if (!this.deviceInfo.isMobile) return;

        // Touch event listeners
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Förhindra default touch beteenden
        document.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        
        this.touchControls.enabled = true;
    }

    // Hantera touch start
    handleTouchStart(e) {
        if (e.touches.length === 0) return;
        
        const touch = e.touches[0];
        this.touchControls.lastTouch = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
            startX: touch.clientX,
            startY: touch.clientY
        };
        
        // Vibrera för feedback
        this.vibrate('jump');
    }

    // Hantera touch move
    handleTouchMove(e) {
        if (!this.touchControls.lastTouch || e.touches.length === 0) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchControls.lastTouch.startX;
        const deltaY = touch.clientY - this.touchControls.lastTouch.startY;
        
        // Hantera swipe gestures
        if (Math.abs(deltaX) > this.touchControls.swipeThreshold) {
            if (deltaX > 0) {
                this.triggerSwipeRight();
            } else {
                this.triggerSwipeLeft();
            }
        }
        
        if (Math.abs(deltaY) > this.touchControls.swipeThreshold) {
            if (deltaY < 0) {
                this.triggerSwipeUp();
            } else {
                this.triggerSwipeDown();
            }
        }
    }

    // Hantera touch end
    handleTouchEnd(e) {
        if (!this.touchControls.lastTouch) return;
        
        const touchDuration = Date.now() - this.touchControls.lastTouch.time;
        
        // Hantera tap vs swipe
        if (touchDuration < this.touchControls.tapThreshold) {
            const touch = e.changedTouches[0];
            this.triggerTap(touch.clientX, touch.clientY);
        }
        
        this.touchControls.lastTouch = null;
    }

    // Trigger olika touch events
    triggerTap(x, y) {
        // Simulera hopp för tapp på övre halvan
        if (y < window.innerHeight / 2) {
            if (window.game) {
                window.game.jump();
            }
            this.vibrate('jump');
        }
        
        // Trigger UI actions för nedre halvan
        this.handleUITap(x, y);
    }

    triggerSwipeUp() {
        if (window.game) {
            window.game.jump();
        }
        this.vibrate('jump');
    }

    triggerSwipeDown() {
        // Snabb nedåt-rörelse
        if (window.game && window.game.player) {
            window.game.player.velocityY += 5;
        }
    }

    triggerSwipeLeft() {
        // Rörelse åt vänster (om tillgängligt)
        if (window.game && window.game.player) {
            window.game.player.x = Math.max(0, window.game.player.x - 30);
        }
    }

    triggerSwipeRight() {
        // Rörelse åt höger (om tillgängligt)
        if (window.game && window.game.player) {
            window.game.player.x = Math.min(window.game.canvas.width - 40, window.game.player.x + 30);
        }
    }

    // Hantera UI taps
    handleUITap(x, y) {
        const elements = document.elementsFromPoint(x, y);
        elements.forEach(element => {
            if (element.classList.contains('mobile-button')) {
                element.click();
            }
        });
    }

    // Vibrations-stöd
    vibrate(pattern) {
        if (!navigator.vibrate || !this.vibrationPatterns[pattern]) return;
        
        try {
            navigator.vibrate(this.vibrationPatterns[pattern]);
        } catch (error) {
            console.log('Vibration not supported:', error);
        }
    }

    // Sätt upp responsiv design
    setupResponsiveDesign() {
        this.updateResponsiveSettings();
        window.addEventListener('resize', () => this.updateResponsiveSettings());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.updateResponsiveSettings(), 500);
        });
    }

    // Uppdatera responsiva inställningar
    updateResponsiveSettings() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Bestäm device type
        if (width <= this.responsiveSettings.breakpoints.mobile) {
            this.responsiveSettings.deviceType = 'mobile';
            this.responsiveSettings.scaleFactor = Math.min(width / 400, height / 600);
            this.responsiveSettings.uiScale = 1.2;
        } else if (width <= this.responsiveSettings.breakpoints.tablet) {
            this.responsiveSettings.deviceType = 'tablet';
            this.responsiveSettings.scaleFactor = Math.min(width / 800, height / 600);
            this.responsiveSettings.uiScale = 1.1;
        } else {
            this.responsiveSettings.deviceType = 'desktop';
            this.responsiveSettings.scaleFactor = 1;
            this.responsiveSettings.uiScale = 1;
        }
        
        // Uppdatera orientation
        this.deviceInfo.orientation = this.getOrientation();
        
        // Anpassa spelelement
        this.adjustGameElements();
        this.adjustUI();
    }

    // Anpassa spelelement
    adjustGameElements() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const container = canvas.parentElement;
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;
        
        // Anpassa canvas storlek
        if (this.deviceInfo.isMobile) {
            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (maxHeight * 0.7) + 'px';
            
            // Uppdatera canvas resolution för skärpteopta
            canvas.width = maxWidth * this.deviceInfo.pixelRatio;
            canvas.height = (maxHeight * 0.7) * this.deviceInfo.pixelRatio;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(this.deviceInfo.pixelRatio, this.deviceInfo.pixelRatio);
        }
        
        // Anpassa spelelement-storlekar
        if (window.game) {
            window.game.mobileScaleFactor = this.responsiveSettings.scaleFactor;
        }
    }

    // Anpassa UI
    adjustUI() {
        const root = document.documentElement;
        
        // CSS-variabler för responsivitet
        root.style.setProperty('--mobile-scale', this.responsiveSettings.uiScale);
        root.style.setProperty('--scale-factor', this.responsiveSettings.scaleFactor);
        root.style.setProperty('--device-type', this.responsiveSettings.deviceType);
        
        // Lägg till device-specific klasser
        document.body.classList.remove('mobile', 'tablet', 'desktop', 'portrait', 'landscape');
        document.body.classList.add(
            this.responsiveSettings.deviceType,
            this.deviceInfo.orientation
        );
        
        if (this.deviceInfo.isMobile) {
            document.body.classList.add('touch-device');
        }
    }

    // Prestanda-optimeringar
    setupPerformanceOptimizations() {
        if (!this.deviceInfo.isMobile) return;
        
        // Reducera animationer på svaga enheter
        if (this.performance.qualityLevel === 'low') {
            document.body.classList.add('reduce-motion');
        }
        
        // Anpassa refresh rate
        if (window.game) {
            window.game.targetFPS = this.performance.targetFPS;
        }
        
        // Memory management
        this.setupMemoryManagement();
    }

    // Memory management för mobila enheter
    setupMemoryManagement() {
        let memoryWarnings = 0;
        
        // Övervaka memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMemory = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
                
                if (usedMemory > 0.9) {
                    memoryWarnings++;
                    if (memoryWarnings > 3) {
                        this.reduceQuality();
                    }
                }
            }, 10000);
        }
        
        // Force garbage collection vid pause
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.cleanupResources();
            }
        });
    }

    // Reducera kvalitet vid low memory
    reduceQuality() {
        this.performance.qualityLevel = 'low';
        this.performance.particleCount = 20;
        
        if (window.swedishEffects) {
            window.swedishEffects.particleCount = 20;
        }
        
        console.log('Reducerad kvalitet för bättre prestanda');
    }

    // Rensa resurser
    cleanupResources() {
        if (window.swedishEffects) {
            window.swedishEffects.clearParticles();
        }
        
        // Force garbage collection om möjligt
        if (window.gc) {
            window.gc();
        }
    }

    // Orientations-hantering
    setupOrientationHandling() {
        // Lyssna på orientation changes
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        // Rekommenda landscape för bättre spelupplevelse
        if (this.deviceInfo.isMobile) {
            this.showOrientationHint();
        }
    }

    // Hantera orientation change
    handleOrientationChange() {
        setTimeout(() => {
            this.deviceInfo.orientation = this.getOrientation();
            this.updateResponsiveSettings();
            
            // Visa meddelande om portrait på mobil
            if (this.deviceInfo.isMobile && this.deviceInfo.orientation === 'portrait') {
                this.showOrientationHint();
            } else {
                this.hideOrientationHint();
            }
        }, 500);
    }

    // Visa orientations-tips
    showOrientationHint() {
        let hint = document.getElementById('orientationHint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'orientationHint';
            hint.innerHTML = `
                <div class="orientation-hint-content">
                    <div class="rotate-icon">📱 ↻</div>
                    <p>Rotera enheten för bästa spelupplevelse!</p>
                </div>
            `;
            hint.className = 'orientation-hint';
            document.body.appendChild(hint);
        }
        hint.style.display = 'flex';
    }

    // Dölj orientations-tips
    hideOrientationHint() {
        const hint = document.getElementById('orientationHint');
        if (hint) {
            hint.style.display = 'none';
        }
    }

    // PWA funktioner
    setupPWAFeatures() {
        // Service Worker registrering
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Add to homescreen prompt
        this.setupInstallPrompt();
        
        // App shortcuts
        this.setupAppShortcuts();
    }

    // Service Worker
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registrerad:', registration);
        } catch (error) {
            console.log('Service Worker misslyckades:', error);
        }
    }

    // Install prompt
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });
    }

    // Visa install knapp
    showInstallButton(deferredPrompt) {
        const installButton = document.createElement('button');
        installButton.className = 'install-button mobile-button';
        installButton.innerHTML = '📱 Installera App';
        installButton.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    console.log('App installerad');
                }
                deferredPrompt = null;
                installButton.style.display = 'none';
            }
        };
        
        // Lägg till i menyn
        const menu = document.querySelector('.menu-panel');
        if (menu) {
            menu.appendChild(installButton);
        }
    }

    // App shortcuts
    setupAppShortcuts() {
        // För PWA manifest shortcuts
        const shortcuts = [
            {
                name: 'Spela Solo',
                url: '/?mode=solo',
                icon: '/icons/icon-solo.png'
            },
            {
                name: 'Multiplayer',
                url: '/?mode=multi',
                icon: '/icons/icon-multi.png'
            },
            {
                name: 'Leaderboard',
                url: '/?view=leaderboard',
                icon: '/icons/icon-leaderboard.png'
            }
        ];
        
        // App shortcuts är konfigurerade
        console.log('📱 App shortcuts konfigurerade:', shortcuts.length);
    }

    // Skapa mobile UI
    createMobileUI() {
        if (!this.deviceInfo.isMobile) return;
        
        // Virtual joystick
        this.createVirtualJoystick();
        
        // Action buttons
        this.createActionButtons();
        
        // Mobile HUD
        this.createMobileHUD();
    }

    // Virtual joystick (för framtida sidoscrollning)
    createVirtualJoystick() {
        const joystick = document.createElement('div');
        joystick.className = 'virtual-joystick';
        joystick.innerHTML = `
            <div class="joystick-base">
                <div class="joystick-stick"></div>
            </div>
        `;
        
        document.body.appendChild(joystick);
        
        // Touch handling för joystick
        this.setupJoystickControls(joystick);
    }

    // Action buttons
    createActionButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'mobile-action-buttons';
        
        const jumpButton = document.createElement('button');
        jumpButton.className = 'mobile-button jump-button';
        jumpButton.innerHTML = '🔥 HOPPA';
        jumpButton.ontouchstart = (e) => {
            e.preventDefault();
            if (window.game) {
                window.game.jump();
            }
            this.vibrate('jump');
        };
        
        const pauseButton = document.createElement('button');
        pauseButton.className = 'mobile-button pause-button';
        pauseButton.innerHTML = '⏸️';
        pauseButton.onclick = () => {
            if (window.game) {
                window.game.togglePause();
            }
        };
        
        buttonContainer.appendChild(jumpButton);
        buttonContainer.appendChild(pauseButton);
        document.body.appendChild(buttonContainer);
    }

    // Mobile HUD
    createMobileHUD() {
        const hud = document.createElement('div');
        hud.className = 'mobile-hud';
        hud.innerHTML = `
            <div class="mobile-score">Score: <span id="mobileScore">0</span></div>
            <div class="mobile-level">Level: <span id="mobileLevel">1</span></div>
            <div class="mobile-powerups" id="mobilePowerups"></div>
        `;
        
        document.body.appendChild(hud);
    }

    // Setup joystick controls
    setupJoystickControls(joystick) {
        const stick = joystick.querySelector('.joystick-stick');
        const base = joystick.querySelector('.joystick-base');
        
        let isDragging = false;
        let startPos = { x: 0, y: 0 };
        
        stick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            const touch = e.touches[0];
            const rect = base.getBoundingClientRect();
            startPos.x = rect.left + rect.width / 2;
            startPos.y = rect.top + rect.height / 2;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - startPos.x;
            const deltaY = touch.clientY - startPos.y;
            const distance = Math.min(30, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
            const angle = Math.atan2(deltaY, deltaX);
            
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            stick.style.transform = `translate(${x}px, ${y}px)`;
            
            // Trigger movement based on joystick position
            this.handleJoystickInput(x / 30, y / 30);
        });
        
        document.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            stick.style.transform = 'translate(0, 0)';
            this.handleJoystickInput(0, 0);
        });
    }

    // Hantera joystick input
    handleJoystickInput(x, y) {
        if (window.game && window.game.player) {
            // Horizontal movement
            if (Math.abs(x) > 0.3) {
                window.game.player.x += x * 3;
                window.game.player.x = Math.max(0, Math.min(window.game.canvas.width - 40, window.game.player.x));
            }
            
            // Vertical movement (jump on upward gesture)
            if (y < -0.5) {
                window.game.jump();
            }
        }
    }

    // Uppdatera mobile HUD
    updateMobileHUD(gameData) {
        if (!this.deviceInfo.isMobile) return;
        
        const scoreElement = document.getElementById('mobileScore');
        const levelElement = document.getElementById('mobileLevel');
        const powerupsElement = document.getElementById('mobilePowerups');
        
        if (scoreElement) scoreElement.textContent = gameData.score || 0;
        if (levelElement) levelElement.textContent = gameData.level || 1;
        
        if (powerupsElement && gameData.powerups) {
            powerupsElement.innerHTML = gameData.powerups.map(p => `<span class="powerup-icon">${p.icon}</span>`).join('');
        }
    }

    // Haptic feedback för olika events
    hapticFeedback(type, intensity = 1) {
        if (!navigator.vibrate) return;
        
        const patterns = {
            light: [10 * intensity],
            medium: [25 * intensity],
            heavy: [50 * intensity],
            success: [50, 50, 100],
            error: [100, 50, 100],
            warning: [75]
        };
        
        const pattern = patterns[type] || patterns.light;
        navigator.vibrate(pattern);
    }

    // Få nuvarande device info
    getDeviceInfo() {
        return {
            ...this.deviceInfo,
            ...this.responsiveSettings,
            touchEnabled: this.touchControls.enabled,
            performance: this.performance
        };
    }
}

// CSS för mobile UI
const mobileCSS = `
/* Mobile-specific styles */
@media (max-width: 768px) {
    .virtual-joystick {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
    }
    
    .joystick-base {
        width: 80px;
        height: 80px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.2);
        position: relative;
    }
    
    .joystick-stick {
        width: 30px;
        height: 30px;
        background: #fecc00;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 2px solid #006aa7;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
    
    .mobile-action-buttons {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        z-index: 1000;
    }
    
    .mobile-button {
        background: linear-gradient(45deg, #006aa7, #fecc00);
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        min-width: 80px;
        text-align: center;
    }
    
    .mobile-button:active {
        transform: scale(0.95);
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
    }
    
    .jump-button {
        font-size: 18px;
        padding: 20px 25px;
        background: linear-gradient(45deg, #FF6B35, #F7931E);
    }
    
    .mobile-hud {
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px;
        border-radius: 15px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 999;
        font-size: 16px;
        font-weight: bold;
    }
    
    .mobile-powerups {
        display: flex;
        gap: 10px;
    }
    
    .powerup-icon {
        font-size: 20px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }
    
    .orientation-hint {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
        color: white;
        text-align: center;
    }
    
    .orientation-hint-content {
        padding: 40px;
        border-radius: 20px;
        background: linear-gradient(45deg, #006aa7, #fecc00);
    }
    
    .rotate-icon {
        font-size: 60px;
        margin-bottom: 20px;
        animation: rotateAnimation 2s infinite;
    }
    
    @keyframes rotateAnimation {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(90deg); }
        50% { transform: rotate(90deg); }
        75% { transform: rotate(0deg); }
        100% { transform: rotate(0deg); }
    }
}

/* Touch device optimizations */
.touch-device {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.touch-device button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

/* Landscape optimizations */
@media (orientation: landscape) and (max-height: 500px) {
    .mobile-hud {
        top: 10px;
        padding: 10px;
        font-size: 14px;
    }
    
    .mobile-action-buttons {
        bottom: 10px;
        right: 10px;
    }
    
    .virtual-joystick {
        bottom: 10px;
        left: 10px;
    }
    
    .joystick-base {
        width: 60px;
        height: 60px;
    }
    
    .joystick-stick {
        width: 20px;
        height: 20px;
    }
}

/* Reduce motion for performance */
.reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2) {
    .mobile-button {
        border: 0.5px solid rgba(255,255,255,0.3);
    }
}

/* Tablet optimizations */
@media (min-width: 768px) and (max-width: 1024px) {
    .mobile-action-buttons {
        bottom: 40px;
        right: 40px;
    }
    
    .virtual-joystick {
        bottom: 40px;
        left: 40px;
    }
    
    .mobile-button {
        padding: 20px 30px;
        font-size: 18px;
    }
}
`;

// Lägg till CSS
const mobileStyleSheet = document.createElement('style');
mobileStyleSheet.textContent = mobileCSS;
document.head.appendChild(mobileStyleSheet);

// Global mobile manager
window.swedishMobile = new SwedishMobileManager(); 