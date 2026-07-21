import sys
import random
import math
import pygame

# Inisialisasi Pygame
pygame.init()

# Resolusi Layar
WIDTH, HEIGHT = 1000, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.RESIZABLE)
pygame.display.set_caption("Neon Particle Symphony")
clock = pygame.time.Clock()

# --- TEMA WARNA PREMIUM ---
PALETTES = {
    "Cyberpunk Neon": [
        (255, 0, 128),   # Hot Pink
        (0, 240, 255),   # Neon Cyan
        (180, 0, 255),   # Neon Purple
        (255, 160, 0)    # Orange Glow
    ],
    "Aurora Borealis": [
        (0, 255, 150),   # Mint Green
        (0, 200, 255),   # Sky Blue
        (120, 0, 255),   # Violet Purple
        (0, 255, 100)    # Lime Green
    ],
    "Sunset Gold": [
        (255, 60, 0),    # Fiery Red
        (255, 150, 0),   # Orange
        (255, 210, 0),   # Gold
        (255, 100, 150)  # Coral Pink
    ],
    "Deep Ocean": [
        (0, 50, 255),    # Deep Blue
        (0, 180, 255),   # Aqua Blue
        (0, 255, 200),   # Turquoise
        (100, 200, 255)  # Ice Blue
    ]
}

palette_names = list(PALETTES.keys())
current_palette_idx = 0

# --- KELAS PARTIKEL ---
class Particle:
    def __init__(self, x, y, color):
        self.x = float(x)
        self.y = float(y)
        self.color = color
        
        # Kecepatan acak awal
        angle = random.uniform(0, math.pi * 2)
        speed = random.uniform(1.0, 4.0)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed
        
        # Karakteristik fisik
        self.radius = random.uniform(2.0, 5.0)
        self.life = 255.0
        self.decay = random.uniform(1.5, 3.5)
        
    def update(self, mouse_pos, clicked_left, clicked_right):
        self.vx *= 0.98
        self.vy *= 0.98
        
        mx, my = mouse_pos
        dx = mx - self.x
        dy = my - self.y
        dist = math.sqrt(dx*dx + dy*dy)
        
        if dist < 400 and dist > 5:
            force = 0.0
            if clicked_left:
                force = (400 - dist) / 1200.0
            elif clicked_right:
                force = -(400 - dist) / 300.0
            else:
                force = (400 - dist) / 5000.0
                
            self.vx += (dx / dist) * force
            self.vy += (dy / dist) * force

        self.x += self.vx
        self.y += self.vy
        
        width, height = pygame.display.get_surface().get_size()
        if self.x < 0 or self.x > width:
            self.vx *= -1
            self.x = max(0, min(self.x, width))
        if self.y < 0 or self.y > height:
            self.vy *= -1
            self.y = max(0, min(self.y, height))
            
        self.life -= self.decay

    def draw(self, surface):
        if self.life > 0:
            alpha = int(self.life)
            r, g, b = self.color
            
            size = int(self.radius * 2)
            if size < 2:
                size = 2
                
            temp_surf = pygame.Surface((size * 2, size * 2), pygame.SRCALPHA)
            pygame.draw.circle(temp_surf, (r, g, b, alpha // 3), (size, size), size)
            pygame.draw.circle(temp_surf, (255, 255, 255, alpha), (size, size), max(1, size // 2))
            
            surface.blit(temp_surf, (int(self.x - size), int(self.y - size)))

# --- DAFTAR PARTIKEL ---
particles = []

def get_current_colors():
    return PALETTES[palette_names[current_palette_idx]]

# Buat partikel acak awal
colors = get_current_colors()
for _ in range(200):
    particles.append(Particle(random.randint(0, WIDTH), random.randint(0, HEIGHT), random.choice(colors)))

# Loop Utama Program
running = True

while running:
    W, H = screen.get_size()
    
    # Efek Motion Blur Trails (Latar Belakang Gelap Murni)
    trail_surf = pygame.Surface((W, H), pygame.SRCALPHA)
    trail_surf.fill((10, 10, 18, 20))  # Dark Navy background
    screen.blit(trail_surf, (0, 0))

    mouse_pos = pygame.mouse.get_pos()
    mouse_buttons = pygame.mouse.get_pressed()
    clicked_left = mouse_buttons[0]
    clicked_right = mouse_buttons[2]

    # Handler Event
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                current_palette_idx = (current_palette_idx + 1) % len(palette_names)
            elif event.key == pygame.K_c:
                particles.clear()
            elif event.key == pygame.K_ESCAPE:
                running = False

    # Spawning Partikel Baru
    colors = get_current_colors()
    if mouse_buttons[0] or mouse_buttons[2]:
        for _ in range(5):
            particles.append(Particle(mouse_pos[0], mouse_pos[1], random.choice(colors)))
    elif random.random() < 0.3:
        particles.append(Particle(mouse_pos[0], mouse_pos[1], random.choice(colors)))

    # Update dan Gambar Partikel
    for p in particles[:]:
        p.update(mouse_pos, clicked_left, clicked_right)
        if p.life <= 0:
            particles.remove(p)
        else:
            p.draw(screen)

    # Optimasi Jumlah Partikel
    if len(particles) > 1500:
        particles = particles[-1500:]

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()