const screens = {
    logo: document.getElementById('logo-screen'),
    instr: document.getElementById('instructions-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

// 1. Navigation Logic
document.getElementById('to-instructions-btn').onclick = () => {
    screens.logo.classList.add('hidden');
    screens.instr.classList.remove('hidden');
};

document.getElementById('to-lobby-btn').onclick = () => {
    screens.instr.classList.add('hidden');
    screens.lobby.classList.remove('hidden');
};

document.getElementById('back-to-lobby').onclick = () => {
    screens.game.classList.add('hidden');
    screens.lobby.classList.remove('hidden');
};

// 2. Load Data (Looking at the root folder now!)
fetch('./casinos.json')
    .then(res => res.json())
    .then(data => {
        const grid = document.getElementById('casino-grid');
        window.variables = data.variables;
        data.casinos.forEach(c => {
            const card = document.createElement('div');
            card.className = 'casino-card';
            card.innerText = c.name;
            card.onclick = () => {
                screens.lobby.classList.add('hidden');
                screens.game.classList.remove('hidden');
                document.getElementById('casino-name').innerText = c.name;
                document.getElementById('anchor-text').innerText = c.anchor;
            };
            grid.appendChild(card);
        });
    })
    .catch(err => console.error("Could not find casinos.json! Check your file name."));

// 3. Game Logic
document.getElementById('spin-btn').onclick = () => {
    const reel = document.getElementById('variable-text');
    let count = 0;
    const interval = setInterval(() => {
        reel.innerText = window.variables[Math.floor(Math.random() * window.variables.length)];
        if (++count > 15) {
            clearInterval(interval);
            document.getElementById('mic-btn').classList.remove('mic-hidden');
        }
    }, 60);
};
