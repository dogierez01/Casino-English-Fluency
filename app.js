let casinoData = null;
let currentVariable = null;
let score = 0;

// 1. Load Data and Build the Lobby
fetch('data/casinos.json')
    .then(res => res.json())
    .then(data => {
        casinoData = data;
        const grid = document.getElementById('casino-grid');
        
        // Create a button for each casino
        data.casinos.forEach(casino => {
            const btn = document.createElement('div');
            btn.className = 'casino-card';
            btn.innerText = casino.name;
            btn.onclick = () => enterCasino(casino);
            grid.appendChild(btn);
        });
    });

// Navigation: Instructions -> Lobby
document.getElementById('to-lobby-btn').onclick = () => {
    document.getElementById('landing-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
};

// Navigation: Lobby -> Game
function enterCasino(casino) {
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    document.getElementById('casino-name').innerText = casino.name;
    document.getElementById('anchor-text').innerText = casino.anchor;
    
    // Reset the slot
    document.getElementById('variable-text').innerText = "???";
    document.getElementById('mic-btn').classList.add('mic-hidden');
    document.getElementById('feedback-area').classList.add('hidden');
}

// Navigation: Back to Lobby
document.getElementById('back-to-lobby').onclick = () => {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('lobby-screen').classList.remove('hidden');
};

// ... (The Spin and Mic logic from the previous step goes here) ...
