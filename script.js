// Game Configuration
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -15;

// Game States
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Game Objects
class Cherry {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 15;
        this.jumping = false;
        this.onBranch = false;
        this.lives = 3;
        this.shield = false;
        this.shieldTime = 0;
        this.eyeBlinkTimer = 0;
        this.eyeBlink = false;
        this.mouthTimer = 0;
        this.scared = false;
        this.jumpPower = JUMP_STRENGTH;
        this.moveDirection = 0; // -1, 0, or 1
        this.scale = 1;
        this.scaleTimer = 0;
        this.bouncePhase = 0;
        this.bounceAmount = 0;
    }

    update(input, branches, enemies, level) {
        // Handle keyboard/mouse input for movement
        this.moveDirection = 0;
        if (input.moveLeft) this.moveDirection = -1;
        if (input.moveRight) this.moveDirection = 1;

        // Horizontal movement with bounce effect
        if (this.moveDirection !== 0) {
            this.vx += this.moveDirection * 2.5;
            this.bouncePhase += 0.1;
            this.bounceAmount = Math.sin(this.bouncePhase) * 2; // Bounce while running
        } else {
            this.bounceAmount *= 0.9;
        }
        this.vx *= 0.92; // Friction

        // Apply gravity
        this.vy += GRAVITY * 0.8;

        // Boundaries with bounce
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.5;
        }
        if (this.x + this.radius > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.radius;
            this.vx *= -0.5;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy + this.bounceAmount;

        // Update scale animation
        if (this.scaleTimer > 0) {
            this.scaleTimer--;
            this.scale = 1 + (1 - this.scaleTimer / 10) * 0.2; // Squash effect
        } else {
            this.scale += (1 - this.scale) * 0.1; // Return to normal
        }

        // Check collisions with branches
        this.onBranch = false;
        for (let branch of branches) {
            if (this.collidesWith(branch) && this.vy > 0) {
                this.y = branch.y - this.radius - 2;
                this.onBranch = true;
                this.bouncePhase = 0;
                
                // Auto jump or wait for input
                if (input.jumping || input.autoJump) {
                    this.vy = this.jumpPower;
                    this.scaleTimer = 10; // Trigger squash animation
                    input.jumping = false;
                    input.autoJump = false;
                } else {
                    this.vy = 0;
                }
                break;
            }
        }

        // Check enemy collisions
        for (let enemy of enemies) {
            if (this.collidesWithEnemy(enemy)) {
                if (this.shield) {
                    this.shield = false;
                    this.shieldTime = 0;
                } else {
                    this.lives--;
                    this.scared = true;
                    setTimeout(() => { this.scared = false; }, 300);
                }
            }
        }

        // Update shield
        if (this.shield) {
            this.shieldTime--;
            if (this.shieldTime <= 0) {
                this.shield = false;
            }
        }

        // Update animations
        this.eyeBlinkTimer++;
        if (this.eyeBlinkTimer > 100) {
            this.eyeBlink = !this.eyeBlink;
            this.eyeBlinkTimer = 0;
        }

        this.mouthTimer++;
        if (this.mouthTimer > 60) {
            this.mouthTimer = 0;
        }

        // Fall off screen = game over
        if (this.y > CANVAS_HEIGHT) {
            return false;
        }

        return true;
    }

    collidesWith(branch) {
        const distX = Math.abs(this.x - (branch.x + branch.width / 2));
        const distY = Math.abs(this.y - branch.y);

        if (distX < branch.width / 2 + this.radius && distY < 10 && this.vy > 0) {
            return true;
        }
        return false;
    }

    collidesWithEnemy(enemy) {
        const dx = this.x - enemy.x;
        const dy = this.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + enemy.radius;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Scale transformation for squash/stretch
        ctx.scale(this.scale, this.scale);

        // Shield effect
        if (this.shield) {
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Cherry body (red gradient)
        const gradient = ctx.createRadialGradient(-5, -5, 2, 0, 0, this.radius);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#e74c3c');
        gradient.addColorStop(1, '#c0392b');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cherry shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-6, -6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const eyeY = -3;
        const eyeSpacing = 10;

        if (this.scared) {
            // Scared eyes (X)
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-eyeSpacing - 3, eyeY - 3);
            ctx.lineTo(-eyeSpacing + 3, eyeY + 3);
            ctx.moveTo(-eyeSpacing - 3, eyeY + 3);
            ctx.lineTo(-eyeSpacing + 3, eyeY - 3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(eyeSpacing - 3, eyeY - 3);
            ctx.lineTo(eyeSpacing + 3, eyeY + 3);
            ctx.moveTo(eyeSpacing - 3, eyeY + 3);
            ctx.lineTo(eyeSpacing + 3, eyeY - 3);
            ctx.stroke();
        } else if (this.eyeBlink) {
            // Closed eyes
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-eyeSpacing, eyeY, 3, 0, Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(eyeSpacing, eyeY, 3, 0, Math.PI);
            ctx.stroke();
        } else {
            // Open eyes with pupils - looking direction based on movement
            const lookDirection = this.moveDirection * 2;
            
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-eyeSpacing + lookDirection, eyeY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(eyeSpacing + lookDirection, eyeY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mouth with expression
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        
        if (this.scared) {
            // Scared mouth (O shape)
            ctx.beginPath();
            ctx.arc(0, 8, 3, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Happy smile
            ctx.beginPath();
            const mouthSmile = Math.sin(this.mouthTimer / 60 * Math.PI) * 3;
            ctx.quadraticCurveTo(0, 8 + mouthSmile, 6, 6);
            ctx.stroke();

            ctx.beginPath();
            ctx.quadraticCurveTo(0, 8 + mouthSmile, -6, 6);
            ctx.stroke();
        }

        ctx.restore();
    }
}

class Branch {
    constructor(x, y, width, wobble = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.wobbleAmount = wobble;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.originX = x;
    }

    update(level) {
        if (this.wobbleAmount > 0) {
            this.wobblePhase += 0.05;
            this.x = this.originX + Math.sin(this.wobblePhase) * this.wobbleAmount;
        }
    }

    draw(ctx) {
        // Branch
        ctx.fillStyle = '#8b6914';
        ctx.fillRect(this.x, this.y, this.width, 15);

        // Leaves
        ctx.fillStyle = '#22b14c';
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y - 5, 8, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(this.x + this.width - 10, this.y - 8, 8, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Bark texture
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + i * (this.width / 3), this.y);
            ctx.lineTo(this.x + i * (this.width / 3) + 5, this.y + 15);
            ctx.stroke();
        }
    }
}

class Enemy {
    constructor(x, y, type = 'bug', speed = 2) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 8;
        this.speed = speed;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.wobblePhase = 0;
        this.minX = 50;
        this.maxX = CANVAS_WIDTH - 50;
    }

    update(level) {
        this.wobblePhase += 0.05;
        this.x += this.speed * this.direction;
        this.y += Math.sin(this.wobblePhase) * 0.3; // Wobble movement

        // Bounce off edges
        if (this.x < this.minX || this.x > this.maxX) {
            this.direction *= -1;
            this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
        }

        // Speed increases with level
        this.speed = 2 + level * 0.5;
    }

    draw(ctx) {
        if (this.type === 'bug') {
            // Bug/insect enemy
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Legs
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x - 6, this.y + 2 + i * 2);
                ctx.lineTo(this.x - 12, this.y + 4 + i * 3);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(this.x + 6, this.y + 2 + i * 2);
                ctx.lineTo(this.x + 12, this.y + 4 + i * 3);
                ctx.stroke();
            }

            // Eyes
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(this.x - 3, this.y - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 3, this.y - 2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'bird') {
            // Bird enemy
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wings
            ctx.fillStyle = '#229954';
            ctx.beginPath();
            ctx.ellipse(this.x - 8, this.y, 6, 3, -0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(this.x + 8, this.y, 6, 3, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Beak
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y - 2);
            ctx.lineTo(this.x + 15, this.y);
            ctx.lineTo(this.x + 10, this.y + 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x + 3, this.y - 2, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Bonus {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'shield', 'speed', 'points'
        this.radius = 10;
        this.collected = false;
        this.rotation = 0;
    }

    update() {
        this.rotation += 0.05;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'shield') {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f39c12';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.type === 'speed') {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(this.radius, 0);
            ctx.lineTo(0, this.radius);
            ctx.lineTo(-this.radius, 0);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', 0, 0);
        } else if (this.type === 'points') {
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', 0, 0);
        }

        ctx.restore();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GAME_STATE.MENU;
        this.score = 0;
        this.level = 1;
        this.distance = 0;
        this.gameStarted = false;

        this.cherry = null;
        this.branches = [];
        this.enemies = [];
        this.bonuses = [];

        this.input = {
            mouseX: null,
            mouseY: null,
            jumping: false,
            autoJump: false,
            moveLeft: false,
            moveRight: false
        };

        this.keysPressed = {};
        this.setupEventListeners();
        this.initGame();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('quitBtn').addEventListener('click', () => this.quit());

        this.canvas.addEventListener('click', () => {
            if (this.state === GAME_STATE.PLAYING && this.cherry && this.cherry.onBranch) {
                this.input.jumping = true;
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.state !== GAME_STATE.PLAYING) return;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.cherry && this.cherry.onBranch) {
                    this.input.jumping = true;
                }
            }
            if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keysPressed['left'] = true;
            }
            if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keysPressed['right'] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keysPressed['left'] = false;
            }
            if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keysPressed['right'] = false;
            }
        });

        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.state === GAME_STATE.PLAYING && this.cherry && this.cherry.onBranch) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                
                if (touchX < CANVAS_WIDTH / 3) {
                    this.keysPressed['left'] = true;
                } else if (touchX > CANVAS_WIDTH * 2 / 3) {
                    this.keysPressed['right'] = true;
                } else {
                    this.input.jumping = true;
                }
            }
        });

        this.canvas.addEventListener('touchend', () => {
            this.keysPressed['left'] = false;
            this.keysPressed['right'] = false;
        });
    }

    initGame() {
        this.cherry = new Cherry(CANVAS_WIDTH / 2, 30);
        this.branches = this.generateBranches();
        this.enemies = this.generateEnemies();
        this.bonuses = this.generateBonuses();
    }

    generateBranches() {
        const branches = [];
        let y = 80;

        while (y < CANVAS_HEIGHT) {
            const count = 3 + Math.floor(Math.random() * 3);
            const spacing = CANVAS_WIDTH / (count + 1);

            for (let i = 0; i < count; i++) {
                const x = spacing * (i + 1) - 40 + (Math.random() * 40);
                const width = 60 + Math.random() * 40;
                const wobble = this.level > 2 ? Math.random() * 5 : 0;
                branches.push(new Branch(x, y, width, wobble));
            }

            y += 50 + Math.random() * 40;
        }

        return branches;
    }

    generateEnemies() {
        const enemies = [];
        const enemyCount = 2 + Math.floor(this.level * 1.5);

        for (let i = 0; i < enemyCount; i++) {
            const y = 150 + Math.random() * (CANVAS_HEIGHT - 250);
            const type = Math.random() > 0.5 ? 'bug' : 'bird';
            const speed = 2 + Math.random() * this.level;
            enemies.push(new Enemy(Math.random() * CANVAS_WIDTH, y, type, speed));
        }

        return enemies;
    }

    generateBonuses() {
        const bonuses = [];
        const types = ['shield', 'speed', 'points'];

        const count = Math.min(2 + this.level, 5);
        for (let i = 0; i < count; i++) {
            const y = 200 + Math.random() * (CANVAS_HEIGHT - 300);
            const type = types[Math.floor(Math.random() * types.length)];
            bonuses.push(new Bonus(Math.random() * (CANVAS_WIDTH - 100) + 50, y, type));
        }

        return bonuses;
    }

    start() {
        this.state = GAME_STATE.PLAYING;
        this.gameStarted = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.update();
    }

    togglePause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
            document.getElementById('pauseScreen').classList.remove('hidden');
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            document.getElementById('pauseScreen').classList.add('hidden');
            this.update();
        }
    }

    restart() {
        this.score = 0;
        this.level = 1;
        this.distance = 0;
        this.initGame();
        this.start();
    }

    quit() {
        this.state = GAME_STATE.MENU;
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    update() {
        if (this.state !== GAME_STATE.PLAYING) {
            return;
        }

        // Update input state
        this.input.moveLeft = this.keysPressed['left'] || false;
        this.input.moveRight = this.keysPressed['right'] || false;

        // Update cherry
        const cherryAlive = this.cherry.update(this.input, this.branches, this.enemies, this.level);

        if (!cherryAlive || this.cherry.lives <= 0) {
            this.endGame();
            return;
        }

        // Update level based on distance
        this.distance = Math.max(0, -this.cherry.y);
        this.level = 1 + Math.floor(this.distance / 500);

        // Update branches
        for (let branch of this.branches) {
            branch.update(this.level);
        }

        // Update enemies
        for (let enemy of this.enemies) {
            enemy.update(this.level);
        }

        // Update bonuses
        for (let bonus of this.bonuses) {
            bonus.update();

            // Check if cherry collected bonus
            const dx = this.cherry.x - bonus.x;
            const dy = this.cherry.y - bonus.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.cherry.radius + bonus.radius && !bonus.collected) {
                bonus.collected = true;
                this.collectBonus(bonus);
            }
        }

        // Remove collected bonuses
        this.bonuses = this.bonuses.filter(b => !b.collected);

        // Generate new branches and enemies as needed
        const lowestBranch = Math.max(...this.branches.map(b => b.y));
        if (lowestBranch < CANVAS_HEIGHT + 100) {
            this.branches = this.branches.concat(this.generateBranches().slice(0, 4));
        }

        // Update UI
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('lives').textContent = this.cherry.lives;
        document.getElementById('level').textContent = this.level;

        // Continue game loop
        requestAnimationFrame(() => this.update());
    }

    collectBonus(bonus) {
        if (bonus.type === 'shield') {
            this.cherry.shield = true;
            this.cherry.shieldTime = 300;
            this.score += 50;
        } else if (bonus.type === 'speed') {
            this.score += 100;
        } else if (bonus.type === 'points') {
            this.score += 25;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw clouds
        this.drawClouds();

        // Draw branches
        for (let branch of this.branches) {
            branch.draw(this.ctx);
        }

        // Draw enemies
        for (let enemy of this.enemies) {
            enemy.draw(this.ctx);
        }

        // Draw bonuses
        for (let bonus of this.bonuses) {
            if (!bonus.collected) {
                bonus.draw(this.ctx);
            }
        }

        // Draw cherry
        if (this.cherry) {
            this.cherry.draw(this.ctx);
        }

        // Draw score display
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(`Skoor: ${Math.floor(this.score)}`, 10, 20);
        this.ctx.fillText(`Tase: ${this.level}`, 10, 40);
    }

    drawClouds() {
        const time = Date.now() / 10000;
        this.drawCloud(100 + Math.sin(time) * 50, 50, 1);
        this.drawCloud(500 + Math.cos(time * 0.7) * 80, 80, 0.8);
        this.drawCloud(700 - Math.sin(time * 0.5) * 60, 45, 1.2);
    }

    drawCloud(x, y, scale) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 40 * scale, 15 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(x + 20 * scale, y - 10 * scale, 30 * scale, 15 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    endGame() {
        this.state = GAME_STATE.GAME_OVER;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('pauseBtn').disabled = true;
    }

    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game
let game;
window.addEventListener('load', () => {
    game = new Game();
    game.gameLoop();
});
