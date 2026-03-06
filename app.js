// ... (Keep navigation logic the same) ...

// Updated Game Start Logic
function enterCasino(casino) {
    screens.lobby.classList.add('hidden');
    screens.game.classList.remove('hidden');
    
    // We only set the anchor text now, and it's BIG
    document.getElementById('anchor-text').innerText = casino.anchor;
    
    // Reset Slot Visuals
    document.getElementById('variable-text').innerText = "???";
    document.getElementById('mic-btn').classList.add('mic-hidden');
    document.getElementById('feedback-area').classList.add('hidden');
}

// ... (Keep the rest of your app.js) ...
