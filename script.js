// ===== Ink Particle Background =====
class InkBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        const count = window.innerWidth < 768 ? 20 : 35;
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: Math.random() * 120 + 40,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.03 + 0.01,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.3 + 0.2
        };
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    drawInkBlob(p, time) {
        const { ctx } = this;
        const pulse = Math.sin(time * p.speed + p.phase) * 0.08 + 1;
        const r = p.radius * pulse;

        ctx.save();
        ctx.globalAlpha = p.opacity;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        gradient.addColorStop(0, 'rgba(40, 40, 50, 0.5)');
        gradient.addColorStop(0.3, 'rgba(40, 40, 50, 0.2)');
        gradient.addColorStop(0.7, 'rgba(40, 40, 50, 0.05)');
        gradient.addColorStop(1, 'rgba(40, 40, 50, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();

        const points = 10;
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const variance = Math.sin(angle * 3 + time * p.speed + p.phase) * 20;
            const dist = r + variance;
            const x = p.x + Math.cos(angle) * dist;
            const y = p.y + Math.sin(angle) * dist;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevAngle = ((i - 1) / points) * Math.PI * 2;
                const prevVariance = Math.sin(prevAngle * 3 + time * p.speed + p.phase) * 20;
                const prevDist = r + prevVariance;
                const prevX = p.x + Math.cos(prevAngle) * prevDist;
                const prevY = p.y + Math.sin(prevAngle) * prevDist;
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                ctx.quadraticCurveTo(prevX, prevY, x, y);
            }
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    animate(time = 0) {
        time *= 0.001;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            // Mouse repulsion
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
                const force = (250 - dist) / 250 * 0.3;
                p.vx += (dx / dist) * force;
                p.vy += (dy / dist) * force;
            }

            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.995;
            p.vy *= 0.995;

            // Boundary wrap
            if (p.x < -200) p.x = this.canvas.width + 200;
            if (p.x > this.canvas.width + 200) p.x = -200;
            if (p.y < -200) p.y = this.canvas.height + 200;
            if (p.y > this.canvas.height + 200) p.y = -200;

            this.drawInkBlob(p, time);
        });

        requestAnimationFrame((t) => this.animate(t));
    }
}

// ===== Scroll Reveal =====
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('[data-reveal]');
        this.observer = new IntersectionObserver(
            (entries) => this.handleEntries(entries),
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
        );
        this.init();
    }

    init() {
        this.elements.forEach(el => this.observer.observe(el));
    }

    handleEntries(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// ===== Navigation =====
class Navigation {
    constructor() {
        this.nav = document.getElementById('nav');
        this.links = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
        this.links.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 100) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }

        // Update active link
        this.sections.forEach(section => {
            const top = section.offsetTop - 200;
            const bottom = top + section.offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                const id = section.getAttribute('id');
                this.links.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }

    handleClick(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }
}

// ===== Loader =====
class Loader {
    constructor() {
        this.loader = document.getElementById('loader');
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.loader.classList.add('hidden');
            }, 2500);
        });
    }
}

// ===== Sword Animation =====
class SwordAnimation {
    constructor() {
        this.sword = document.getElementById('swordBlade');
        this.container = document.getElementById('swordContainer');
        this.init();
    }

    init() {
        if (!this.sword) return;

        // Mouse parallax
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const x = (clientX - innerWidth / 2) / innerWidth * 10;
            const y = (clientY - innerHeight / 2) / innerHeight * 10;
            this.sword.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
}

// ===== Ink Splashes =====
class InkSplashes {
    constructor() {
        this.container = document.getElementById('inkSplashes');
        this.init();
    }

    init() {
        if (!this.container) return;

        // Create ink splash elements
        for (let i = 0; i < 5; i++) {
            this.createSplash(i);
        }
    }

    createSplash(index) {
        const splash = document.createElement('div');
        splash.className = 'ink-splash-item';
        splash.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: var(--accent);
            opacity: 0.05;
            filter: blur(20px);
            animation: splashFloat ${4 + index}s ease-in-out infinite;
            animation-delay: ${index * 0.5}s;
        `;
        const size = 100 + Math.random() * 200;
        splash.style.width = `${size}px`;
        splash.style.height = `${size}px`;
        splash.style.left = `${Math.random() * 100}%`;
        splash.style.top = `${Math.random() * 100}%`;
        this.container.appendChild(splash);
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    // Loader
    new Loader();

    // Ink Background
    const canvas = document.getElementById('ink-canvas');
    if (canvas) new InkBackground(canvas);

    // Scroll Reveal
    new ScrollReveal();

    // Navigation
    new Navigation();

    // Sword Animation
    new SwordAnimation();

    // Ink Splashes
    new InkSplashes();
});

// ===== Add splash animation keyframes =====
const splashStyle = document.createElement('style');
splashStyle.textContent = `
    @keyframes splashFloat {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(10px, -10px) scale(1.1); }
        50% { transform: translate(-5px, 5px) scale(0.95); }
        75% { transform: translate(5px, 5px) scale(1.05); }
    }
`;
document.head.appendChild(splashStyle);
