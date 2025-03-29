import pygame
import random
import math

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLUE = (0, 0, 255)

# Game settings
CANNON_SPEED = 2
BULLET_SPEED = 7
AIRCRAFT_SPEED = 3
PARACHUTE_SPEED = 2
SOLDIER_SPEED = 1

class Cannon:
    def __init__(self):
        self.angle = 90  # Start at 90 degrees (pointing up)
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT - 50
        self.base_width = 40
        self.base_height = 20
        self.barrel_length = 40

    def move(self, direction):
        if direction == 'left' and self.angle < 150:
            self.angle += CANNON_SPEED
        elif direction == 'right' and self.angle > 30:
            self.angle -= CANNON_SPEED

    def draw(self, screen):
        # Draw cannon base
        pygame.draw.rect(screen, BLUE, 
                        (self.x - self.base_width//2, 
                         self.y - self.base_height//2,
                         self.base_width, 
                         self.base_height))
        
        # Draw cannon barrel
        end_x = self.x + math.cos(math.radians(self.angle)) * self.barrel_length
        end_y = self.y - math.sin(math.radians(self.angle)) * self.barrel_length
        pygame.draw.line(screen, BLUE, (self.x, self.y), (end_x, end_y), 10)

class Bullet:
    def __init__(self, x, y, angle):
        self.x = x
        self.y = y
        self.angle = angle
        self.radius = 5
        self.active = True

    def move(self):
        self.x += math.cos(math.radians(self.angle)) * BULLET_SPEED
        self.y -= math.sin(math.radians(self.angle)) * BULLET_SPEED
        if self.y < 0:
            self.active = False

    def draw(self, screen):
        pygame.draw.circle(screen, RED, (int(self.x), int(self.y)), self.radius)

class Aircraft:
    def __init__(self):
        self.width = 30
        self.height = 20
        self.side = random.choice(['left', 'right'])
        if self.side == 'left':
            self.x = -self.width
        else:
            self.x = SCREEN_WIDTH
        self.y = 50
        self.active = True
        self.has_dropped_parachute = False

    def move(self):
        if self.side == 'left':
            self.x += AIRCRAFT_SPEED
        else:
            self.x -= AIRCRAFT_SPEED
        
        if (self.side == 'left' and self.x > SCREEN_WIDTH) or \
           (self.side == 'right' and self.x < -self.width):
            self.active = False

    def draw(self, screen):
        pygame.draw.rect(screen, WHITE, 
                        (self.x, self.y, self.width, self.height))

class Parachute:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 20
        self.height = 30
        self.active = True

    def move(self):
        self.y += PARACHUTE_SPEED
        if self.y > SCREEN_HEIGHT:
            self.active = False

    def draw(self, screen):
        pygame.draw.rect(screen, WHITE, 
                        (self.x, self.y, self.width, self.height))

class Soldier:
    def __init__(self, x, y, target_x):
        self.x = x
        self.y = y
        self.width = 15
        self.height = 20
        self.target_x = target_x
        self.active = True

    def move(self):
        if self.x < self.target_x:
            self.x += SOLDIER_SPEED
        else:
            self.x -= SOLDIER_SPEED

    def draw(self, screen):
        pygame.draw.rect(screen, WHITE, 
                        (self.x, self.y, self.width, self.height))

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("90s Style Shooting Game")
        self.clock = pygame.time.Clock()
        self.cannon = Cannon()
        self.bullets = []
        self.aircrafts = []
        self.parachutes = []
        self.soldiers = []
        self.score = 0
        self.game_over = False
        self.aircraft_spawn_timer = 0
        self.aircraft_spawn_delay = 60  # Frames between aircraft spawns

    def spawn_aircraft(self):
        self.aircrafts.append(Aircraft())

    def check_collision(self, bullet, target):
        return (bullet.x > target.x and 
                bullet.x < target.x + target.width and 
                bullet.y > target.y and 
                bullet.y < target.y + target.height)

    def run(self):
        running = True
        while running:
            # Event handling
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE and not self.game_over:
                        # Shoot bullet
                        end_x = self.cannon.x + math.cos(math.radians(self.cannon.angle)) * self.cannon.barrel_length
                        end_y = self.cannon.y - math.sin(math.radians(self.cannon.angle)) * self.cannon.barrel_length
                        self.bullets.append(Bullet(end_x, end_y, self.cannon.angle))

            if not self.game_over:
                # Handle continuous key presses
                keys = pygame.key.get_pressed()
                if keys[pygame.K_LEFT]:
                    self.cannon.move('left')
                if keys[pygame.K_RIGHT]:
                    self.cannon.move('right')

                # Spawn aircrafts
                self.aircraft_spawn_timer += 1
                if self.aircraft_spawn_timer >= self.aircraft_spawn_delay:
                    self.spawn_aircraft()
                    self.aircraft_spawn_timer = 0

                # Update bullets
                for bullet in self.bullets[:]:
                    bullet.move()
                    if not bullet.active:
                        self.bullets.remove(bullet)

                # Update aircrafts
                for aircraft in self.aircrafts[:]:
                    aircraft.move()
                    if not aircraft.active:
                        self.aircrafts.remove(aircraft)
                        if not aircraft.has_dropped_parachute:
                            self.parachutes.append(Parachute(aircraft.x, aircraft.y))
                            aircraft.has_dropped_parachute = True

                # Update parachutes
                for parachute in self.parachutes[:]:
                    parachute.move()
                    if not parachute.active:
                        self.parachutes.remove(parachute)
                        self.soldiers.append(Soldier(parachute.x, SCREEN_HEIGHT - 50, self.cannon.x))

                # Update soldiers
                for soldier in self.soldiers[:]:
                    soldier.move()
                    if abs(soldier.x - self.cannon.x) < 10:
                        self.soldiers.remove(soldier)

                # Check collisions
                for bullet in self.bullets[:]:
                    # Check aircraft collisions
                    for aircraft in self.aircrafts[:]:
                        if self.check_collision(bullet, aircraft):
                            self.aircrafts.remove(aircraft)
                            self.bullets.remove(bullet)
                            self.score += 1
                            break

                    # Check parachute collisions
                    for parachute in self.parachutes[:]:
                        if self.check_collision(bullet, parachute):
                            self.parachutes.remove(parachute)
                            self.bullets.remove(bullet)
                            self.score += 1
                            break

                # Check game over condition
                soldiers_left = len([s for s in self.soldiers if s.x < self.cannon.x])
                soldiers_right = len([s for s in self.soldiers if s.x > self.cannon.x])
                if soldiers_left >= 3 or soldiers_right >= 3:
                    self.game_over = True

            # Draw everything
            self.screen.fill(BLACK)
            
            # Draw game objects
            self.cannon.draw(self.screen)
            for bullet in self.bullets:
                bullet.draw(self.screen)
            for aircraft in self.aircrafts:
                aircraft.draw(self.screen)
            for parachute in self.parachutes:
                parachute.draw(self.screen)
            for soldier in self.soldiers:
                soldier.draw(self.screen)

            # Draw score
            font = pygame.font.Font(None, 36)
            score_text = font.render(f'Score: {self.score}', True, WHITE)
            self.screen.blit(score_text, (10, 10))

            # Draw game over message
            if self.game_over:
                game_over_text = font.render('GAME OVER!', True, RED)
                text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
                self.screen.blit(game_over_text, text_rect)

            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()

if __name__ == "__main__":
    game = Game()
    game.run() 