// definitions
const logoScreen = document.getElementById('logo-screen');
const instrScreen = document.getElementById('instructions-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');

// fallback data (works even if casinos.json fails)
const fallbackVars = ["because", "due to", "although", "despite", "when", "while", "after", "before"];
const fallbackCasinos = [
    { name: "school", anchor: "the student opened the laptop..." },
    { name: "hospital", anchor: "the nurse took blood samples..." },
    { name: "office", anchor: "the manager cancelled the meeting..." },
    { name: "bank", anchor: "i had to open a new account..." }
];

let variables = fallbackVars;
let score = 0;
let currentVar = "";

// 1. build the lobby immediately
function buildLobby(data) {
    const grid = document.getElementById('casino-grid');
    grid.innerHTML = ""; // clear loading
    data.forEach(c => {
        const card = document.createElement('div');
        card.className = 'casino-card';
        card.innerText = c.name;
        card.onclick = () => {
            lobbyScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
            document.getElementById('anchor-text').innerText = c.anchor;
            document.getElementById('feedback-area').classList.add('hidden');
        };
        grid.appendChild(card);
    });
}

// 2. start with fallback, try to update with json
buildLobby(fallbackCasinos);
fetch('./casinos.json')
    .then(res => res.json())
    .then(data => {
        variables = data.variables;
        buildLobby(data.casinos);
    }).catch(e => console.log("using fallback data"));

// 3. navigation (these are now unbreakable)
document.getElementById('to-instructions-btn').onclick = () => { logoScreen.classList.add('hidden'); instrScreen.classList.remove('hidden'); };
document.getElementById('to-lobby-btn').onclick = () => { instrScreen.classList.add('hidden'); lobbyScreen.classList.remove('hidden'); };
document.getElementById('back-to-lobby').onclick = () => { gameScreen.classList.add('hidden'); lobbyScreen.classList.remove('hidden'); };

// 4. spin logic (now unbreakable)
document.getElementById('spin-btn').onclick = () => {
    const reel = document.getElementById('variable-text');
    let count = 0;
    const interval = setInterval(() => {
        currentVar = variables[Math.floor(Math.random() * variables.length)];
        reel.innerText = currentVar;
        if (++count > 15) {
            clearInterval(interval);
            document.getElementById('mic-btn').classList.remove('hidden');
        }
    }, 60);
};

// 5. snappy microphone (0.7s)
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-us';
    recognition.continuous = true;
    let silenceTimer;

    recognition.onresult = (event) => {
        clearTimeout(silenceTimer);
        const transcript = event.results[event.results.length - 1][0].transcript;
        silenceTimer = setTimeout(() => {
            recognition.stop();
            document.getElementById('mic-btn').innerText = "🎤 tap to speak";
            showFeedback(transcript);
        }, 700);
    };

    document.getElementById('mic-btn').onclick = () => {
        recognition.start();
        document.getElementById('mic-btn').innerText = "🔴 listening...";
    };
}

function showFeedback(text) {
    const area = document.getElementById('feedback-area');
    area.classList.remove('hidden');
    document.getElementById('status-badge').innerText = "jackpot!";
    document.getElementById('status-badge').style.color = "#00ff00";
    document.getElementById('turkish-mirror').innerText = "you said: " + text.toLowerCase();
}
