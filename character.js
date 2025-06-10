// Svenska Kung Spel - Karaktäranpassning & Unlockables
class SwedishCharacterManager {
    constructor() {
        this.unlockedItems = this.loadUnlockedItems();
        this.currentOutfit = this.loadCurrentOutfit();
        this.experience = parseInt(localStorage.getItem('swedishKing_experience') || '0');
        this.level = Math.floor(this.experience / 1000) + 1;
        
        this.outfits = {
            klassisk: {
                name: 'Klassisk Kung',
                crown: '👑',
                robe: '#FFD700',
                pants: '#006aa7',
                unlockLevel: 1,
                unlockCost: 0,
                description: 'Den traditionella svenska kungen'
            },
            midsommar: {
                name: 'Midsommar-kung',
                crown: '🌺',
                robe: '#32CD32',
                pants: '#FFFF00',
                unlockLevel: 5,
                unlockCost: 500,
                description: 'Firar midsommar med blommor och glädje'
            },
            vinter: {
                name: 'Vinter-kung',
                crown: '❄️',
                robe: '#FFFFFF',
                pants: '#4169E1',
                unlockLevel: 10,
                unlockCost: 1000,
                description: 'Klädd för svenska vintrar'
            },
            lucia: {
                name: 'Lucia-kung',
                crown: '🕯️',
                robe: '#FFFFFF',
                pants: '#8B0000',
                unlockLevel: 8,
                unlockCost: 800,
                description: 'Lyser upp mörka december-dagar'
            },
            nationaldag: {
                name: 'Nationaldag-kung',
                crown: '🇸🇪',
                robe: '#006aa7',
                pants: '#FECC00',
                unlockLevel: 3,
                unlockCost: 300,
                description: 'Sveriges färger med stolthet'
            },
            riddar: {
                name: 'Riddar-kung',
                crown: '⚔️',
                robe: '#C0C0C0',
                pants: '#2F4F4F',
                unlockLevel: 15,
                unlockCost: 2000,
                description: 'Medeltida riddare med svärd och sköld'
            },
            viking: {
                name: 'Viking-kung',
                crown: '🪓',
                robe: '#8B4513',
                pants: '#654321',
                unlockLevel: 20,
                unlockCost: 3000,
                description: 'Forntida svensk krigare'
            },
            nobel: {
                name: 'Nobel-kung',
                crown: '🏆',
                robe: '#9932CC',
                pants: '#000000',
                unlockLevel: 25,
                unlockCost: 5000,
                description: 'Prisutdelare av Nobelpriset'
            }
        };
        
        this.crowns = {
            guld: {
                name: 'Guldkrona',
                icon: '👑',
                color: '#FFD700',
                unlockLevel: 1,
                unlockCost: 0,
                effect: 'none'
            },
            diamant: {
                name: 'Diamantkrona',
                icon: '💎',
                color: '#B9F2FF',
                unlockLevel: 12,
                unlockCost: 1500,
                effect: 'extra_points'
            },
            ruby: {
                name: 'Rubinkrona',
                icon: '🔴',
                color: '#DC143C',
                unlockLevel: 18,
                unlockCost: 2500,
                effect: 'speed_boost'
            },
            emerald: {
                name: 'Smaragdkrona',
                icon: '🟢',
                color: '#50C878',
                unlockLevel: 22,
                unlockCost: 4000,
                effect: 'double_jump'
            },
            regnbåge: {
                name: 'Regnbågskrona',
                icon: '🌈',
                color: '#FF69B4',
                unlockLevel: 30,
                unlockCost: 8000,
                effect: 'all_powers'
            }
        };
        
        this.companions = {
            ingen: {
                name: 'Ingen följeslagare',
                icon: '',
                unlockLevel: 1,
                unlockCost: 0,
                effect: 'none'
            },
            älg: {
                name: 'Svensk Älg',
                icon: '🦌',
                unlockLevel: 7,
                unlockCost: 600,
                effect: 'extra_speed'
            },
            enhörning: {
                name: 'Mystisk Enhörning',
                icon: '🦄',
                unlockLevel: 16,
                unlockCost: 2200,
                effect: 'magic_trail'
            },
            drake: {
                name: 'Nordisk Drake',
                icon: '🐉',
                unlockLevel: 28,
                unlockCost: 6000,
                effect: 'fire_breath'
            }
        };
        
        this.accessories = {
            inga: {
                name: 'Inga accessoarer',
                items: [],
                unlockLevel: 1,
                unlockCost: 0
            },
            svärd: {
                name: 'Kungligt Svärd',
                items: ['⚔️'],
                unlockLevel: 14,
                unlockCost: 1800,
                effect: 'slash_attack'
            },
            sköld: {
                name: 'Kunglig Sköld',
                items: ['🛡️'],
                unlockLevel: 11,
                unlockCost: 1200,
                effect: 'extra_protection'
            },
            mantel: {
                name: 'Kunglig Mantel',
                items: ['🦸'],
                unlockLevel: 19,
                unlockCost: 3500,
                effect: 'wind_resistance'
            }
        };
    }

