/* ─────────────────────────────────────────────────────────
   CONTROL TEE — Animations v3
   Preloader · Scramble · Reveal · Parallax · Magnetic
   Grain Overlay · Underline Draw · Folder Open · Cursor Trail
───────────────────────────────────────────────────────── */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── SCRAMBLE ENGINE ────────────────────────────────── */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@!?%$*';

function scrambleText(el, onComplete) {
    if (prefersReducedMotion) { el.style.opacity = '1'; if (onComplete) onComplete(); return; }
    const text = el.textContent.trim();
    el.style.opacity = '1';
    let frame = 0, raf;

    function tick() {
        let html = '', allDone = true;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (ch === ' ') { html += ' '; continue; }
            const resolveAt = Math.floor(i * 1.6) + 12;
            if (frame >= resolveAt) {
                html += `<span class="scramble-char">${ch}</span>`;
            } else {
                allDone = false;
                const rand = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
                html += `<span class="scramble-char resolving">${rand}</span>`;
            }
        }
        el.innerHTML = html;
        if (allDone) { if (onComplete) onComplete(); }
        else { frame++; raf = requestAnimationFrame(tick); }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
}

/* ── TYPEWRITER ─────────────────────────────────────── */
function typeWriter(el, text, speed, onComplete) {
    if (prefersReducedMotion) { el.textContent = text; if (onComplete) onComplete(); return; }
    let i = 0;
    el.textContent = '';
    function type() {
        if (i < text.length) { el.textContent += text.charAt(i); i++; setTimeout(type, speed); }
        else { if (onComplete) onComplete(); }
    }
    type();
}

/* ── GRAIN OVERLAY ──────────────────────────────────── */
(function () {
    if (prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.width  = 256;
    canvas.height = 256;
    canvas.style.cssText = `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 99998;
        opacity: 0.032;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function generateNoise() {
        const imageData = ctx.createImageData(256, 256);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i]     = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    let frame = 0;
    (function animateGrain() {
        frame++;
        if (frame % 3 === 0) generateNoise(); /* refresh every 3 frames ~20fps */
        requestAnimationFrame(animateGrain);
    })();
})();

/* ── PRELOADER ──────────────────────────────────────── */
(function () {
    const preloader = document.querySelector('.preloader');
    if (!preloader) { triggerHeroReveal(); return; }

    const counter = preloader.querySelector('.preloader-counter');
    const fill    = preloader.querySelector('.preloader-bar-fill');
    const tagline = preloader.querySelector('.preloader-tagline');
    let count = 0, taglineStarted = false, taglineCompleted = false, counterCompleted = false;

    function tryDismiss() {
        if (!counterCompleted || !taglineCompleted) return;
        preloader.classList.add('complete');
        setTimeout(() => {
            preloader.classList.add('done');
            setTimeout(triggerHeroReveal, 220);
        }, 620);
    }

    function step() {
        count = Math.min(count + Math.floor(Math.random() * 4) + 1, 100);
        if (counter) counter.textContent = count + '%';
        if (fill)    fill.style.width    = count + '%';

        if (count >= 35 && !taglineStarted && tagline) {
            taglineStarted = true;
            typeWriter(tagline, 'Entering the creative space...', 65, () => {
                taglineCompleted = true;
                tryDismiss();
            });
        }

        if (count < 100) {
            setTimeout(step, Math.random() * 60 + 45);
        } else {
            counterCompleted = true;
            tryDismiss();
        }
    }

    setTimeout(step, 350);
})();

/* ── HERO REVEAL ────────────────────────────────────── */
function triggerHeroReveal() {
    const logo     = document.querySelector('.hero-logo');
    const title    = document.querySelector('.hero-title[data-scramble]');
    const subtitle = document.querySelector('.hero-subtitle');
    const btn      = document.querySelector('.hero-content .btn');

    if (logo) setTimeout(() => logo.classList.add('visible'), 80);
    if (title) {
        setTimeout(() => {
            scrambleText(title, () => {
                if (subtitle) subtitle.classList.add('visible');
                if (btn)      setTimeout(() => btn.classList.add('visible'), 120);
            });
        }, 320);
    } else {
        if (subtitle) setTimeout(() => subtitle.classList.add('visible'), 400);
        if (btn)      setTimeout(() => btn.classList.add('visible'), 560);
    }
}

/* ── SCROLL SCRAMBLE ────────────────────────────────── */
(function () {
    const targets = document.querySelectorAll('[data-scramble]:not(.hero-title)');
    if (!targets.length) return;
    const seen = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || seen.has(entry.target)) return;
            seen.add(entry.target);
            scrambleText(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.25 });
    targets.forEach(el => observer.observe(el));
})();

/* ── SCROLL REVEAL ──────────────────────────────────── */
(function () {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(entry.target.dataset.delay || 0, 10);
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
})();

/* ── SECTION TITLE UNDERLINE DRAW ───────────────────── */
(function () {
    if (prefersReducedMotion) return;

    const titles = document.querySelectorAll('.section-title');
    if (!titles.length) return;

    /* Inject the draw styles once */
    const style = document.createElement('style');
    style.textContent = `
        .section-title {
            position: relative;
            border-bottom: none !important;
            padding-bottom: 16px;
        }
        .section-title::after {
            content: '';
            position: absolute;
            bottom: 0; left: 0;
            height: 2px;
            width: 0%;
            background: #0e4c0b;
            transition: width 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .section-title.line-drawn::after {
            width: 100%;
        }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            setTimeout(() => entry.target.classList.add('line-drawn'), 200);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.4 });

    titles.forEach(el => observer.observe(el));
})();

