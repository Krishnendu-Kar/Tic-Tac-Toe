/* ==========================================================================
   Retro Arcade Collection — Shared touch / small-screen behaviour
   --------------------------------------------------------------------------
   Loaded on every game page, after the game's own script. Everything here is
   additive: it drives the existing games by dispatching the same keyboard
   events they already listen for, so no game logic had to change.

     1. Viewport height fallback for browsers without `dvh`
     2. Swipe gestures on grid games
     3. On-screen D-pad for keyboard-only games
     4. Double-tap-zoom suppression on play surfaces
   ========================================================================== */

(function () {
    'use strict';

    var isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    /* -- 1. Viewport height fallback -------------------------------------- */

    /* Modern browsers get `100dvh` straight from arcade-responsive.css. Older
       ones (pre-Chrome 108 / pre-Safari 15.4) fall back to `100vh`, which on
       mobile is measured against the *expanded* URL bar and overflows. Pin a
       real pixel height for those only. */
    function supportsDvh() {
        return window.CSS && CSS.supports && CSS.supports('height', '100dvh');
    }

    if (!supportsDvh()) {
        var syncHeight = function () {
            document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
            document.body.style.minHeight = window.innerHeight + 'px';
        };
        syncHeight();
        window.addEventListener('resize', syncHeight);
        window.addEventListener('orientationchange', syncHeight);
    }

    /* -- Helpers ----------------------------------------------------------- */

    function sendKey(key) {
        var opts = { key: key, code: key, bubbles: true, cancelable: true };
        window.dispatchEvent(new KeyboardEvent('keydown', opts));
        document.dispatchEvent(new KeyboardEvent('keydown', opts));
    }

    function buzz(ms) {
        if (navigator.vibrate) {
            try { navigator.vibrate(ms); } catch (e) { /* unsupported / blocked */ }
        }
    }

    var DIRECTION_KEYS = {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight'
    };

    /* -- 2. Swipe gestures -------------------------------------------------- */

    /* Reads a swipe off `surface` and reports the dominant axis. The 24px floor
       keeps an ordinary tap from registering as a nudge in some direction. */
    function enableSwipe(surface, onSwipe) {
        if (!surface) return;

        var startX = 0;
        var startY = 0;
        var tracking = false;
        var MIN_DISTANCE = 24;

        surface.addEventListener('touchstart', function (e) {
            if (e.touches.length !== 1) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            tracking = true;
        }, { passive: true });

        surface.addEventListener('touchmove', function (e) {
            // Stop the page from rubber-banding while a swipe is in progress.
            if (tracking) e.preventDefault();
        }, { passive: false });

        surface.addEventListener('touchend', function (e) {
            if (!tracking) return;
            tracking = false;

            var touch = e.changedTouches[0];
            var dx = touch.clientX - startX;
            var dy = touch.clientY - startY;

            if (Math.abs(dx) < MIN_DISTANCE && Math.abs(dy) < MIN_DISTANCE) return;

            if (Math.abs(dx) > Math.abs(dy)) {
                onSwipe(dx > 0 ? 'right' : 'left');
            } else {
                onSwipe(dy > 0 ? 'down' : 'up');
            }
        }, { passive: true });
    }

    /* -- 3. On-screen D-pad ------------------------------------------------- */

    function buildDpad() {
        var pad = document.createElement('div');
        pad.className = 'arcade-pad arcade-pad--dpad';
        pad.setAttribute('role', 'group');
        pad.setAttribute('aria-label', 'Direction controls');

        [
            ['up', '▲', 'Move up'],
            ['left', '◀', 'Move left'],
            ['down', '▼', 'Move down'],
            ['right', '▶', 'Move right']
        ].forEach(function (spec) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'arcade-pad__btn';
            btn.dataset.dir = spec[0];
            btn.textContent = spec[1];
            btn.setAttribute('aria-label', spec[2]);

            // pointerdown, not click: a directional control should respond on
            // press rather than waiting for the release.
            btn.addEventListener('pointerdown', function (e) {
                e.preventDefault();
                sendKey(DIRECTION_KEYS[spec[0]]);
                buzz(8);
            });

            pad.appendChild(btn);
        });

        return pad;
    }

    function addHint(target, text) {
        var hint = document.createElement('p');
        hint.className = 'arcade-hint';
        hint.textContent = text;
        target.appendChild(hint);
    }

    /* -- 4. Per-game wiring ------------------------------------------------- */

    document.addEventListener('DOMContentLoaded', function () {
        var snakeCanvas = document.getElementById('game-canvas');
        var grid = document.getElementById('grid');
        var isSnake = !!snakeCanvas;
        var is2048 = !!document.querySelector('.tile, #highscore') && !!grid && !isSnake;

        /* Neon Snake had keyboard-only controls, so it was unplayable on a
           phone. Swipe anywhere on the board, or use the pad below it. */
        if (isSnake) {
            enableSwipe(snakeCanvas, function (dir) {
                sendKey(DIRECTION_KEYS[dir]);
            });

            if (isCoarse) {
                var panel = snakeCanvas.closest('.glass-panel') || snakeCanvas.parentNode;
                panel.appendChild(buildDpad());
                addHint(panel, 'Swipe the board or use the pad');
            }
        }

        /* 2048 already listens for swipes on the grid; it just never told
           anyone. */
        if (is2048 && isCoarse) {
            var container = grid.closest('.glass-panel') || grid.parentNode;
            addHint(container, 'Swipe to move the tiles');
        }

        /* A quick second tap on a board is a game input, not a zoom request.
           iOS Safari still needs this even with `touch-action: manipulation`
           on some versions. */
        var surfaces = document.querySelectorAll('canvas, #grid, .memory-grid, .board, .game, .controls');
        var lastTap = 0;

        Array.prototype.forEach.call(surfaces, function (surface) {
            surface.addEventListener('touchend', function (e) {
                var now = Date.now();
                if (now - lastTap < 320) e.preventDefault();
                lastTap = now;
            }, { passive: false });
        });

        /* Light haptic on every primary action, where the platform allows it. */
        if (isCoarse) {
            document.addEventListener('pointerdown', function (e) {
                // e.target can be a non-element node, which has no closest().
                if (!e.target || !e.target.closest) return;
                if (e.target.closest('.btn-primary, .choice-btn, .ctrl-btn, .menu-btn, .box, .hole')) {
                    buzz(8);
                }
            }, { passive: true });
        }
    });
})();