    // Ladda upplåsta föremål
    loadUnlockedItems() {
        const saved = localStorage.getItem('swedishKing_unlockedItems');
        return saved ? JSON.parse(saved) : {
            outfits: ['klassisk'],
            crowns: ['guld'],
            companions: ['ingen'],
            accessories: ['inga']
        };
    }

    // Ladda nuvarande outfit
    loadCurrentOutfit() {
        const saved = localStorage.getItem('swedishKing_currentOutfit');
        return saved ? JSON.parse(saved) : {
            outfit: 'klassisk',
            crown: 'guld',
            companion: 'ingen',
            accessory: 'inga'
        };
    }

    // Spara upplåsta föremål
    saveUnlockedItems() {
        localStorage.setItem('swedishKing_unlockedItems', JSON.stringify(this.unlockedItems));
    }

    // Spara nuvarande outfit
    saveCurrentOutfit() {
        localStorage.setItem('swedishKing_currentOutfit', JSON.stringify(this.currentOutfit));
    }

    // Lägg till experience
    addExperience(points) {
        this.experience += points;
        const newLevel = Math.floor(this.experience / 1000) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.checkForNewUnlocks();
            this.showLevelUpMessage();
        }
        
        localStorage.setItem('swedishKing_experience', this.experience.toString());
    }

    // Kontrollera nya upplåsningar
    checkForNewUnlocks() {
        let newUnlocks = [];
        
        // Kontrollera outfits
        Object.keys(this.outfits).forEach(key => {
            const outfit = this.outfits[key];
            if (this.level >= outfit.unlockLevel && !this.unlockedItems.outfits.includes(key)) {
                this.unlockedItems.outfits.push(key);
                newUnlocks.push(`Outfit: ${outfit.name}`);
            }
        });
        
        // Kontrollera kronor
        Object.keys(this.crowns).forEach(key => {
            const crown = this.crowns[key];
            if (this.level >= crown.unlockLevel && !this.unlockedItems.crowns.includes(key)) {
                this.unlockedItems.crowns.push(key);
                newUnlocks.push(`Krona: ${crown.name}`);
            }
        });
        
        // Kontrollera följeslagare
        Object.keys(this.companions).forEach(key => {
            const companion = this.companions[key];
            if (this.level >= companion.unlockLevel && !this.unlockedItems.companions.includes(key)) {
                this.unlockedItems.companions.push(key);
                newUnlocks.push(`Följeslagare: ${companion.name}`);
            }
        });
        
        // Kontrollera accessoarer
        Object.keys(this.accessories).forEach(key => {
            const accessory = this.accessories[key];
            if (this.level >= accessory.unlockLevel && !this.unlockedItems.accessories.includes(key)) {
                this.unlockedItems.accessories.push(key);
                newUnlocks.push(`Accessoar: ${accessory.name}`);
            }
        });
        
        if (newUnlocks.length > 0) {
            this.saveUnlockedItems();
            this.showUnlockMessage(newUnlocks);
        }
    }

    // Visa level up meddelande
    showLevelUpMessage() {
        const message = document.createElement('div');
        message.className = 'level-up-message';
        message.innerHTML = `
            <div class="level-up-content">
                <h2>🎉 LEVEL UP! 🎉</h2>
                <p>Du är nu Level ${this.level} Kung!</p>
                <div class="level-crown">👑</div>
            </div>
        `;
        message.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            animation: levelUpFade 3s ease-out forwards;
        `;
        
        const content = message.querySelector('.level-up-content');
        content.style.cssText = `
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #000;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: levelUpBounce 3s ease-out forwards;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }

    // Visa unlock-meddelande
    showUnlockMessage(unlocks) {
        const message = document.createElement('div');
        message.className = 'unlock-message';
        message.innerHTML = `
            <div class="unlock-content">
                <h3>🔓 NYA UPPLÅSNINGAR!</h3>
                ${unlocks.map(unlock => `<p>• ${unlock}</p>`).join('')}
            </div>
        `;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #32CD32, #228B22);
            color: white;
            padding: 20px;
            border-radius: 15px;
            z-index: 1500;
            animation: unlockSlide 4s ease-out forwards;
            max-width: 300px;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 4000);
    }

    // Rita karaktär med nuvarande outfit
    drawCharacter(ctx, x, y, width, height, jumping = false) {
        const outfit = this.outfits[this.currentOutfit.outfit];
        const crown = this.crowns[this.currentOutfit.crown];
        const companion = this.companions[this.currentOutfit.companion];
        const accessory = this.accessories[this.currentOutfit.accessory];
        
        ctx.save();
        
        // Rita följeslagare först (bakom karaktären)
        if (companion.icon) {
            this.drawCompanion(ctx, x, y, companion, jumping);
        }
        
        // Rita kung kropp
        ctx.fillStyle = outfit.robe;
        ctx.fillRect(x, y, width, height);
        
        // Rita kung byxor
        ctx.fillStyle = outfit.pants;
        ctx.fillRect(x, y + height - 20, width, 20);
        
        // Rita kung huvud
        ctx.fillStyle = '#FFCC99';
        ctx.fillRect(x + 5, y - 15, width - 10, 20);
        
        // Rita krona
        this.drawCrown(ctx, x, y, crown, width);
        
        // Rita ögon
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 12, y - 10, 3, 3);
        ctx.fillRect(x + 22, y - 10, 3, 3);
        
        // Rita mustache
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 10, y - 5, 18, 3);
        
        // Rita accessoarer
        if (accessory.items.length > 0) {
            this.drawAccessories(ctx, x, y, accessory, width, height);
        }
        
        // Rita krona-effekter
        this.drawCrownEffects(ctx, x, y, crown);
        
        ctx.restore();
    }

    // Rita krona
    drawCrown(ctx, x, y, crown, width) {
        if (crown.icon === '👑') {
            // Standard guldkrona
            ctx.fillStyle = crown.color;
            ctx.fillRect(x + 8, y - 25, width - 16, 10);
            
            // Krona jewels
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(x + 12, y - 22, 3, 3);
            ctx.fillRect(x + 18, y - 22, 3, 3);
            ctx.fillRect(x + 24, y - 22, 3, 3);
        } else {
            // Andra kronor med emoji
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(crown.icon, x + width/2, y - 15);
        }
    }

    // Rita krona-effekter
    drawCrownEffects(ctx, x, y, crown) {
        if (crown.effect !== 'none') {
            const time = Date.now() * 0.01;
            
            switch(crown.effect) {
                case 'extra_points':
                    // Glittrande diamant-effekt
                    ctx.fillStyle = 'rgba(185, 242, 255, 0.6)';
                    for (let i = 0; i < 3; i++) {
                        const sparkleX = x + 15 + Math.sin(time + i) * 10;
                        const sparkleY = y - 20 + Math.cos(time + i) * 5;
                        ctx.fillRect(sparkleX, sparkleY, 2, 2);
                    }
                    break;
                    
                case 'speed_boost':
                    // Röd energi-trail
                    ctx.fillStyle = 'rgba(220, 20, 60, 0.4)';
                    for (let i = 0; i < 5; i++) {
                        ctx.fillRect(x - i*3, y - 10, 2, 10);
                    }
                    break;
                    
                case 'all_powers':
                    // Regnbågs-aura
                    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
                    colors.forEach((color, i) => {
                        ctx.fillStyle = color + '30';
                        ctx.fillRect(x - 5 + i, y - 30, 2, 60);
                    });
                    break;
            }
        }
    }

    // Rita följeslagare
    drawCompanion(ctx, x, y, companion, jumping) {
        if (!companion.icon) return;
        
        const companionY = jumping ? y + 20 : y + 40;
        
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(companion.icon, x - 40, companionY);
        
        // Rita följeslagare-effekter
        this.drawCompanionEffects(ctx, x - 40, companionY, companion);
    }

    // Rita följeslagare-effekter
    drawCompanionEffects(ctx, x, y, companion) {
        const time = Date.now() * 0.01;
        
        switch(companion.effect) {
            case 'magic_trail':
                // Magisk trail för enhörning
                ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
                for (let i = 0; i < 8; i++) {
                    const trailX = x - i*4;
                    const trailY = y + Math.sin(time + i) * 3;
                    ctx.fillRect(trailX, trailY, 3, 3);
                }
                break;
                
            case 'fire_breath':
                // Eld-effekt för drake
                ctx.fillStyle = 'rgba(255, 69, 0, 0.6)';
                for (let i = 0; i < 5; i++) {
                    const fireX = x + 20 + i*3;
                    const fireY = y - 5 + Math.sin(time*2 + i) * 2;
                    ctx.fillRect(fireX, fireY, 4, 6);
                }
                break;
        }
    }

    // Rita accessoarer
    drawAccessories(ctx, x, y, accessory, width, height) {
        accessory.items.forEach((item, index) => {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            
            switch(item) {
                case '⚔️':
                    // Svärd vid sidan
                    ctx.fillText(item, x + width + 5, y + height/2);
                    break;
                case '🛡️':
                    // Sköld på armen
                    ctx.fillText(item, x - 10, y + height/2);
                    break;
                case '🦸':
                    // Mantel bakom
                    ctx.fillStyle = '#8B0000';
                    ctx.fillRect(x - 5, y, 5, height + 10);
                    break;
            }
        });
    }

    // Skapa customization UI
    createCustomizationUI() {
        const ui = document.createElement('div');
        ui.className = 'customization-ui';
        ui.innerHTML = `
            <div class="customization-panel">
                <h2>👑 Anpassa din Kung</h2>
                
                <div class="customization-section">
                    <h3>🎭 Outfits</h3>
                    <div class="items-grid" id="outfitsGrid"></div>
                </div>
                
                <div class="customization-section">
                    <h3>👑 Kronor</h3>
                    <div class="items-grid" id="crownsGrid"></div>
                </div>
                
                <div class="customization-section">
                    <h3>🦄 Följeslagare</h3>
                    <div class="items-grid" id="companionsGrid"></div>
                </div>
                
                <div class="customization-section">
                    <h3>⚔️ Accessoarer</h3>
                    <div class="items-grid" id="accessoriesGrid"></div>
                </div>
                
                <div class="player-stats">
                    <p>Level: ${this.level}</p>
                    <p>Experience: ${this.experience}</p>
                    <p>Nästa level: ${((this.level * 1000) - this.experience)} XP</p>
                </div>
                
                <button class="close-customization" onclick="swedishCharacter.closeCustomizationUI()">Stäng</button>
            </div>
        `;
        
        // Sätt styling
        ui.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        document.body.appendChild(ui);
        this.populateCustomizationGrids();
        
        return ui;
    }

    // Fyll i customization grids
    populateCustomizationGrids() {
        this.populateGrid('outfitsGrid', this.outfits, this.unlockedItems.outfits, 'outfit');
        this.populateGrid('crownsGrid', this.crowns, this.unlockedItems.crowns, 'crown');
        this.populateGrid('companionsGrid', this.companions, this.unlockedItems.companions, 'companion');
        this.populateGrid('accessoriesGrid', this.accessories, this.unlockedItems.accessories, 'accessory');
    }

    // Fyll i specifik grid
    populateGrid(gridId, items, unlockedItems, type) {
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';
        
        Object.keys(items).forEach(key => {
            const item = items[key];
            const unlocked = unlockedItems.includes(key);
            const selected = this.currentOutfit[type] === key;
            
            const itemElement = document.createElement('div');
            itemElement.className = `customization-item ${unlocked ? 'unlocked' : 'locked'} ${selected ? 'selected' : ''}`;
            itemElement.innerHTML = `
                <div class="item-icon">${item.icon || item.crown || '🎭'}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-level">Level ${item.unlockLevel}</div>
                ${!unlocked ? `<div class="item-cost">${item.unlockCost} XP</div>` : ''}
            `;
            
            if (unlocked) {
                itemElement.addEventListener('click', () => {
                    this.selectItem(type, key);
                });
            }
            
            grid.appendChild(itemElement);
        });
    }

    // Välj föremål
    selectItem(type, key) {
        this.currentOutfit[type] = key;
        this.saveCurrentOutfit();
        this.populateCustomizationGrids(); // Uppdatera UI
    }

    // Stäng customization UI
    closeCustomizationUI() {
        const ui = document.querySelector('.customization-ui');
        if (ui) {
            ui.parentNode.removeChild(ui);
        }
    }

    // Öppna customization UI
    openCustomizationUI() {
        this.createCustomizationUI();
    }

    // Få aktuella effekter
    getCurrentEffects() {
        const crown = this.crowns[this.currentOutfit.crown];
        const companion = this.companions[this.currentOutfit.companion];
        const accessory = this.accessories[this.currentOutfit.accessory];
        
        return {
            crown: crown.effect,
            companion: companion.effect,
            accessory: accessory.effect
        };
    }
}

