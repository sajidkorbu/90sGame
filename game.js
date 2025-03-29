// Constants
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const FPS = 60;

// Colors
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const RED = '#FF0000';
const BLUE = '#0000FF';
const GRAY = '#808080';
const BACKGROUND_GRAY = '#404040';  // New background color
const ORANGE = '#FFA500';
const DARK_GREEN = '#2D4F1E';
const LIGHT_GREEN = '#4A7C32';
const HELMET_GREEN = '#395C27';
const BROWN = '#8B4513';
const DARK_BROWN = '#654321';
const METAL_GRAY = '#707070';
const DARK_METAL = '#404040';
const YELLOW = '#FFD700';

// Game settings
const CANNON_SPEED = 3;
const BULLET_SPEED = 5;
const AIRCRAFT_SPEED = 1.2;
const PARACHUTE_SPEED = 1;
const SOLDIER_SPEED = 0.3;
const MIN_SPAWN_DELAY = 30;  // Minimum frames between spawns
const MAX_SPAWN_DELAY = 120; // Maximum frames between spawns

class Cannon {
    constructor() {
        this.angle = 90; // Start at 90 degrees (pointing up)
        this.x = SCREEN_WIDTH / 2;
        this.y = SCREEN_HEIGHT - 50;
        this.baseWidth = 50;
        this.baseHeight = 30;
        this.barrelLength = 45;
        this.wheelRadius = 12;
    }

    move(direction) {
        if (direction === 'left' && this.angle < 150) {
            this.angle += CANNON_SPEED;
        } else if (direction === 'right' && this.angle > 30) {
            this.angle -= CANNON_SPEED;
        }
    }

    draw(ctx) {
        // Draw large wheels
        ctx.fillStyle = DARK_BROWN;
        ctx.beginPath();
        // Left wheel
        ctx.arc(this.x - this.baseWidth/3, this.y + this.baseHeight/2, this.wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        // Right wheel
        ctx.beginPath();
        ctx.arc(this.x + this.baseWidth/3, this.y + this.baseHeight/2, this.wheelRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw wheel details (spokes)
        ctx.strokeStyle = BROWN;
        ctx.lineWidth = 2;
        [-this.baseWidth/3, this.baseWidth/3].forEach(wheelOffset => {
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + wheelOffset, this.y + this.baseHeight/2);
                const angle = (i * Math.PI / 2);
                ctx.lineTo(
                    this.x + wheelOffset + Math.cos(angle) * this.wheelRadius,
                    this.y + this.baseHeight/2 + Math.sin(angle) * this.wheelRadius
                );
                ctx.stroke();
            }
        });

        // Draw wooden base
        ctx.fillStyle = BROWN;
        ctx.beginPath();
        ctx.moveTo(this.x - this.baseWidth/2, this.y - this.baseHeight/2);
        ctx.lineTo(this.x + this.baseWidth/2, this.y - this.baseHeight/2);
        ctx.lineTo(this.x + this.baseWidth/2, this.y + this.baseHeight/2);
        ctx.lineTo(this.x - this.baseWidth/2, this.y + this.baseHeight/2);
        ctx.closePath();
        ctx.fill();

        // Draw wood grain details
        ctx.strokeStyle = DARK_BROWN;
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - this.baseWidth/2, this.y - this.baseHeight/2 + (i * this.baseHeight/4));
            ctx.lineTo(this.x + this.baseWidth/2, this.y - this.baseHeight/2 + (i * this.baseHeight/4));
            ctx.stroke();
        }

        // Draw cannon mount
        ctx.fillStyle = DARK_BROWN;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.baseHeight/2, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw barrel
        const barrelWidth = 14;
        const endX = this.x + Math.cos(this.angle * Math.PI / 180) * this.barrelLength;
        const endY = this.y - this.baseHeight/2 - Math.sin(this.angle * Math.PI / 180) * this.barrelLength;

        // Draw main barrel
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.baseHeight/2);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = METAL_GRAY;
        ctx.lineWidth = barrelWidth;
        ctx.stroke();

        // Draw barrel rim at base
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.baseHeight/2, barrelWidth/2 + 2, 0, Math.PI * 2);
        ctx.fillStyle = DARK_METAL;
        ctx.fill();

        // Draw barrel rim at end
        ctx.beginPath();
        ctx.arc(endX, endY, barrelWidth/2 + 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.radius = 5;
        this.active = true;
    }

    move() {
        this.x += Math.cos(this.angle * Math.PI / 180) * BULLET_SPEED;
        this.y -= Math.sin(this.angle * Math.PI / 180) * BULLET_SPEED;
        if (this.y < 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
    }
}

