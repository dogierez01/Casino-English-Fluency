const screens = {
    logo: document.getElementById('logo-screen'),
    instr: document.getElementById('instructions-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

let variables = [];
let recognition;
let silenceTimer;

// load data from your main folder
fetch('./casinos.json')
    .then(res => res.json())
    .then(data => {
        variables = data.variables;
        const grid = document.getElementById('casino-grid');
        data.casinos.forEach(c => {
            const card = document.createElement('div');
            card.className = 'casino-card';
            card.innerText = c.name;
            card.onclick = () => {
                screens.lobby.classList.add('hidden');
                screens.game.classList.remove('hidden');
                document.getElementById('anchor-text').innerText = c.anchor;
            };
            grid.appendChild(card);
        });
    });

// navigation
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

// spin logic
document.getElementById('spin-btn').onclick = () => {
    const reel = document.getElementById('variable-text');
    let count = 0;
    const interval = setInterval(() => {
        reel.innerText = variables[Math.floor(Math.random() * variables.length)];
        if (++count > 15) {
            clearInterval(interval);
            document.getElementById('mic-btn').classList.remove('hidden');
        }
    }, 60);
};

// microphone with 3-second silence detection
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-us';
    recognition.continuous = true;

    recognition.onresult = (event) => {
        clearTimeout(silenceTimer);
        const transcript = event.results[event.results.length - 1][0].transcript;
        
        silenceTimer = setTimeout(() => {
            recognition.stop();
            document.getElementById('mic-btn').innerText = "🎤 tap to speak";
            alert("bir daha söyle logic check: " + transcript); 
        }, 3000); 
    };

    document.getElementById('mic-btn').onclick = () => {
        recognition.start();
        document.getElementById('mic-btn').innerText = "🔴 listening...";
    };
}
