// ==========================================
// CUSTOM CURSOR + MAGNETIC BUTTONS
// ==========================================

(function() {
    'use strict';

    // Skip on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
    if (window.innerWidth < 768) return;

    var cursorDot = document.getElementById('cursor');
    var cursorTrail = document.getElementById('cursor-trail');
    if (!cursorDot || !cursorTrail) return;

    var pos = { x: -100, y: -100 };
    var trailPos = { x: -100, y: -100 };
    var visible = false;

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Track mouse position
    document.addEventListener('mousemove', function(e) {
        pos.x = e.clientX;
        pos.y = e.clientY;

        if (!visible) {
            visible = true;
            cursorDot.classList.add('visible');
            cursorTrail.classList.add('visible');
        }
    });

    // Hide on mouse leave
    document.addEventListener('mouseleave', function() {
        visible = false;
        cursorDot.classList.remove('visible');
        cursorTrail.classList.remove('visible');
    });

    // Enlarge on interactive elements
    var interactiveSelector = 'a, button, [data-magnetic], .demo-card, .capability-card, .human-feed__screen, input';

    document.addEventListener('mouseover', function(e) {
        if (e.target.closest(interactiveSelector)) {
            cursorTrail.classList.add('active');
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest(interactiveSelector)) {
            cursorTrail.classList.remove('active');
        }
    });

    // Animation loop
    function animate() {
        // Dot follows exactly
        gsap.set(cursorDot, { x: pos.x, y: pos.y });

        // Trail follows with lag
        trailPos.x += (pos.x - trailPos.x) * 0.15;
        trailPos.y += (pos.y - trailPos.y) * 0.15;
        gsap.set(cursorTrail, { x: trailPos.x, y: trailPos.y });

        requestAnimationFrame(animate);
    }
    animate();

    // ---- Magnetic Buttons ----
    document.querySelectorAll('[data-magnetic]').forEach(function(btn) {
        btn.addEventListener('mousemove', function(e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', function() {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
})();
