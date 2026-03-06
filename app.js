// Navigation Logic
const logoScreen = document.getElementById('logo-screen');
const instrScreen = document.getElementById('instructions-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');

// Stage 1 -> Stage 2
document.getElementById('to-instructions-btn').onclick = () => {
    logoScreen.classList.add('hidden');
    instrScreen.classList.remove('hidden');
};

// Stage 2 -> Stage 3
document.getElementById('to-lobby-btn').onclick = () => {
    instrScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
};

// Stage 3 -> Stage 4 (Inside your casino select logic)
function enterCasino(casino) {
    lobbyScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    // ... load casino data ...
}