/* ── STAT COUNT-UP ──────────────────────────────────── */
(function () {
    if (prefersReducedMotion) return;
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const el      = entry.target;
            const rawText = el.textContent.trim();
            const suffix  = rawText.replace(/[\d]/g, '');
            const target  = parseInt(rawText.replace(/\D/g, ''), 10);
            if (isNaN(target)) return;

            const duration = 1400;
            const start    = performance.now();
            function update(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased    = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target) + suffix;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }, { threshold: 0.6 });
    stats.forEach(el => observer.observe(el));
})();

/* ── 3D FOLDER HOVER ────────────────────────────────── */
(function () {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.folder-card').forEach(card => {
        const inner = card.querySelector('.folder-inner');
        if (!inner) return;
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width  - 0.5;
            const y = (e.clientY - r.top)  / r.height - 0.5;
            inner.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg) scale(1.04)`;
        });
        card.addEventListener('mouseleave', () => {
            inner.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
            inner.style.transform  = 'rotateY(0deg) rotateX(0deg) scale(1)';
            setTimeout(() => { inner.style.transition = ''; }, 450);
        });
    });
})();

/* ── FOLDER OPEN ON CLICK ───────────────────────────── */
(function () {
    if (prefersReducedMotion) return;

    /* Inject folder-open keyframe styles */
    const style = document.createElement('style');
    style.textContent = `
        .folder-card.opening .folder-icon {
            border-color: #f7d54f !important;
            box-shadow: 0 0 40px rgba(247,213,79,0.35) !important;
            transition: all 0.3s ease !important;
        }
        .folder-card.opening .folder-icon::before {
            border-color: #f7d54f !important;
            transform: rotate(-18deg) translateX(4px) !important;
            transform-origin: bottom left !important;
            transition: all 0.3s ease !important;
        }
        .folder-card.opening .folder-icon::after {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(247,213,79,0.08);
            border-radius: 2px;
            animation: folderFill 0.3s ease forwards;
        }
        @keyframes folderFill {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        .folder-card.opening .folder-title {
            color: #f7d54f !important;
        }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('.folder-card').forEach(card => {
        card.addEventListener('click', e => {
            const href = card.getAttribute('href');
            if (!href) return;
            e.preventDefault();

            card.classList.add('opening');

            /* Let the folder animate open for 380ms then navigate */
            setTimeout(() => {
                window.location.href = href;
            }, 380);
        });
    });
})();

/* ── MAGNETIC BUTTONS ───────────────────────────────── */
(function () {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r    = btn.getBoundingClientRect();
            const dx   = e.clientX - (r.left + r.width  / 2);
            const dy   = e.clientY - (r.top  + r.height / 2);
            btn.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)';
            btn.style.transform  = '';
            setTimeout(() => { btn.style.transition = ''; }, 550);
        });
    });
})();

