document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    let themeBtn = document.getElementById('theme-toggle');
    let themeIcon = document.getElementById('theme-icon');

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('arcadeTheme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if(themeIcon) themeIcon.classList.replace('ph-sun', 'ph-moon');
    }

    if(themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            
            if (body.classList.contains('light-theme')) {
                if(themeIcon) themeIcon.classList.replace('ph-sun', 'ph-moon');
                localStorage.setItem('arcadeTheme', 'light');
            } else {
                if(themeIcon) themeIcon.classList.replace('ph-moon', 'ph-sun');
                localStorage.setItem('arcadeTheme', 'dark');
            }
        });
    }
});

// Global Enter Key logic for starting/restarting games
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const restartBtn = document.getElementById('btn-restart') || document.querySelector('.reset') || document.getElementById('reset');
        const startBtn = document.getElementById('btn-start');
        
        if (startBtn && startBtn.parentElement && !startBtn.parentElement.classList.contains('hidden')) {
            startBtn.click();
            startBtn.blur();
            return;
        }
        
        if (restartBtn) {
            const gameOver = document.getElementById('game-over');
            const msgCon = document.querySelector('.msg-container');
            
            let isVisible = false;
            if (gameOver && !gameOver.classList.contains('hidden')) isVisible = true;
            if (msgCon && msgCon.style.display !== 'none' && msgCon.innerText !== '') isVisible = true;
            // V1 reset button is always visible, but we can trigger it anyway
            if (!gameOver && !msgCon) isVisible = true; 

            if (isVisible) {
                restartBtn.click();
                restartBtn.blur();
            }
        }
    }
});
