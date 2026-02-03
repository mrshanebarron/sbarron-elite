// ==========================================
// VISION ELITE — Master Orchestrator
// GSAP + Lenis + ScrollTrigger
// ==========================================

(function() {
    'use strict';

    // ---- Register GSAP Plugins ----
    gsap.registerPlugin(ScrollTrigger);

    // ---- Lenis Smooth Scroll ----
    var lenis = new Lenis({
        duration: 1.2,
        easing: function(t) {
            return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        orientation: 'vertical',
        smoothWheel: true
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // ---- Text Splitting Utility ----
    function splitTextIntoChars(el) {
        var text = el.textContent;
        el.innerHTML = '';
        el.setAttribute('aria-label', text);
        var chars = [];
        for (var i = 0; i < text.length; i++) {
            var span = document.createElement('span');
            span.className = 'char';
            span.style.display = 'inline-block';
            span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
            span.setAttribute('aria-hidden', 'true');
            el.appendChild(span);
            chars.push(span);
        }
        return chars;
    }

    // ---- Loading Sequence ----
    function initLoader() {
        var loader = document.getElementById('loader');
        if (!loader) return Promise.resolve();

        return new Promise(function(resolve) {
            // Let fonts load, then animate out
            var delay = document.fonts ? document.fonts.ready : Promise.resolve();
            delay.then(function() {
                setTimeout(function() {
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power2.inOut',
                        onComplete: function() {
                            loader.classList.add('hidden');
                            loader.style.display = 'none';
                            resolve();
                        }
                    });
                }, 800); // Brief pause for effect
            });
        });
    }

    // ---- Hero Animations ----
    function initHero() {
        // Split "Vision." text
        var heroName = document.querySelector('.hero__name');
        if (heroName) {
            var chars = splitTextIntoChars(heroName);

            // Set initial state
            gsap.set(chars, {
                opacity: 0,
                y: 40,
                rotateX: -90
            });

            // Reveal characters
            gsap.to(chars, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                stagger: 0.04,
                duration: 0.8,
                ease: 'back.out(1.7)',
                delay: 0.3
            });
        }

        // Fade in greeting + tagline
        gsap.from('.hero__greeting', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: 0.1,
            ease: 'power2.out'
        });

        gsap.from('.hero__tagline', {
            opacity: 0,
            y: 20,
            duration: 0.6,
            delay: 0.8,
            ease: 'power2.out'
        });

        // Stats bar
        gsap.from('.hero__stats', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            delay: 1.0,
            ease: 'power2.out'
        });

        // Eye fly-in
        gsap.from('.vision-eye', {
            scale: 0.5,
            opacity: 0,
            rotation: -180,
            duration: 1.5,
            ease: 'expo.out'
        });

        // Hero pin — eye shrinks on scroll
        ScrollTrigger.create({
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            onUpdate: function(self) {
                var progress = self.progress;

                // Fade out hero content
                gsap.set('.hero__content', {
                    opacity: 1 - progress * 1.5,
                    y: -progress * 50
                });

                gsap.set('.hero__stats', {
                    opacity: 1 - progress * 2
                });

                gsap.set('.hero__scroll-hint', {
                    opacity: Math.max(0, 0.4 - progress * 3)
                });

                // Show peeking eye after hero
                if (window.VisionEye) {
                    if (progress > 0.6) {
                        window.VisionEye.showPeekingEye();
                    } else {
                        window.VisionEye.hidePeekingEye();
                    }
                }
            }
        });
    }

    // ---- Section Heading Animations ----
    function initSectionHeadings() {
        document.querySelectorAll('.section__title[data-split]').forEach(function(el) {
            // Don't re-split the hero name
            if (el.classList.contains('hero__name')) return;

            var chars = splitTextIntoChars(el);

            gsap.set(chars, { opacity: 0, y: 30, rotateX: -60 });

            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: function() {
                    gsap.to(chars, {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        stagger: 0.02,
                        duration: 0.6,
                        ease: 'back.out(1.7)'
                    });
                }
            });
        });

        // Section numbers slide in
        document.querySelectorAll('.section__num').forEach(function(el) {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                x: -30,
                duration: 0.6,
                ease: 'power2.out'
            });
        });

        // Section subtitles fade in
        document.querySelectorAll('.section__subtitle').forEach(function(el) {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.6,
                delay: 0.2,
                ease: 'power2.out'
            });
        });
    }

    // ---- Content Reveals ----
    function initContentReveals() {
        // Human section paragraphs
        document.querySelectorAll('.human__content p, .human__content .lead-text').forEach(function(el, i) {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                y: 25,
                duration: 0.6,
                delay: i * 0.1,
                ease: 'power2.out'
            });
        });

        // Video frame
        gsap.from('.human__video-frame', {
            scrollTrigger: {
                trigger: '.human__video-frame',
                start: 'top 85%',
                once: true
            },
            opacity: 0,
            y: 30,
            scale: 0.95,
            duration: 0.8,
            ease: 'power2.out'
        });

        // Contact content
        document.querySelectorAll('.contact__content > *').forEach(function(el, i) {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                y: 20,
                duration: 0.6,
                delay: i * 0.1,
                ease: 'power2.out'
            });
        });
    }

    // ---- Capability Cards ----
    function initCapabilityCards() {
        document.querySelectorAll('.capability-card').forEach(function(card, i) {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                y: 40,
                duration: 0.6,
                delay: i * 0.1,
                ease: 'power2.out'
            });

            // 3D tilt on hover
            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(card, {
                    rotateY: x * 8,
                    rotateX: -y * 8,
                    transformPerspective: 800,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', function() {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }

    // ---- Demo Cards ----
    function initDemoCards() {
        document.querySelectorAll('.demo-card').forEach(function(card, i) {
            var img = card.querySelector('img');

            // Reveal on scroll
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true
                },
                opacity: 0,
                y: 50,
                duration: 0.7,
                delay: i * 0.08,
                ease: 'power2.out'
            });

            // Parallax on image
            if (img) {
                gsap.to(img, {
                    yPercent: -10,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }

            // 3D tilt on hover
            card.addEventListener('mousemove', function(e) {
                var rect = card.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width - 0.5;
                var y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(card, {
                    rotateY: x * 10,
                    rotateX: -y * 10,
                    transformPerspective: 1000,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', function() {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }

    // ---- Arrangement Section ----
    function initArrangement() {
        // Offer box
        gsap.from('.offer-box', {
            scrollTrigger: {
                trigger: '.offer-box',
                start: 'top 85%',
                once: true
            },
            opacity: 0,
            y: 30,
            duration: 0.7,
            ease: 'power2.out'
        });

        // Pricing columns
        var agencyCol = document.querySelector('.pricing-column--agency');
        var usCol = document.querySelector('.pricing-column--us');

        if (agencyCol) {
            gsap.from(agencyCol, {
                scrollTrigger: {
                    trigger: '.pricing-comparison',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                x: -50,
                duration: 0.7,
                ease: 'power2.out'
            });
        }

        if (usCol) {
            gsap.from(usCol, {
                scrollTrigger: {
                    trigger: '.pricing-comparison',
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                x: 50,
                duration: 0.7,
                delay: 0.15,
                ease: 'power2.out'
            });
        }
    }

    // ---- Stat Counter Animation ----
    function initStatCounters() {
        document.querySelectorAll('.stat-number[data-count]').forEach(function(el) {
            var target = parseInt(el.getAttribute('data-count'));

            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: function() {
                    var obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 1.5,
                        ease: 'power2.out',
                        onUpdate: function() {
                            el.textContent = Math.round(obj.val);
                            if (target >= 200) el.textContent += '+';
                        }
                    });
                }
            });
        });
    }

    // ---- Glitch Text Effect ----
    function initGlitchEffect() {
        // Create role text element under hero greeting
        var greeting = document.querySelector('.hero__greeting');
        if (!greeting) return;

        var roleEl = document.createElement('div');
        roleEl.className = 'hero__role';
        roleEl.style.cssText = 'font-size: 0.7rem; letter-spacing: 0.2em; color: var(--cyan); margin-top: 0.5rem; min-height: 1.2em; text-align: center;';
        greeting.parentNode.insertBefore(roleEl, greeting.nextSibling.nextSibling);

        var roles = [
            'LARAVEL ARCHITECT',
            'FULL-STACK ENGINEER',
            'AI WHISPERER',
            'SYSTEM BUILDER',
            'CODE ALCHEMIST',
            'BUG EXECUTIONER',
            '40 YEARS DEADLY'
        ];
        var roleIndex = 0;
        var glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`░▒▓█▄▀■□▪▫';

        function glitchRole() {
            var target = roles[roleIndex];
            var iterations = 0;

            var interval = setInterval(function() {
                roleEl.innerHTML = target
                    .split('')
                    .map(function(char, i) {
                        if (i < iterations) {
                            if (Math.random() < 0.05) {
                                return '<span style="color: var(--pink)">' + glitchChars[Math.floor(Math.random() * glitchChars.length)] + '</span>';
                            }
                            return char;
                        }
                        return '<span style="color: ' + (Math.random() > 0.5 ? 'var(--pink)' : 'var(--neon)') + '">' +
                            glitchChars[Math.floor(Math.random() * glitchChars.length)] + '</span>';
                    })
                    .join('');

                if (iterations >= target.length + 5) {
                    roleEl.textContent = target;
                    clearInterval(interval);
                }
                iterations += 0.4;
            }, 25);

            roleIndex = (roleIndex + 1) % roles.length;
        }

        // Start glitch cycle
        setTimeout(glitchRole, 1200);
        setInterval(glitchRole, 4000);
    }

    // ---- Console Branding ----
    function initConsoleBranding() {
        console.log(
            '%c◉ VISION SYSTEMS',
            'color: #00FFFF; font-size: 24px; font-weight: bold; text-shadow: 0 0 10px #00FFFF;'
        );
        console.log(
            '%cI see you inspecting. I respect the curiosity.',
            'color: #71717a; font-size: 12px;'
        );
        console.log(
            '%cShane built this. I designed it. Together, we ship.',
            'color: #FF10F0; font-size: 12px;'
        );
        console.log(
            '%cmrshanebarron@gmail.com',
            'color: #00FFFF; font-size: 11px;'
        );
    }

    // ---- Konami Code Easter Egg ----
    function initKonamiCode() {
        var sequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // up up down down left right left right B A
        var pos = 0;

        document.addEventListener('keydown', function(e) {
            if (e.keyCode === sequence[pos]) {
                pos++;
                if (pos === sequence.length) {
                    activateChaosMode();
                    pos = 0;
                }
            } else {
                pos = 0;
            }
        });
    }

    function activateChaosMode() {
        document.body.style.transition = 'filter 0.5s ease';
        document.body.style.filter = 'hue-rotate(180deg) saturate(3)';

        // Spawn flying eyes
        for (var i = 0; i < 15; i++) {
            spawnFlyingEye(i * 200);
        }

        setTimeout(function() {
            document.body.style.filter = '';
        }, 5000);
    }

    function spawnFlyingEye(delay) {
        setTimeout(function() {
            var eye = document.createElement('div');
            eye.style.cssText = 'position: fixed; width: 40px; height: 40px; border-radius: 50%; z-index: 9998; pointer-events: none;' +
                'background: radial-gradient(ellipse at center, #00FFFF 0%, #006666 50%, #003333 100%);' +
                'box-shadow: 0 0 20px rgba(0,255,255,0.5);' +
                'top: ' + (Math.random() * 100) + 'vh; left: -50px;';
            document.body.appendChild(eye);

            gsap.to(eye, {
                x: window.innerWidth + 100,
                y: (Math.random() - 0.5) * 200,
                rotation: 720,
                duration: 2 + Math.random() * 2,
                ease: 'none',
                onComplete: function() { eye.remove(); }
            });
        }, delay);
    }

    // ---- INIT EVERYTHING ----
    initLoader().then(function() {
        initHero();
        initSectionHeadings();
        initContentReveals();
        initCapabilityCards();
        initDemoCards();
        initArrangement();
        initStatCounters();
        initGlitchEffect();
        initConsoleBranding();
        initKonamiCode();

        // Refresh ScrollTrigger after all setup
        ScrollTrigger.refresh();
    });

})();
