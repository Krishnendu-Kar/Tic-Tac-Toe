/* ==========================================================================
   Retro Arcade Collection — Home page behaviour
   --------------------------------------------------------------------------
   Renders the game grid from one list, then wires search, category filtering,
   the shuffle button and the theme toggle. Plain DOM, no build step, no
   framework — the page has to stay fast on a cheap phone.
   ========================================================================== */

(function () {
    'use strict';

    /* -- Data -------------------------------------------------------------- */

    /* `score` is the localStorage key the game itself writes its high score to
       (see each game's script.js); games without one simply omit it. */
    var GAMES = [
        {
            title: 'Tic-Tac-Toe V2',
            href: 'tic-tac-toe v2/index.html',
            icon: 'ph-duotone ph-game-controller',
            accent: '#ec4899',
            category: 'classic',
            badge: 'Featured',
            controls: 'Tap or click',
            desc: 'Three difficulties ending in an unbeatable minimax AI, with animated win strikes.'
        },
        {
            title: 'Neon Snake',
            href: 'snake/index.html',
            icon: 'ph-duotone ph-scribble-loop',
            accent: '#10b981',
            category: 'arcade',
            controls: 'Arrows or swipe',
            score: 'snakeHighScore',
            desc: 'Eat, grow, and try not to fold into yourself. Swipe the board on a phone.'
        },
        {
            title: '2048',
            href: '2048/index.html',
            icon: 'ph-duotone ph-squares-four',
            accent: '#f59e0b',
            category: 'puzzle',
            controls: 'Arrows or swipe',
            score: '2048HighScore',
            desc: 'Slide the tiles, merge the pairs, and chase the one tile that names the game.'
        },
        {
            title: 'Space Invaders',
            href: 'space/index.html',
            icon: 'ph-duotone ph-rocket-launch',
            accent: '#22d3ee',
            category: 'arcade',
            controls: 'Arrows + space',
            score: 'spaceHighScore',
            desc: 'Hold the line against descending waves that speed up as their ranks thin out.'
        },
        {
            title: 'Neon Breakout',
            href: 'breakout/index.html',
            icon: 'ph-duotone ph-wall',
            accent: '#a855f7',
            category: 'arcade',
            controls: 'Mouse or drag',
            desc: 'Bounce a ball through a wall of bricks without letting it past your paddle.'
        },
        {
            title: 'Neon Pong',
            href: 'pong/index.html',
            icon: 'ph-duotone ph-tennis-ball',
            accent: '#06b6d4',
            category: 'classic',
            controls: 'Mouse or drag',
            desc: 'The original video game, first to five points against a computer that reads spin.'
        },
        {
            title: 'Memory Match',
            href: 'memory/index.html',
            icon: 'ph-duotone ph-cards',
            accent: '#a855f7',
            category: 'puzzle',
            controls: 'Tap or click',
            desc: 'Sixteen cards, eight pairs, and only your short-term memory to work with.'
        },
        {
            title: 'Flappy Box',
            href: 'flappy/index.html',
            icon: 'ph-duotone ph-bird',
            accent: '#eab308',
            category: 'reflex',
            controls: 'Tap or space',
            score: 'flappyHighScore',
            desc: 'One button, endless pipes, and a difficulty curve that starts immediately.'
        },
        {
            title: 'Whack-a-Mole',
            href: 'whack/index.html',
            icon: 'ph-duotone ph-hammer',
            accent: '#f97316',
            category: 'reflex',
            controls: 'Tap or click',
            desc: 'Thirty seconds, nine holes, and moles that stop being polite about it.'
        },
        {
            title: 'Rock Paper Scissors',
            href: 'rps/index.html',
            icon: 'ph-duotone ph-hand-fist',
            accent: '#f43f5e',
            category: 'classic',
            controls: 'Tap or click',
            desc: 'The fastest game here. Pick one of three and find out how the round went.'
        },
        {
            title: 'Tic-Tac-Toe V1',
            href: 'tic-tac-toe v1/index.html',
            icon: 'ph-duotone ph-number-square-one',
            accent: '#3b82f6',
            category: 'classic',
            badge: 'Original',
            controls: 'Tap or click',
            desc: 'The version that started the collection, kept exactly as it was written.'
        }
    ];

    var CATEGORY_LABELS = {
        classic: 'Classic',
        arcade: 'Arcade',
        puzzle: 'Puzzle',
        reflex: 'Reflex'
    };

    /* -- Elements ---------------------------------------------------------- */

    var grid = document.getElementById('games');
    var empty = document.getElementById('empty');
    var search = document.getElementById('search');
    var chips = document.getElementById('chips');
    var topbar = document.getElementById('topbar');
    var themeBtn = document.getElementById('theme-toggle');
    var themeIcon = document.getElementById('theme-icon');
    var statBest = document.getElementById('stat-best');

    var activeFilter = 'all';

    /* -- Rendering --------------------------------------------------------- */

    function readScore(key) {
        if (!key) return null;
        try {
            var raw = localStorage.getItem(key);
            var value = parseInt(raw, 10);
            return isNaN(value) || value <= 0 ? null : value;
        } catch (e) {
            // Private browsing can throw on localStorage access.
            return null;
        }
    }

    function buildCard(game) {
        var best = readScore(game.score);

        var card = document.createElement('article');
        card.className = 'card';
        card.style.setProperty('--accent-game', game.accent);
        card.dataset.category = game.category;
        card.dataset.search = (game.title + ' ' + game.desc + ' ' + CATEGORY_LABELS[game.category]).toLowerCase();

        var badge = '';
        if (best !== null) {
            badge = '<span class="card__badge card__badge--best">Best ' + best + '</span>';
        } else if (game.badge) {
            badge = '<span class="card__badge">' + game.badge + '</span>';
        }

        card.innerHTML =
            '<div class="card__top">' +
                '<span class="card__icon"><i class="' + game.icon + '" aria-hidden="true"></i></span>' +
                badge +
            '</div>' +
            '<h2 class="card__title"><a class="card__link" href="' + game.href + '">' + game.title + '</a></h2>' +
            '<p class="card__desc">' + game.desc + '</p>' +
            '<p class="card__meta">' +
                '<span class="card__tag"><i class="ph ph-tag" aria-hidden="true"></i>' + CATEGORY_LABELS[game.category] + '</span>' +
                '<span class="card__tag"><i class="ph ph-cursor-click" aria-hidden="true"></i>' + game.controls + '</span>' +
            '</p>';

        return card;
    }

    function render() {
        var fragment = document.createDocumentFragment();
        GAMES.forEach(function (game) {
            fragment.appendChild(buildCard(game));
        });
        grid.appendChild(fragment);
    }

    /* -- Filtering --------------------------------------------------------- */

    function applyFilters() {
        var term = search.value.trim().toLowerCase();
        var visible = 0;

        Array.prototype.forEach.call(grid.children, function (card) {
            var matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
            var matchesTerm = !term || card.dataset.search.indexOf(term) !== -1;
            var show = matchesCategory && matchesTerm;

            card.hidden = !show;
            if (show) visible++;
        });

        empty.hidden = visible > 0;
    }

    /* -- Stats ------------------------------------------------------------- */

    function updateBestStat() {
        var best = 0;
        GAMES.forEach(function (game) {
            var score = readScore(game.score);
            if (score !== null && score > best) best = score;
        });
        statBest.textContent = best > 0 ? best.toLocaleString() : '—';
    }

    /* -- Theme ------------------------------------------------------------- */

    /* The pre-paint script in index.html can only mark <html>; move the class
       to <body> so the rest of the site (theme.js) sees the same hook. */
    function syncTheme() {
        var isLight = document.documentElement.classList.contains('light-theme') ||
                      document.body.classList.contains('light-theme');

        document.documentElement.classList.remove('light-theme');
        document.body.classList.toggle('light-theme', isLight);

        if (themeIcon) {
            themeIcon.className = isLight ? 'ph-duotone ph-moon' : 'ph-duotone ph-sun';
        }
        themeBtn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    }

    themeBtn.addEventListener('click', function () {
        var isLight = !document.body.classList.contains('light-theme');
        document.body.classList.toggle('light-theme', isLight);
        try {
            localStorage.setItem('arcadeTheme', isLight ? 'light' : 'dark');
        } catch (e) { /* storage unavailable */ }
        syncTheme();
    });

    /* -- Shuffle ----------------------------------------------------------- */

    function playRandom() {
        var game = GAMES[Math.floor(Math.random() * GAMES.length)];
        window.location.href = game.href;
    }

    /* -- Boot -------------------------------------------------------------- */

    render();
    updateBestStat();
    syncTheme();

    search.addEventListener('input', applyFilters);

    chips.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;

        activeFilter = chip.dataset.filter;
        Array.prototype.forEach.call(chips.children, function (other) {
            other.setAttribute('aria-pressed', String(other === chip));
        });
        applyFilters();
    });

    document.getElementById('shuffle').addEventListener('click', playRandom);
    document.getElementById('shuffle-hero').addEventListener('click', playRandom);

    /* Hairline under the sticky bar, but only once the page has moved. */
    var onScroll = function () {
        topbar.dataset.stuck = String(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* "/" focuses search, the way every other catalogue does it. */
    document.addEventListener('keydown', function (e) {
        if (e.key === '/' && document.activeElement !== search) {
            e.preventDefault();
            search.focus();
        }
        if (e.key === 'Escape' && document.activeElement === search) {
            search.value = '';
            applyFilters();
            search.blur();
        }
    });
})();