class Aircraft {
    constructor() {
        this.width = 50;
        this.height = 25;
        this.side = Math.random() < 0.5 ? 'left' : 'right';
        this.x = this.side === 'left' ? -this.width : SCREEN_WIDTH;
        this.y = 50;
        this.active = true;
        this.hasDroppedParachute = false;
        this.wasShot = false;
        this.isDropping = false;
        this.dropTimer = 0;
        this.dropDuration = 30;
        // Add a random chance (40%) for this aircraft to be carrying a soldier
        this.willDropParachute = Math.random() < 0.4;
    }

    move() {
        if (this.isDropping) {
            this.dropTimer++;
            if (this.dropTimer >= this.dropDuration) {
                this.active = false;
            }
            return;
        }

        if (this.side === 'left') {
            this.x += AIRCRAFT_SPEED;
            if (this.x > SCREEN_WIDTH - this.width) {
                // Only enter dropping state if this aircraft will drop a parachute
                if (this.willDropParachute) {
                    this.isDropping = true;
                } else {
                    this.active = false; // Just disappear if not dropping
                }
            }
        } else {
            this.x -= AIRCRAFT_SPEED;
            if (this.x < 0) {
                // Only enter dropping state if this aircraft will drop a parachute
                if (this.willDropParachute) {
                    this.isDropping = true;
                } else {
                    this.active = false; // Just disappear if not dropping
                }
            }
        }
    }

