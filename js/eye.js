// ==========================================
// VISION EYE — WebGL Shader + Pupil Tracking
// ==========================================

(function() {
    'use strict';

    const canvas = document.getElementById('eye-canvas');
    const heroSection = document.getElementById('hero');
    const eyeEl = document.getElementById('vision-eye');
    const pupilEl = document.getElementById('eye-pupil');
    const peekingEye = document.getElementById('peeking-eye');
    const peekingPupil = peekingEye ? peekingEye.querySelector('.peeking-eye__pupil') : null;

    const isMobile = window.innerWidth < 768;
    const mouse = { x: 0.5, y: 0.5 };

    // ---- WebGL Shader Background ----
    function initShader() {
        if (!canvas || isMobile) return;

        let gl;
        try {
            gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        } catch(e) { return; }
        if (!gl) return;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio, 1.5); // Cap for performance
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resize();
        window.addEventListener('resize', resize);

        // Vertex shader
        const vsSource = `
            attribute vec2 aPosition;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        // Fragment shader — cosmic noise field
        const fsSource = `
            precision mediump float;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform vec2 uResolution;

            // Simplex-like noise
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                                   -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m * m;
                m = m * m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                vec2 shift = vec2(100.0);
                for (int i = 0; i < 4; i++) {
                    v += a * snoise(p);
                    p = p * 2.0 + shift;
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / uResolution;
                vec2 p = uv * 3.0;

                // Mouse distortion
                vec2 mouseOffset = (uMouse - 0.5) * 0.3;
                p += mouseOffset;

                float t = uTime * 0.15;

                // Layered noise
                float n1 = fbm(p + t);
                float n2 = fbm(p + n1 * 0.5 + vec2(t * 0.7, t * 0.3));
                float n3 = fbm(p + n2 * 0.3 + vec2(-t * 0.5, t * 0.8));

                // Color mixing — deep space palette
                vec3 navy = vec3(0.02, 0.02, 0.08);
                vec3 cyan = vec3(0.0, 0.6, 0.7);
                vec3 purple = vec3(0.3, 0.0, 0.5);
                vec3 pink = vec3(0.5, 0.0, 0.3);

                vec3 col = navy;
                col = mix(col, cyan, smoothstep(-0.3, 0.6, n2) * 0.15);
                col = mix(col, purple, smoothstep(-0.2, 0.8, n3) * 0.12);
                col = mix(col, pink, smoothstep(0.2, 0.9, n1 * n3) * 0.08);

                // Vignette
                float vig = 1.0 - length((uv - 0.5) * 1.3);
                vig = smoothstep(0.0, 0.7, vig);
                col *= vig * 1.2;

                gl_FragColor = vec4(col, 1.0);
            }
        `;

        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        }

        const vs = createShader(gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

        gl.useProgram(program);

        // Full-screen quad
        const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const aPos = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(program, 'uTime');
        const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
        const uRes = gl.getUniformLocation(program, 'uResolution');

        let time = 0;
        let smoothMouse = { x: 0.5, y: 0.5 };

        function render() {
            time += 0.016;

            // Smooth mouse interpolation
            smoothMouse.x += (mouse.x - smoothMouse.x) * 0.05;
            smoothMouse.y += (mouse.y - smoothMouse.y) * 0.05;

            gl.uniform1f(uTime, time);
            gl.uniform2f(uMouseLoc, smoothMouse.x, smoothMouse.y);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            requestAnimationFrame(render);
        }
        render();
    }

    // ---- Eye Pupil Tracking ----
    function initEyeTracking() {
        if (!eyeEl || !pupilEl) return;

        document.addEventListener('mousemove', function(e) {
            mouse.x = e.clientX / window.innerWidth;
            mouse.y = e.clientY / window.innerHeight;

            // Main eye
            trackPupil(eyeEl, pupilEl, e.clientX, e.clientY, 18);

            // Peeking eye
            if (peekingEye && peekingPupil && peekingEye.classList.contains('visible')) {
                trackPupil(peekingEye, peekingPupil, e.clientX, e.clientY, 6);
            }
        });
    }

    function trackPupil(eyeElement, pupilElement, mx, my, maxDist) {
        var rect = eyeElement.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var angle = Math.atan2(my - centerY, mx - centerX);
        var rawDist = Math.hypot(mx - centerX, my - centerY);
        var distance = Math.min(maxDist, rawDist * 0.08);

        var tx = Math.cos(angle) * distance;
        var ty = Math.sin(angle) * distance;

        if (typeof gsap !== 'undefined') {
            gsap.to(pupilElement, {
                x: tx,
                y: ty,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: true
            });
        } else {
            pupilElement.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
        }
    }

    // ---- Idle Wander ----
    function initIdleWander() {
        if (!pupilEl) return;

        var idleTimeout;
        var wanderInterval;

        function startWander() {
            wanderInterval = setInterval(function() {
                var behavior = Math.random();
                var tx, ty, dur;

                if (behavior < 0.3) {
                    // Look straight
                    tx = 0; ty = 0; dur = 1;
                } else if (behavior < 0.6) {
                    // Quick glance
                    tx = (Math.random() - 0.5) * 20;
                    ty = (Math.random() - 0.5) * 10;
                    dur = 0.4;
                } else if (behavior < 0.85) {
                    // Slow scan
                    tx = (Math.random() - 0.5) * 15;
                    ty = (Math.random() - 0.5) * 8;
                    dur = 1.5;
                } else {
                    // Suspicious look up
                    tx = (Math.random() - 0.5) * 5;
                    ty = -12;
                    dur = 0.8;
                }

                if (typeof gsap !== 'undefined') {
                    gsap.to(pupilEl, { x: tx, y: ty, duration: dur, ease: 'power2.inOut' });
                }
            }, 2000 + Math.random() * 2000);
        }

        function stopWander() {
            clearInterval(wanderInterval);
        }

        document.addEventListener('mousemove', function() {
            stopWander();
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(startWander, 3000);
        });

        // Start wandering initially
        startWander();
    }

    // ---- Init ----
    initShader();
    initEyeTracking();
    initIdleWander();

    // Expose for main.js to control peeking eye visibility
    window.VisionEye = {
        showPeekingEye: function() {
            if (peekingEye) peekingEye.classList.add('visible');
        },
        hidePeekingEye: function() {
            if (peekingEye) peekingEye.classList.remove('visible');
        }
    };
})();
