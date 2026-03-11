const screens = {
    logo: document.getElementById('logo-screen'),
    instr: document.getElementById('instructions-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

let variables = [
    "although", "despite", "because", "due to", "when", "while", 
    "since", "until", "after", "before", "in order to", "so that", 
    "by Ving", "in a ... way"
];
let activeDeck = []; 
let score = 0;
let currentVar = "";
let lastVar = "";
let currentAttempt = 1;
window.currentAnchor = "";

// 1. build the lobby
function buildLobby(data) {
    const grid = document.getElementById('casino-grid');
    grid.innerHTML = ""; 
    data.forEach(c => {
        const card = document.createElement('div');
        card.className = 'casino-card';
        card.innerText = c.name;
        card.onclick = () => {
            screens.lobby.classList.add('hidden');
            screens.game.classList.remove('hidden');
            document.getElementById('anchor-text').innerText = c.anchor;
            hideFeedback();
            window.currentAnchor = c.anchor; 
            document.getElementById('words-left').innerText = activeDeck.length;
        };
        grid.appendChild(card);
    });
}

// 2. load data & fill the initial deck with all 10 rooms
buildLobby([
    { name: "school", anchor: "The student was studying in the library..." },
    { name: "hospital", anchor: "The patient was waiting in the emergency room..." },
    { name: "office", anchor: "The team was working on the presentation..." },
    { name: "bank", anchor: "I was standing in line at the bank..." },
    { name: "airport", anchor: "The passengers were waiting at the boarding gate..." },
    { name: "restaurant", anchor: "The chef was preparing the main course..." },
    { name: "hotel", anchor: "The guest was resting in the hotel room..." },
    { name: "gym", anchor: "The athlete was lifting heavy weights..." },
    { name: "supermarket", anchor: "The customer was pushing the shopping cart..." },
    { name: "police station", anchor: "The detective was questioning the suspect..." }
]);

fetch('./casinos.json')
    .then(res => res.json())
    .then(data => {
        variables = [...new Set(data.variables.map(v => v.trim()))];
        activeDeck = [...variables]; 
        document.getElementById('words-left').innerText = activeDeck.length;
        buildLobby(data.casinos);
    }).catch(e => console.log("using fallback data"));

// 3. navigation & resets
document.getElementById('to-instructions-btn').onclick = () => { screens.logo.classList.add('hidden'); screens.instr.classList.remove('hidden'); };
document.getElementById('to-lobby-btn').onclick = () => { screens.instr.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };
document.getElementById('back-to-lobby').onclick = () => { screens.game.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };

document.getElementById('reset-btn').onclick = () => {
    activeDeck = [...variables];
    score = 0;
    currentVar = "";
    lastVar = "";
    document.getElementById('score').innerText = score;
    document.getElementById('words-left').innerText = activeDeck.length;
    document.getElementById('variable-text').innerText = "???";
    hideFeedback();
    document.getElementById('reset-btn').classList.add('hidden');
    document.getElementById('spin-btn').classList.remove('hidden');
    document.getElementById('spin-btn').innerText = "spin";
    document.getElementById('spin-btn').disabled = false;
    document.getElementById('spin-btn').style.opacity = "1";
};

function hideFeedback() {
    document.getElementById('feedback-area').classList.add('hidden');
    document.getElementById('attempt-1-controls').classList.add('hidden');
    document.getElementById('attempt-2-controls').classList.add('hidden');
    document.getElementById('status-badge').innerText = "student said:";
    document.getElementById('turkish-mirror').innerText = "";
}

// 4. THE FINITE SPIN
document.getElementById('spin-btn').onclick = () => {
    if (activeDeck.length === 0) return; 

    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true; 
    spinBtn.style.opacity = "0.5";
    
    hideFeedback();
    document.getElementById('mic-btn').classList.add('hidden'); 

    let possibleWords = activeDeck;
    if (activeDeck.length > 1) {
        possibleWords = activeDeck.filter(v => v !== lastVar);
    }
    const winningWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
    
    const reel = document.getElementById('variable-text');
    let count = 0;
    
    const interval = setInterval(() => {
        reel.innerText = variables[Math.floor(Math.random() * variables.length)];
        if (++count > 15) {
            clearInterval(interval);
            currentVar = winningWord; 
            lastVar = currentVar;
            reel.innerText = currentVar;
            currentAttempt = 1; // reset attempt counter for new word
            document.getElementById('mic-btn').classList.remove('hidden'); 
            document.getElementById('mic-btn').innerText = "🎤 tap to speak";
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
            document.getElementById('mic-btn').classList.add('hidden'); 
            showTeacherControls(transcript); 
        }, 700);
    };

    document.getElementById('mic-btn').onclick = () => {
        recognition.start();
        document.getElementById('mic-btn').innerText = "🔴 listening...";
        hideFeedback();
    };
}

// 6. TEACHER DASHBOARD LOGIC
function showTeacherControls(text) {
    document.getElementById('feedback-area').classList.remove('hidden');
    document.getElementById('turkish-mirror').innerText = '"' + text + '"';
    
    if (currentAttempt === 1) {
        document.getElementById('status-badge').innerText = "attempt 1: student said...";
        document.getElementById('attempt-1-controls').classList.remove('hidden');
        document.getElementById('attempt-2-controls').classList.add('hidden');
    } else {
        document.getElementById('status-badge').innerText = "attempt 2: student said...";
        document.getElementById('attempt-1-controls').classList.add('hidden');
        document.getElementById('attempt-2-controls').classList.remove('hidden');
    }
}

// ATTEMPT 1 BUTTONS
document.getElementById('btn-perfect').onclick = () => { resolveWord(50); };
document.getElementById('btn-try-again').onclick = () => {
    currentAttempt = 2;
    hideFeedback();
    document.getElementById('mic-btn').classList.remove('hidden');
    document.getElementById('mic-btn').innerText = "🎤 tap for attempt 2";
};

// ATTEMPT 2 BUTTONS
document.getElementById('btn-pass').onclick = () => { resolveWord(30); };
document.getElementById('btn-fail').onclick = () => { resolveWord(0); };

// RESOLVE THE WORD & CHECK FOR GAME OVER
function resolveWord(pointsEarned) {
    score += pointsEarned;
    document.getElementById('score').innerText = score;
    
    // Remove word from deck (always removes, even on a fail)
    activeDeck = activeDeck.filter(v => v !== currentVar);
    document.getElementById('words-left').innerText = activeDeck.length;
    
    hideFeedback();

    // GAME OVER CHECK
    if (activeDeck.length === 0) {
        document.getElementById('feedback-area').classList.remove('hidden');
        document.getElementById('status-badge').innerText = "🎉 GAME OVER! final score: " + score;
        document.getElementById('status-badge').style.color = "#d4af37";
        document.getElementById('spin-btn').classList.add('hidden');
        document.getElementById('reset-btn').classList.remove('hidden'); 
    } else {
        const spinBtn = document.getElementById('spin-btn');
        spinBtn.disabled = false; 
        spinBtn.style.opacity = "1";
    }
}