    draw(ctx) {
        if (this.side === 'left') {
            // Draw plane facing right (for left-to-right movement)
            // Main body
            ctx.fillStyle = GRAY;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width, this.y + this.height/2); // Start at nose
            ctx.quadraticCurveTo(
                this.x + this.width*5/6, this.y, // Control point
                this.x + this.width*2/3, this.y + this.height/4 // End point
            );
            ctx.lineTo(this.x + this.width*0.2, this.y + this.height/4); // Top line
            ctx.lineTo(this.x, this.y + this.height/2); // Back top
            ctx.lineTo(this.x + this.width*0.2, this.y + this.height*0.75); // Back bottom
            ctx.lineTo(this.x + this.width*2/3, this.y + this.height*0.75); // Bottom line
            ctx.quadraticCurveTo(
                this.x + this.width*5/6, this.y + this.height, // Control point
                this.x + this.width, this.y + this.height/2 // Back to nose
            );
            ctx.fill();

            // Cockpit window
            ctx.fillStyle = WHITE;
            ctx.beginPath();
            ctx.ellipse(
                this.x + this.width*0.7, 
                this.y + this.height*0.4,
                this.width*0.15,
                this.height*0.25,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Tail fin
            ctx.fillStyle = GRAY;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width*0.3, this.y + this.height/4);
            ctx.lineTo(this.x + this.width*0.2, this.y - this.height/3);
            ctx.lineTo(this.x + this.width*0.1, this.y + this.height/4);
            ctx.fill();

            // Exhaust flame
            ctx.fillStyle = ORANGE;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height/2);
            ctx.lineTo(this.x - this.width*0.2, this.y + this.height*0.4);
            ctx.lineTo(this.x - this.width*0.1, this.y + this.height/2);
            ctx.lineTo(this.x - this.width*0.2, this.y + this.height*0.6);
            ctx.closePath();
            ctx.fill();

        } else {
            // Draw plane facing left (for right-to-left movement)
            // Main body
            ctx.fillStyle = GRAY;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height/2); // Start at nose
            ctx.quadraticCurveTo(
                this.x + this.width/6, this.y, // Control point
                this.x + this.width/3, this.y + this.height/4 // End point
            );
            ctx.lineTo(this.x + this.width*0.8, this.y + this.height/4); // Top line
            ctx.lineTo(this.x + this.width, this.y + this.height/2); // Back top
            ctx.lineTo(this.x + this.width*0.8, this.y + this.height*0.75); // Back bottom
            ctx.lineTo(this.x + this.width/3, this.y + this.height*0.75); // Bottom line
            ctx.quadraticCurveTo(
                this.x + this.width/6, this.y + this.height, // Control point
                this.x, this.y + this.height/2 // Back to nose
            );
            ctx.fill();

            // Cockpit window
            ctx.fillStyle = WHITE;
            ctx.beginPath();
            ctx.ellipse(
                this.x + this.width*0.3, 
                this.y + this.height*0.4,
                this.width*0.15,
                this.height*0.25,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Tail fin
            ctx.fillStyle = GRAY;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width*0.7, this.y + this.height/4);
            ctx.lineTo(this.x + this.width*0.8, this.y - this.height/3);
            ctx.lineTo(this.x + this.width*0.9, this.y + this.height/4);
            ctx.fill();

            // Exhaust flame
            ctx.fillStyle = ORANGE;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width, this.y + this.height/2);
            ctx.lineTo(this.x + this.width*1.2, this.y + this.height*0.4);
            ctx.lineTo(this.x + this.width*1.1, this.y + this.height/2);
            ctx.lineTo(this.x + this.width*1.2, this.y + this.height*0.6);
            ctx.closePath();
            ctx.fill();
        }

        // If dropping, draw the parachute being released
        if (this.isDropping && !this.hasDroppedParachute) {
            const dropProgress = this.dropTimer / this.dropDuration;
            const parachuteX = this.x + this.width/2;
            const parachuteY = this.y + this.height + (dropProgress * 20);
            
            // Draw small parachute being deployed
            ctx.fillStyle = WHITE;
            ctx.beginPath();
            ctx.arc(parachuteX, parachuteY, 5 + (dropProgress * 10), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Parachute {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 45;
        this.active = true;
        this.canopyHeight = 20;
        this.stringCount = 8;
        
        // New animation states
        this.state = 'falling'; // states: falling, landing, deploying, finished
        this.landingTimer = 0;
        this.landingDuration = 30; // Frames for landing animation
        this.deployTimer = 0;
        this.deployDuration = 45; // Frames for soldier deployment
        this.landedY = SCREEN_HEIGHT - 50; // Landing position
    }

    move() {
        switch(this.state) {
            case 'falling':
                this.y += PARACHUTE_SPEED;
                if (this.y >= this.landedY) {
                    this.y = this.landedY;
                    this.state = 'landing';
                }
                break;
            case 'landing':
                this.landingTimer++;
                if (this.landingTimer >= this.landingDuration) {
                    this.state = 'deploying';
                }
                break;
            case 'deploying':
                this.deployTimer++;
                if (this.deployTimer >= this.deployDuration) {
                    this.state = 'finished';
                    this.active = false;
                }
                break;
        }
    }

    draw(ctx) {
        const landingProgress = this.state === 'landing' ? this.landingTimer / this.landingDuration : 0;
        const deployProgress = this.state === 'deploying' ? this.deployTimer / this.deployDuration : 0;
        
        // Draw the canopy with collapse animation during landing
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        
        if (this.state === 'falling' || this.state === 'landing') {
            // Canopy collapses gradually during landing
            const canopyWidth = this.width * (1 - (landingProgress * 0.3));
            const canopyHeight = this.canopyHeight * (1 - (landingProgress * 0.5));
            
            ctx.moveTo(this.x, this.y + canopyHeight);
            ctx.bezierCurveTo(
                this.x, this.y,
                this.x + canopyWidth, this.y,
                this.x + canopyWidth, this.y + canopyHeight
            );
            ctx.fill();
            
            // Draw strings with slight wave effect
            ctx.strokeStyle = WHITE;
            ctx.lineWidth = 1;
            
            const personX = this.x + this.width/2;
            const personY = this.y + this.height;
            
            for (let i = 0; i <= this.stringCount; i++) {
                ctx.beginPath();
                const startX = this.x + (i * canopyWidth/this.stringCount);
                const startY = this.y + canopyHeight;
                const controlX = startX + Math.sin(Date.now()/200 + i) * 3 * (1 - landingProgress);
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(controlX, (startY + personY)/2, personX, personY);
                ctx.stroke();
            }
        }

        // Draw the person with deployment animation
        const personX = this.x + this.width/2;
        const personY = this.y + this.height;
        
        if (this.state === 'falling' || this.state === 'landing') {
            // Draw hanging person
            ctx.strokeStyle = WHITE;
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(personX, personY - 10);
            ctx.lineTo(personX, personY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(personX - 5, personY - 8);
            ctx.lineTo(personX + 5, personY - 8);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(personX, personY - 5);
            ctx.lineTo(personX - 3, personY);
            ctx.moveTo(personX, personY - 5);
            ctx.lineTo(personX + 3, personY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(personX, personY - 12, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.state === 'deploying') {
            // Draw soldier emerging animation
            const soldier = new Soldier(this.x, this.y + this.height - (deployProgress * 20), this.x < SCREEN_WIDTH/2 ? SCREEN_WIDTH : 0);
            soldier.draw(ctx);
        }
    }
}

class Soldier {
    constructor(x, y, targetX) {
        this.x = x;
        this.y = y;
        this.width = 20;  // Increased size
        this.height = 25; // Increased size
        this.targetX = targetX;
        this.active = true;
        this.headRadius = 6;
        this.bodyHeight = 12;
        this.legLength = 8;
        this.armLength = 6;
        // Direction the soldier is facing
        this.facingLeft = this.x > this.targetX;
    }

    move() {
        if (this.x < this.targetX) {
            this.x += SOLDIER_SPEED;
            this.facingLeft = false;
        } else {
            this.x -= SOLDIER_SPEED;
            this.facingLeft = true;
        }
    }

    draw(ctx) {
        const centerX = this.x + this.width/2;
        
        // Draw body (uniform)
        ctx.fillStyle = LIGHT_GREEN;
        ctx.beginPath();
        ctx.roundRect(
            centerX - 5,
            this.y + this.headRadius * 2,
            10,
            this.bodyHeight,
            2
        );
        ctx.fill();

        // Draw legs
        ctx.fillStyle = DARK_GREEN;
        // Left leg
        ctx.fillRect(
            centerX - 5,
            this.y + this.headRadius * 2 + this.bodyHeight,
            4,
            this.legLength
        );
        // Right leg
        ctx.fillRect(
            centerX + 1,
            this.y + this.headRadius * 2 + this.bodyHeight,
            4,
            this.legLength
        );

        // Draw arms
        ctx.fillStyle = LIGHT_GREEN;
        if (this.facingLeft) {
            // Left arm (holding gun)
            ctx.fillRect(
                centerX - 8,
                this.y + this.headRadius * 2 + 2,
                3,
                this.armLength
            );
            // Gun
            ctx.fillStyle = DARK_GREEN;
            ctx.fillRect(
                centerX - 12,
                this.y + this.headRadius * 2 + 4,
                8,
                2
            );
        } else {
            // Right arm (holding gun)
            ctx.fillRect(
                centerX + 5,
                this.y + this.headRadius * 2 + 2,
                3,
                this.armLength
            );
            // Gun
            ctx.fillStyle = DARK_GREEN;
            ctx.fillRect(
                centerX + 4,
                this.y + this.headRadius * 2 + 4,
                8,
                2
            );
        }

        // Draw head
        ctx.fillStyle = LIGHT_GREEN;
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius, this.headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw helmet
        ctx.fillStyle = HELMET_GREEN;
        ctx.beginPath();
        ctx.arc(centerX, this.y + this.headRadius - 1, this.headRadius, -Math.PI, 0);
        ctx.fill();

        // Draw eyes (big cartoon eyes)
        ctx.fillStyle = WHITE;
        const eyeX = this.facingLeft ? centerX - 2 : centerX + 2;
        ctx.beginPath();
        ctx.arc(eyeX, this.y + this.headRadius, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = BLACK;
        const pupilX = this.facingLeft ? eyeX - 0.5 : eyeX + 0.5;
        ctx.beginPath();
        ctx.arc(pupilX, this.y + this.headRadius, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 2;
        this.maxRadius = 20;
        this.particles = [];
        this.active = true;
        this.duration = 15; // frames the explosion will last
        this.frame = 0;
        
        // Create explosion particles
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12;
            this.particles.push({
                x: this.x,
                y: this.y,
                speedX: Math.cos(angle) * 2,
                speedY: Math.sin(angle) * 2
            });
        }
    }

    update() {
        this.frame++;
        if (this.frame >= this.duration) {
            this.active = false;
            return;
        }

        // Update particles
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
        });
    }

    draw(ctx) {
        // Draw explosion particles
        ctx.fillStyle = YELLOW;
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw center of explosion
        ctx.fillStyle = ORANGE;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + (this.frame / this.duration) * this.maxRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationFrameId = null;  // Track the animation frame
        this.initGame();
    }

    initGame() {
        this.cannon = new Cannon();
        this.bullets = [];
        this.aircrafts = [];
        this.parachutes = [];
        this.soldiers = [];
        this.score = 0;
        this.gameOver = false;
        this.explosions = [];
        this.aircraftSpawnTimer = 0;
        this.nextSpawnDelay = this.getRandomSpawnDelay();
        this.lastSpawnSide = null;

        // Add reload mechanism
        this.bulletCount = 50;
        this.maxBullets = 50;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.reloadDuration = 180;

        // Add counters for soldiers that have reached the cannon
        this.soldiersReachedLeft = 0;
        this.soldiersReachedRight = 0;

        // Set up event listeners (only if they haven't been set up)
        if (!this.hasEventListeners) {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
            document.addEventListener('keyup', this.handleKeyUp.bind(this));
            this.hasEventListeners = true;
        }
        
        this.lastTime = 0;
        // Start animation loop if it's not already running
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    getRandomSpawnDelay() {
        return Math.floor(Math.random() * (MAX_SPAWN_DELAY - MIN_SPAWN_DELAY + 1)) + MIN_SPAWN_DELAY;
    }

    handleKeyDown(event) {
        if (this.gameOver) {
            if (event.key === 'Enter' || event.key === ' ') {
                // Cancel the current animation frame
                if (this.animationFrameId) {
                    cancelAnimationFrame(this.animationFrameId);
                    this.animationFrameId = null;
                }
                // Reset the game
                this.initGame();
                return;
            }
        }
        
        switch(event.key) {
            case 'ArrowLeft':
                this.cannon.move('left');
                break;
            case 'ArrowRight':
                this.cannon.move('right');
                break;
            case ' ':
                this.shoot();
                break;
        }
    }

    handleKeyUp(event) {
        // Add any key release handling if needed
    }

    shoot() {
        if (this.isReloading || this.bulletCount <= 0) return;  // Can't shoot while reloading or out of ammo

        const endX = this.cannon.x + Math.cos(this.cannon.angle * Math.PI / 180) * this.cannon.barrelLength;
        const endY = this.cannon.y - Math.sin(this.cannon.angle * Math.PI / 180) * this.cannon.barrelLength;
        this.bullets.push(new Bullet(endX, endY, this.cannon.angle));
        
        this.bulletCount--;
        
        // Start reloading when out of bullets
        if (this.bulletCount <= 0) {
            this.isReloading = true;
            this.reloadTimer = 0;
        }
    }

    spawnAircraft() {
        // Determine spawn side with bias against repeating the same side
        let side;
        if (this.lastSpawnSide === 'left') {
            side = Math.random() < 0.7 ? 'right' : 'left';  // 70% chance to switch sides
        } else if (this.lastSpawnSide === 'right') {
            side = Math.random() < 0.7 ? 'left' : 'right';  // 70% chance to switch sides
        } else {
            side = Math.random() < 0.5 ? 'left' : 'right';  // First spawn is random
        }
        
        const aircraft = new Aircraft();
        aircraft.side = side;
        aircraft.x = side === 'left' ? -aircraft.width : SCREEN_WIDTH;
        this.aircrafts.push(aircraft);
        this.lastSpawnSide = side;
    }

    checkCollision(bullet, target) {
        return (bullet.x > target.x &&
                bullet.x < target.x + target.width &&
                bullet.y > target.y &&
                bullet.y < target.y + target.height);
    }

    update() {
        if (this.gameOver) return;

        // Handle reloading
        if (this.isReloading) {
            this.reloadTimer++;
            if (this.reloadTimer >= this.reloadDuration) {
                this.isReloading = false;
                this.bulletCount = this.maxBullets;
            }
        }

        // Spawn aircrafts with random timing
        this.aircraftSpawnTimer++;
        if (this.aircraftSpawnTimer >= this.nextSpawnDelay) {
            this.spawnAircraft();
            this.aircraftSpawnTimer = 0;
            this.nextSpawnDelay = this.getRandomSpawnDelay();
        }

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.move();
            return bullet.active;
        });

        // Update aircrafts
        this.aircrafts = this.aircrafts.filter(aircraft => {
            aircraft.move();
            if (aircraft.isDropping && !aircraft.hasDroppedParachute && aircraft.dropTimer >= aircraft.dropDuration/2) {
                if (aircraft.willDropParachute) {
                    this.parachutes.push(new Parachute(aircraft.x + aircraft.width/2 - 20, aircraft.y + aircraft.height));
                    aircraft.hasDroppedParachute = true;
                }
            }
            return aircraft.active;
        });

        // Update parachutes
        this.parachutes = this.parachutes.filter(parachute => {
            parachute.move();
            if (!parachute.active) {
                // If parachute lands on left side of cannon, soldier should move right (target = SCREEN_WIDTH)
                // If parachute lands on right side of cannon, soldier should move left (target = 0)
                const targetX = parachute.x < this.cannon.x ? SCREEN_WIDTH : 0;
                this.soldiers.push(new Soldier(parachute.x, SCREEN_HEIGHT - 50, targetX));
            }
            return parachute.active;
        });

        // Update soldiers and check if they've reached the cannon
        this.soldiers = this.soldiers.filter(soldier => {
            soldier.move();
            
            // Check if soldier has reached the cannon
            const distanceToTarget = Math.abs(soldier.x + soldier.width/2 - this.cannon.x);
            if (distanceToTarget < 5) {  // They've reached the cannon
                // If soldier's target was SCREEN_WIDTH, they came from left side
                // If soldier's target was 0, they came from right side
                if (soldier.targetX === SCREEN_WIDTH) {
                    this.soldiersReachedLeft++;
                } else {
                    this.soldiersReachedRight++;
                }
                return false; // Remove the soldier
            }
            return true;
        });

        // Update explosions
        this.explosions = this.explosions.filter(explosion => {
            explosion.update();
            return explosion.active;
        });

        // Check collisions
        this.bullets.forEach(bullet => {
            // Check aircraft collisions
            this.aircrafts.forEach(aircraft => {
                if (this.checkCollision(bullet, aircraft)) {
                    this.explosions.push(new Explosion(bullet.x, bullet.y));
                    aircraft.wasShot = true;
                    aircraft.active = false;
                    bullet.active = false;
                    this.score++;
                }
            });

            // Check parachute collisions
            this.parachutes.forEach(parachute => {
                if (this.checkCollision(bullet, parachute)) {
                    this.explosions.push(new Explosion(bullet.x, bullet.y));
                    parachute.active = false;
                    bullet.active = false;
                    this.score++;
                }
            });
        });

        // Check game over condition - need 3 soldiers to reach either side
        if (this.soldiersReachedLeft >= 3 || this.soldiersReachedRight >= 3) {
            this.gameOver = true;
        }

        // Update score display
        document.getElementById('score').textContent = `Score: ${this.score}`;
    }

    draw() {
        // Clear canvas with gray background
        this.ctx.fillStyle = BACKGROUND_GRAY;
        this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Draw game objects
        this.cannon.draw(this.ctx);
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.aircrafts.forEach(aircraft => aircraft.draw(this.ctx));
        this.parachutes.forEach(parachute => parachute.draw(this.ctx));
        this.soldiers.forEach(soldier => soldier.draw(this.ctx));
        this.explosions.forEach(explosion => explosion.draw(this.ctx));

        // Draw watermark in top-right corner
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('thought by sajid, made by AI', SCREEN_WIDTH - 10, 20);

        // Draw ammo count and reload status
        this.ctx.fillStyle = WHITE;
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Ammo: ${this.bulletCount}`, 10, 30);

        // Draw soldiers reached count
        this.ctx.fillStyle = WHITE;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Left: ${this.soldiersReachedLeft}/3`, 10, 60);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Right: ${this.soldiersReachedRight}/3`, SCREEN_WIDTH - 10, 60);

        if (this.isReloading) {
            this.ctx.fillStyle = YELLOW;
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('RELOADING...', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 20);
            
            // Draw reload progress bar
            const barWidth = 200;
            const barHeight = 10;
            const progress = this.reloadTimer / this.reloadDuration;
            
            // Draw background bar
            this.ctx.fillStyle = DARK_METAL;
            this.ctx.fillRect(
                SCREEN_WIDTH/2 - barWidth/2,
                SCREEN_HEIGHT - 40,
                barWidth,
                barHeight
            );
            
            // Draw progress
            this.ctx.fillStyle = YELLOW;
            this.ctx.fillRect(
                SCREEN_WIDTH/2 - barWidth/2,
                SCREEN_HEIGHT - 40,
                barWidth * progress,
                barHeight
            );
        }

        // Draw game over message with play again prompt
        if (this.gameOver) {
            this.ctx.fillStyle = RED;
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 40);
            this.ctx.fillStyle = WHITE;
            this.ctx.fillText('Press ENTER or SPACE to Play Again', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 80);
        }
    }

    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update();
        this.draw();

        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 