// CSS för customization
const characterCSS = `
@keyframes levelUpFade {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
}

@keyframes levelUpBounce {
    0% { transform: scale(0); }
    20% { transform: scale(1.2); }
    40% { transform: scale(1); }
    60% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

@keyframes unlockSlide {
    0% { transform: translateX(100%); }
    20% { transform: translateX(0); }
    80% { transform: translateX(0); }
    100% { transform: translateX(100%); }
}

.customization-panel {
    background: linear-gradient(135deg, #006aa7, #fecc00);
    padding: 30px;
    border-radius: 20px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    color: white;
}

.customization-section {
    margin-bottom: 30px;
}

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.customization-item {
    background: rgba(255,255,255,0.1);
    padding: 15px;
    border-radius: 15px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.customization-item.unlocked {
    background: rgba(255,255,255,0.2);
}

.customization-item.unlocked:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.05);
}

.customization-item.selected {
    border-color: #FFD700;
    background: rgba(255,215,0,0.3);
}

.customization-item.locked {
    opacity: 0.5;
    cursor: not-allowed;
}

.item-icon {
    font-size: 30px;
    margin-bottom: 10px;
}

.item-name {
    font-weight: bold;
    margin-bottom: 5px;
}

.item-level {
    font-size: 0.9em;
    color: #FFD700;
}

.item-cost {
    font-size: 0.8em;
    color: #FF6B6B;
    margin-top: 5px;
}

.player-stats {
    background: rgba(0,0,0,0.3);
    padding: 15px;
    border-radius: 10px;
    margin: 20px 0;
}

.close-customization {
    background: #FF6B6B;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    font-weight: bold;
}
`;

// Lägg till CSS
const characterStyleSheet = document.createElement('style');
characterStyleSheet.textContent = characterCSS;
document.head.appendChild(characterStyleSheet);

// Globala instans
window.swedishCharacter = new SwedishCharacterManager(); 