/* ── HERO PARALLAX ──────────────────────────────────── */
(function () {
    if (prefersReducedMotion) return;
    const heroVideo   = document.querySelector('.hero-video');
    const heroContent = document.querySelector('.hero-content');
    if (!heroVideo && !heroContent) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const vh      = window.innerHeight;
            if (scrollY > vh) { ticking = false; return; }
            const progress = scrollY / vh;
            if (heroVideo)   heroVideo.style.transform   = `translate(-50%, calc(-50% + ${scrollY * 0.25}px))`;
            if (heroContent) {
                heroContent.style.transform = `translateY(${scrollY * 0.18}px)`;
                heroContent.style.opacity   = `${1 - progress * 1.6}`;
            }
            ticking = false;
        });
        ticking = true;
    }, { passive: true });
})();

/* ── CURSOR TRAIL ───────────────────────────────────── */
(function () {
    if (prefersReducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const DOT_COUNT = 8;
    const dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: ${6 - i * 0.5}px;
            height: ${6 - i * 0.5}px;
            border-radius: 50%;
            background: #f7d54f;
            pointer-events: none;
            z-index: 99997;
            opacity: ${(1 - i / DOT_COUNT) * 0.55};
            transform: translate(-50%, -50%);
            will-change: left, top;
        `;
        document.body.appendChild(dot);
        dots.push({ el: dot, x: 0, y: 0 });
    }

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    (function animateTrail() {
        let px = mouseX, py = mouseY;
        dots.forEach((dot, i) => {
            const ease = 0.25 - i * 0.02;
            dot.x += (px - dot.x) * ease;
            dot.y += (py - dot.y) * ease;
            dot.el.style.left = dot.x + 'px';
            dot.el.style.top  = dot.y + 'px';
            px = dot.x; py = dot.y;
        });
        requestAnimationFrame(animateTrail);
    })();

    document.addEventListener('mouseleave', () => dots.forEach(d => d.el.style.opacity = '0'));
    document.addEventListener('mouseenter', () => dots.forEach((d, i) => d.el.style.opacity = `${(1 - i / DOT_COUNT) * 0.55}`));
})();

/* ── CURTAIN WIPE PAGE TRANSITION ───────────────────── */
(function () {
    const hasPreloader = document.querySelector('.preloader') !== null;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100vh;
        background-color: #000000;
        z-index: 8999;
        pointer-events: none;
        transform: translateY(${hasPreloader ? '-100%' : '0'});
        transition: transform 0.85s cubic-bezier(0.76, 0, 0.24, 1);
    `;
    document.body.appendChild(overlay);

    if (!hasPreloader) {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            overlay.style.transform = 'translateY(-100%)';
        }));
    }

    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            overlay.style.transition = 'none';
            overlay.style.transform  = 'translateY(-100%)';
        }
    });

    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto') ||
                href.startsWith('tel') || href.startsWith('http') || href.startsWith('//') ||
                link.hasAttribute('target')) return;

            e.preventDefault();
            overlay.style.transition = 'none';
            overlay.style.transform  = 'translateY(100%)';
            void overlay.offsetWidth;
            overlay.style.transition = 'transform 0.85s cubic-bezier(0.76, 0, 0.24, 1)';
            overlay.style.transform  = 'translateY(0)';
            setTimeout(() => { window.location.href = href; }, 800);
        });
    });
})();

/* ── HORIZONTAL SCROLL SLIDER (GSAP) ───────────────── */
(function () {
    if (typeof gsap === 'undefined') return;
    const containers = document.querySelectorAll('.slider-container');
    if (!containers.length) return;
    gsap.registerPlugin(ScrollTrigger);
    containers.forEach(container => {
        const track = container.querySelector('.horizontal-track');
        if (!track) return;
        const getScrollAmount = () => {
            const amount = track.scrollWidth - window.innerWidth + 80;
            return amount > 0 ? -amount : 0;
        };
        gsap.to(track, {
            x: getScrollAmount,
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: () => '+=' + (Math.abs(getScrollAmount()) * 1.5),
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    });
})();
