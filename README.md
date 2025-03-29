# 90s Style Shooting Game

A classic 2D shooting game inspired by retro arcade games. Defend your position from incoming aircraft and soldiers!

## Requirements
- Python 3.x
- Pygame 2.5.2

## Installation
1. Clone this repository
2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## How to Play
Run the game:
```bash
python game.py
```

### Controls
- **Left Arrow**: Move cannon left (30-150 degrees)
- **Right Arrow**: Move cannon right (30-150 degrees)
- **Space**: Shoot bullets

### Game Rules
- Aircraft will spawn from either side of the screen
- Shoot down aircraft to score points
- If an aircraft reaches the end of the screen, it drops a parachute
- Shoot the parachutes before they reach the ground
- If a parachute reaches the ground, a soldier will emerge
- Soldiers will walk towards your cannon
- If 3 soldiers reach your cannon from either side, the game is over
- Your score is based on the number of aircraft and parachutes you shoot down

## Game Over
The game ends when 3 soldiers reach your cannon from either side. Try to achieve the highest score possible!
