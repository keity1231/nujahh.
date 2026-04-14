// ====== FARM GAME ENGINE ======

class Farm {
    constructor() {
        this.money = 100;
        this.day = 1;
        this.level = 1;
        this.animals = {
            chickens: 2,
            cows: 2,
            sheep: 2
        };
        this.food = {
            chickenFood: 0,
            cowFood: 0,
            sheepFood: 0
        };
        this.buildings = {
            chickenCoop: 1,
            cowBarn: 1,
            sheepPen: 1
        };
        this.maxAnimals = {
            chickens: 5,
            cows: 5,
            sheep: 5
        };
        this.resources = {
            eggs: 0,
            milk: 0,
            wool: 0,
            cheese: 0,
            omelette: 0,
            socks: 0
        };
        this.animalHunger = {
            chickens: 0,
            cows: 0,
            sheep: 0
        };
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Buy buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.parentElement.dataset.buy || e.target.parentElement.parentElement.dataset.buy;
                this.buyItem(item);
            });
        });

        // Feed buttons
        document.querySelectorAll('.feed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const animal = e.target.dataset.feed;
                this.feedAnimal(animal);
            });
        });

        // Sell buttons
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.sell;
                this.sellItem(item);
            });
        });

        // Process buttons
        document.querySelectorAll('.process-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.process;
                this.processItem(item);
            });
        });

        // Next day button
        document.getElementById('nextDayBtn').addEventListener('click', () => this.nextDay());
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName + '-tab').classList.add('active');
        event.target.classList.add('active');
        
        // Update market and processing displays
        if (tabName === 'market') {
            this.updateMarketDisplay();
        }
        if (tabName === 'process') {
            this.updateProcessDisplay();
        }
    }

    processItem(type) {
        if (type === 'milk-to-cheese') {
            if (this.resources.milk < 2) {
                this.notify('Piima ei ole piisavalt! Vajad 2L 🥛');
                return;
            }
            this.resources.milk -= 2;
            this.resources.cheese += 1;
            this.notify('Tegid juustu: 2L piim → 1kg juust! 🧀');
        } else if (type === 'eggs-to-omelette') {
            if (this.resources.eggs < 3) {
                this.notify('Mune ei ole piisavalt! Vajad 3 muna 🥚');
                return;
            }
            this.resources.eggs -= 3;
            this.resources.omelette += 1;
            this.notify('Tegid omletit: 3 muna → 1 omlett! 🍳');
        } else if (type === 'wool-to-socks') {
            if (this.resources.wool < 1.5) {
                this.notify('Villa ei ole piisavalt! Vajad 1.5kg 🧙');
                return;
            }
            this.resources.wool -= 1.5;
            this.resources.socks += 1;
            this.notify('Tegid sukkasid: 1.5kg villa → 1 paar sukkasid! 🧦');
        }
        this.updateDisplay();
    }

    updateMarketDisplay() {
        document.getElementById('eggCount').textContent = Math.floor(this.resources.eggs);
        document.getElementById('milkCount').textContent = this.resources.milk.toFixed(1);
        document.getElementById('woolCount').textContent = this.resources.wool.toFixed(1);
        document.getElementById('cheeseCount').textContent = Math.floor(this.resources.cheese);
        document.getElementById('omelettCount').textContent = Math.floor(this.resources.omelette);
        document.getElementById('socksCount').textContent = Math.floor(this.resources.socks);
    }

    updateProcessDisplay() {
        document.getElementById('proc-milkCount').textContent = this.resources.milk.toFixed(1);
        document.getElementById('proc-eggsCount').textContent = Math.floor(this.resources.eggs);
        document.getElementById('proc-woolCount').textContent = this.resources.wool.toFixed(1);
    }

    buyItem(item) {
        const prices = {
            'chicken-food': 5,
            'cow-food': 8,
            'sheep-food': 6,
            'chicken': 30,
            'cow': 50,
            'sheep': 40,
            'chicken-coop': 100,
            'cow-barn': 150,
            'sheep-pen': 120
        };

        if (!prices[item]) return;
        if (this.money < prices[item]) {
            this.notify('Ei ole piisavalt raha! 💸');
            return;
        }

        this.money -= prices[item];

        if (item === 'chicken-food') {
            this.food.chickenFood += 1;
            this.notify('Ostsid kanade toidu! 🌽');
        } else if (item === 'cow-food') {
            this.food.cowFood += 1;
            this.notify('Ostsid lehmade toidu! 🌾');
        } else if (item === 'sheep-food') {
            this.food.sheepFood += 1;
            this.notify('Ostsid lammaste toidu! 🥬');
        } else if (item === 'chicken') {
            if (this.animals.chickens >= this.maxAnimals.chickens) {
                this.notify('Ei ole piisavalt ruumi kanadele! 🐔');
                this.money += prices[item]; // refund
                return;
            }
            this.animals.chickens++;
            this.notify('Uus kana ostetud! 🐔');
        } else if (item === 'cow') {
            if (this.animals.cows >= this.maxAnimals.cows) {
                this.notify('Ei ole piisavalt ruumi lehmadele! 🐄');
                this.money += prices[item];
                return;
            }
            this.animals.cows++;
            this.notify('Uus lehm ostetud! 🐄');
        } else if (item === 'sheep') {
            if (this.animals.sheep >= this.maxAnimals.sheep) {
                this.notify('Ei ole piisavalt ruumi lammastele! 🐑');
                this.money += prices[item];
                return;
            }
            this.animals.sheep++;
            this.notify('Uus lammas ostetud! 🐑');
        } else if (item === 'chicken-coop') {
            this.buildings.chickenCoop++;
            this.maxAnimals.chickens += 5;
            this.notify('Uus kanala ostetud! 🏠');
        } else if (item === 'cow-barn') {
            this.buildings.cowBarn++;
            this.maxAnimals.cows += 5;
            this.notify('Uus lehmala ostetud! 🏠');
        } else if (item === 'sheep-pen') {
            this.buildings.sheepPen++;
            this.maxAnimals.sheep += 5;
            this.notify('Uus lammaste puur ostetud! 🏠');
        }

        this.updateDisplay();
    }

    feedAnimal(animal) {
        if (animal === 'chicken') {
            if (this.food.chickenFood >= this.animals.chickens) {
                this.food.chickenFood -= this.animals.chickens;
                this.animalHunger.chickens = 0;
                this.notify(`Kanad söödetud! Söödud: ${this.animals.chickens} ühikut 🌽`);
            } else {
                this.notify('Ei ole piisavalt toitu kanadele! 🌽');
            }
        } else if (animal === 'cow') {
            if (this.food.cowFood >= this.animals.cows) {
                this.food.cowFood -= this.animals.cows;
                this.animalHunger.cows = 0;
                this.notify(`Lehmad söödetud! Söödud: ${this.animals.cows} ühikut 🌾`);
            } else {
                this.notify('Ei ole piisavalt toitu lehmadele! 🌾');
            }
        } else if (animal === 'sheep') {
            if (this.food.sheepFood >= this.animals.sheep) {
                this.food.sheepFood -= this.animals.sheep;
                this.animalHunger.sheep = 0;
                this.notify(`Lambad söödetud! Söödud: ${this.animals.sheep} ühikut 🥬`);
            } else {
                this.notify('Ei ole piisavalt toitu lammastele! 🥬');
            }
        }
        this.updateDisplay();
    }

    sellItem(item) {
        const prices = {
            'eggs': 3,
            'milk': 4,
            'wool': 5,
            'cheese': 15,
            'omelette': 12,
            'socks': 20
        };

        let amount = 0;
        let money = 0;
        let message = '';

        if (item === 'eggs') {
            amount = this.resources.eggs;
            money = amount * prices[item];
            this.money += money;
            this.resources.eggs = 0;
            message = `Müüsid ${amount} muna! Saadsid €${money} 🥚`;
        } else if (item === 'milk') {
            amount = Math.floor(this.resources.milk);
            money = amount * prices[item];
            this.money += money;
            this.resources.milk = 0;
            message = `Müüsid ${amount}L piima! Saadsid €${money} 🥛`;
        } else if (item === 'wool') {
            amount = Math.floor(this.resources.wool);
            money = amount * prices[item];
            this.money += money;
            this.resources.wool = 0;
            message = `Müüsid ${amount}kg villa! Saadsid €${money} 🧙`;
        } else if (item === 'cheese') {
            amount = this.resources.cheese;
            money = amount * prices[item];
            this.money += money;
            this.resources.cheese = 0;
            message = `Müüsid ${amount}kg juustu! Saadsid €${money} 🧀`;
        } else if (item === 'omelette') {
            amount = this.resources.omelette;
            money = amount * prices[item];
            this.money += money;
            this.resources.omelette = 0;
            message = `Müüsid ${amount} omletit! Saadsid €${money} 🍳`;
        } else if (item === 'socks') {
            amount = this.resources.socks;
            money = amount * prices[item];
            this.money += money;
            this.resources.socks = 0;
            message = `Müüsid ${amount} paari sukkasid! Saadsid €${money} 🧦`;
        }

        if (amount === 0) {
            this.notify('Teil ei ole müügiks! 🚫');
        } else {
            this.notify(message);
        }

        this.updateDisplay();
    }

    nextDay() {
        // Daily bonus money
        this.money += 300;
        this.notify('Saadsid päevaraha: +€300! 💵');

        // Check level up
        const requiredMoney = this.level * 1000;
        if (this.money >= requiredMoney) {
            this.level++;
            this.notify(`Tase tõusis! Oled nüüd tasemel ${this.level}! 🎉`);
        }

        // Increase hunger if not fed
        if (this.animalHunger.chickens > 0) {
            this.animalHunger.chickens += 1;
        }
        if (this.animalHunger.cows > 0) {
            this.animalHunger.cows += 1;
        }
        if (this.animalHunger.sheep > 0) {
            this.animalHunger.sheep += 1;
        }

        // Animals produce only if fed (hunger == 0)
        if (this.animalHunger.chickens === 0) {
            const eggProduction = this.animals.chickens * 1.2;
            this.resources.eggs += eggProduction;
            this.notify(`🐔 Kanad andsid ${Math.floor(eggProduction)} muna!`);
        } else {
            this.notify('🐔 Kanad ei andnud mune - nad on näljased!');
        }
        if (this.animalHunger.cows === 0) {
            const milkProduction = this.animals.cows * 2;
            this.resources.milk += milkProduction;
            this.notify(`🐄 Lehmad andsid ${milkProduction.toFixed(1)}L piima!`);
        } else {
            this.notify('🐄 Lehmad ei andnud piima - nad on näljased!');
        }
        if (this.animalHunger.sheep === 0) {
            const woolProduction = this.animals.sheep * 0.8;
            this.resources.wool += woolProduction;
            this.notify(`🐑 Lambad andsid ${woolProduction.toFixed(1)}kg villa!`);
        } else {
            this.notify('🐑 Lambad ei andnud villa - nad on näljased!');
        }

        // Set hunger for next day if not fed
        if (this.animalHunger.chickens === 0) {
            this.animalHunger.chickens = 1; // start hungry for next day
        }
        if (this.animalHunger.cows === 0) {
            this.animalHunger.cows = 1;
        }
        if (this.animalHunger.sheep === 0) {
            this.animalHunger.sheep = 1;
        }

        // Check if animals die (too hungry)
        if (this.animalHunger.chickens > 3) {
            this.animals.chickens = Math.max(0, this.animals.chickens - 1);
            this.notify('Üks kana suri! 😢');
            this.animalHunger.chickens = 0;
        }
        if (this.animalHunger.cows > 3) {
            this.animals.cows = Math.max(0, this.animals.cows - 1);
            this.notify('Üks lehm suri! 😢');
            this.animalHunger.cows = 0;
        }
        if (this.animalHunger.sheep > 3) {
            this.animals.sheep = Math.max(0, this.animals.sheep - 1);
            this.notify('Üks lammas suri! 😢');
            this.animalHunger.sheep = 0;
        }

        this.day++;
        this.updateDisplay();
        this.drawFarm();
    }

    notify(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    updateDisplay() {
        // Update stats
        document.getElementById('level').textContent = this.level;
        document.getElementById('money').textContent = Math.floor(this.money);
        document.getElementById('day').textContent = this.day;
        document.getElementById('chickenCount').textContent = this.animals.chickens;
        document.getElementById('cowCount').textContent = this.animals.cows;
        document.getElementById('sheepCount').textContent = this.animals.sheep;

        // Update market
        document.getElementById('eggCount').textContent = Math.floor(this.resources.eggs);
        document.getElementById('milkCount').textContent = this.resources.milk.toFixed(1);
        document.getElementById('woolCount').textContent = this.resources.wool.toFixed(1);

        // Update inventory
        document.getElementById('inv-money').textContent = Math.floor(this.money);
        document.getElementById('inv-chickens').textContent = this.animals.chickens;
        document.getElementById('inv-cows').textContent = this.animals.cows;
        document.getElementById('inv-sheep').textContent = this.animals.sheep;
        document.getElementById('inv-chicken-food').textContent = this.food.chickenFood;
        document.getElementById('inv-cow-food').textContent = this.food.cowFood;
        document.getElementById('inv-sheep-food').textContent = this.food.sheepFood;
        document.getElementById('inv-eggs').textContent = Math.floor(this.resources.eggs);
        document.getElementById('inv-milk').textContent = this.resources.milk.toFixed(1);
        document.getElementById('inv-wool').textContent = this.resources.wool.toFixed(1);
        document.getElementById('inv-cheese').textContent = Math.floor(this.resources.cheese);
        document.getElementById('inv-omelette').textContent = Math.floor(this.resources.omelette);
        document.getElementById('inv-socks').textContent = Math.floor(this.resources.socks);

        // Update animal status
        this.updateAnimalStatus();

        // Disable buy buttons if not enough money
        document.querySelectorAll('.buy-btn').forEach(btn => {
            const parent = btn.parentElement;
            const priceText = parent.querySelector('.item-price').textContent;
            const price = parseInt(priceText.match(/\d+/)[0]);
            btn.disabled = this.money < price;
        });
    }

    updateAnimalStatus() {
        const statusList = document.getElementById('animalStatus');
        statusList.innerHTML = '';

        const animalStatus = [
            { name: '🐔 Kanad', hunger: this.animalHunger.chickens, count: this.animals.chickens },
            { name: '🐄 Lehmad', hunger: this.animalHunger.cows, count: this.animals.cows },
            { name: '🐑 Lambad', hunger: this.animalHunger.sheep, count: this.animals.sheep }
        ];

        animalStatus.forEach(animal => {
            const status = Math.min(100, Math.max(0, 100 - animal.hunger * 33));
            const statusColor = status > 66 ? 'green' : status > 33 ? 'orange' : 'red';
            
            statusList.innerHTML += `
                <div class="status-item">
                    <span>${animal.name}: ${animal.count}</span>
                    <div style="width: 100px; height: 15px; background: #eee; border-radius: 5px; overflow: hidden;">
                        <div style="width: ${status}%; height: 100%; background: ${statusColor};"></div>
                    </div>
                </div>
            `;
        });
    }

    drawFarm() {
        const canvas = document.getElementById('farmCanvas');
        const ctx = canvas.getContext('2d');

        // Clear canvas with sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(550, 40, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw grass field
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, canvas.height * 0.65, canvas.width, canvas.height * 0.35);
        
        // Draw grass pattern
        ctx.strokeStyle = '#7CCD7C';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, canvas.height * 0.65);
            ctx.lineTo(i + 5, canvas.height * 0.62);
            ctx.stroke();
        }

        // Draw barn
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(50, 60, 180, 140);
        
        // Barn roof
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.moveTo(50, 60);
        ctx.lineTo(140, 15);
        ctx.lineTo(230, 60);
        ctx.fill();
        
        // Barn door
        ctx.fillStyle = '#654321';
        ctx.fillRect(110, 130, 60, 70);
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(165, 165, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Barn window
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(175, 85, 35, 35);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(175, 85, 35, 35);
        ctx.beginPath();
        ctx.moveTo(192.5, 85);
        ctx.lineTo(192.5, 120);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(175, 102.5);
        ctx.lineTo(210, 102.5);
        ctx.stroke();

        // Draw fence
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 3;
        for (let i = 280; i < canvas.width; i += 30) {
            // Vertical posts
            ctx.beginPath();
            ctx.moveTo(i, canvas.height * 0.6);
            ctx.lineTo(i, canvas.height * 0.65);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(280, canvas.height * 0.625);
        ctx.lineTo(canvas.width, canvas.height * 0.625);
        ctx.stroke();

        // Draw animals with better spacing
        const animalPositions = [
            { x: 300, y: 320, type: 'chicken' },
            { x: 360, y: 330, type: 'cow' },
            { x: 440, y: 330, type: 'sheep' }
        ];

        animalPositions.forEach(pos => {
            this.drawAnimal(ctx, pos.x, pos.y, pos.type, pos.type === 'chicken' ? this.animals.chickens : 
                                                          pos.type === 'cow' ? this.animals.cows : 
                                                          this.animals.sheep);
        });

        // Draw statistics on farm
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`📅 Päev: ${this.day}`, 20, 35);
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#2d5016';
        ctx.fillText(`🐔 Kanaid: ${this.animals.chickens}`, 310, 310);
        ctx.fillText(`🐄 Lehmi: ${this.animals.cows}`, 370, 310);
        ctx.fillText(`🐑 Lambaid: ${this.animals.sheep}`, 450, 310);
    }

    drawAnimal(ctx, x, y, type, count) {
        if (type === 'chicken') {
            // Draw ultra cute chicken with personality
            // Body
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.ellipse(x, y, 14, 13, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Wing details
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.ellipse(x - 9, y, 6, 8, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 9, y, 6, 8, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Head
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y - 13, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Big cute eyes
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 4, y - 15, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 4, y - 15, 3.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils looking cute
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x - 4, y - 13, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 4, y - 13, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye shine (very cute)
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 3.5, y - 14, 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 4.5, y - 14, 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            // Blush
            ctx.fillStyle = 'rgba(255, 192, 203, 0.5)';
            ctx.beginPath();
            ctx.arc(x - 8, y - 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 8, y - 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Beak
            ctx.fillStyle = '#FF8C00';
            ctx.beginPath();
            ctx.moveTo(x + 8, y - 12);
            ctx.lineTo(x + 15, y - 11);
            ctx.lineTo(x + 8, y - 9);
            ctx.fill();
            
            // Comb (fluffy)
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.moveTo(x - 1, y - 23);
            ctx.lineTo(x - 4, y - 27);
            ctx.lineTo(x + 1, y - 24);
            ctx.lineTo(x + 4, y - 27);
            ctx.lineTo(x + 2, y - 23);
            ctx.fill();
            
            // Feet
            ctx.fillStyle = '#FF8C00';
            ctx.fillRect(x - 6, y + 21, 3, 2);
            ctx.fillRect(x + 3, y + 21, 3, 2);
            
            // Legs
            ctx.strokeStyle = '#FF8C00';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x - 5, y + 12);
            ctx.lineTo(x - 5, y + 21);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 5, y + 12);
            ctx.lineTo(x + 5, y + 21);
            ctx.stroke();
            
        } else if (type === 'cow') {
            // Draw super cute cow with big eyes
            // Body
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.ellipse(x, y, 21, 19, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Pink belly
            ctx.fillStyle = '#A0522D';
            ctx.beginPath();
            ctx.ellipse(x, y + 2, 15, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Head
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(x - 18, y - 8, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Horns with curves
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x - 22, y - 18, 3, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x - 14, y - 18, 3, 0, Math.PI);
            ctx.stroke();
            
            // HUGE cute eyes
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 22, y - 11, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils looking up cute
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x - 22, y - 13, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye shine
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 20, y - 14, 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Blush
            ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
            ctx.beginPath();
            ctx.arc(x - 26, y - 8, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Snout
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.ellipse(x - 20, y - 3, 5.5, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Nostrils
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.arc(x - 23, y - 3, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 17, y - 3, 1.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Spots
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x - 5, y - 5, 6, 5, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x + 10, y, 7, 6, -0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Tail with fluff
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 20, y);
            ctx.quadraticCurveTo(x + 30, y + 5, x + 32, y + 15);
            ctx.stroke();
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.arc(x + 32, y + 15, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Legs
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - 12, y + 17, 5, 8);
            ctx.fillRect(x - 2, y + 17, 5, 8);
            ctx.fillRect(x + 8, y + 17, 5, 8);
            ctx.fillRect(x + 18, y + 17, 5, 8);
            
            // Hooves
            ctx.fillStyle = '#654321';
            ctx.fillRect(x - 12, y + 25, 5, 2);
            ctx.fillRect(x - 2, y + 25, 5, 2);
            ctx.fillRect(x + 8, y + 25, 5, 2);
            ctx.fillRect(x + 18, y + 25, 5, 2);
            
        } else if (type === 'sheep') {
            // Draw adorable fluffy sheep  
            // Wool clouds
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x - 5, y + 2, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 10, y - 5, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 8, y - 3, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Wool shading
            ctx.fillStyle = 'rgba(220, 220, 220, 0.3)';
            ctx.beginPath();
            ctx.arc(x, y + 5, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Head
            ctx.fillStyle = '#FFFACD';
            ctx.beginPath();
            ctx.arc(x - 18, y - 5, 11, 0, Math.PI * 2);
            ctx.fill();
            
            // Cute ears
            ctx.fillStyle = '#FFFACD';
            ctx.beginPath();
            ctx.ellipse(x - 25, y - 15, 3.5, 7, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x - 11, y - 15, 3.5, 7, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner ears pink
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.ellipse(x - 25, y - 15, 1.5, 4, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(x - 11, y - 15, 1.5, 4, 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // HUGE cute eyes
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 22, y - 7, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 14, y - 7, 3.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils looking adorable
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(x - 22, y - 5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 14, y - 5, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes shine
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x - 20, y - 7, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 12, y - 7, 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Blush
            ctx.fillStyle = 'rgba(255, 192, 203, 0.7)';
            ctx.beginPath();
            ctx.arc(x - 26, y - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x - 10, y - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Nose  
            ctx.fillStyle = '#FFB6C1';
            ctx.beginPath();
            ctx.ellipse(x - 18, y + 2, 2.5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Mouth cute smile
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x - 18, y + 4, 3, 0, Math.PI);
            ctx.stroke();
            
            // Legs
            ctx.fillStyle = '#FFFACD';
            ctx.fillRect(x - 12, y + 16, 5, 9);
            ctx.fillRect(x - 2, y + 16, 5, 9);
            ctx.fillRect(x + 8, y + 16, 5, 9);
            ctx.fillRect(x + 18, y + 16, 5, 9);
            
            // Hooves
            ctx.fillStyle = '#D3D3D3';
            ctx.fillRect(x - 12, y + 25, 5, 2);
            ctx.fillRect(x - 2, y + 25, 5, 2);
            ctx.fillRect(x + 8, y + 25, 5, 2);
            ctx.fillRect(x + 18, y + 25, 5, 2);
        }
    }
}

// Initialize game
let farm;
window.addEventListener('load', () => {
    farm = new Farm();
    farm.drawFarm();
});
