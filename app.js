const screens = {
    logo: document.getElementById('logo-screen'),
    instr: document.getElementById('instructions-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

let variables = [];
let score = 0;
let recognition;
let silenceTimer;

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
                document.getElementById('feedback-area').classList.add('hidden');
            };
            grid.appendChild(card);
        });
    });

document.getElementById('to-instructions-btn').onclick = () => { screens.logo.classList.add('hidden'); screens.instr.classList.remove('hidden'); };
document.getElementById('to-lobby-btn').onclick = () => { screens.instr.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };
document.getElementById('back-to-lobby').onclick = () => { screens.game.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };

document.getElementById('spin-btn').onclick = () => {
    const reel = document.getElementById('variable-text');
    let count = 0;
    const interval = setInterval(() => {
        reel.innerText = variables[Math.floor(Math.random() * variables.length)];
        if (++count > 15) { clearInterval(interval); document.getElementById('mic-btn').classList.remove('hidden'); }
    }, 60);
};

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-us';
    recognition.continuous = true;

    recognition.onresult = (event) => {
        clearTimeout(silenceTimer);
        const transcript = event.results[event.results.length - 1][0].transcript;
        
        // 0.7s silence timer: as soon as you stop, it stops
        silenceTimer = setTimeout(() => {
            recognition.stop();
            document.getElementById('mic-btn').innerText = "🎤 tap to speak";
            showFeedback(transcript);
        }, 700); 
    };

    document.getElementById('mic-btn').onclick = () => {
        recognition.start();
        document.getElementById('mic-btn').innerText = "🔴 listening...";
        document.getElementById('feedback-area').classList.add('hidden');
    };
}

function showFeedback(text) {
    const area = document.getElementById('feedback-area');
    const badge = document.getElementById('status-badge');
    const mirror = document.getElementById('turkish-mirror');
    
    area.classList.remove('hidden');
    
    // logic fix: until AI is connected, everything with > 3 words is a jackpot
    if (text.split(" ").length > 3) {
        badge.innerText = "jackpot! +50";
        badge.style.color = "#00ff00";
        score += 50;
        document.getElementById('score').innerText = score;
    } else {
        badge.innerText = "bir daha söyle!";
        badge.style.color = "#ff4444";
    }
    mirror.innerText = "you said: " + text.toLowerCase();
}
