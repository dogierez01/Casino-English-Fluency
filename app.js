// REPLACE THE LINK BELOW WITH YOUR NEW GOOGLE SCRIPT URL
const MIDDLEMAN_URL = "https://script.google.com/macros/s/YOUR_NEW_URL/exec";

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
            document.getElementById('feedback-area').classList.add('hidden');
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

// 3. navigation & THE RESET LOGIC
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
    document.getElementById('feedback-area').classList.add('hidden');
    document.getElementById('reset-btn').classList.add('hidden');
    document.getElementById('spin-btn').classList.remove('hidden');
    document.getElementById('spin-btn').innerText = "spin";
    document.getElementById('spin-btn').disabled = false;
    document.getElementById('spin-btn').style.opacity = "1";
};

// 4. THE FINITE SPIN
document.getElementById('spin-btn').onclick = () => {
    if (activeDeck.length === 0) return; 

    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true; 
    spinBtn.style.opacity = "0.5";
    
    document.getElementById('feedback-area').classList.add('hidden'); 
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
            document.getElementById('mic-btn').classList.remove('hidden'); 
            spinBtn.disabled = false; 
            spinBtn.style.opacity = "1";
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
            document.getElementById('mic-btn').classList.add('hidden'); 
            judgeGrammar(transcript); 
        }, 700);
    };

    document.getElementById('mic-btn').onclick = () => {
        recognition.start();
        document.getElementById('mic-btn').innerText = "🔴 listening...";
        document.getElementById('feedback-area').classList.add('hidden');
    };
}

// 6. the real AI connection & TRUE GAME OVER STATE
async function judgeGrammar(text) {
    const area = document.getElementById('feedback-area');
    const badge = document.getElementById('status-badge');
    const mirror = document.getElementById('turkish-mirror');
    
    area.classList.remove('hidden');
    badge.innerText = "ai is thinking...";
    badge.style.color = "#d4af37";
    mirror.innerText = "you said: " + text;

    try {
        const response = await fetch(MIDDLEMAN_URL, {
            method: 'POST',
            body: JSON.stringify({
                text: text,
                anchor: window.currentAnchor,
                variable: currentVar
            })
        });

        const aiJudge = await response.json();
        mirror.innerText = "ai notes: " + aiJudge.feedback; 

        if (aiJudge.isCorrect) {
            score += 50;
            document.getElementById('score').innerText = score;
            
            // CONQUERED: Delete from deck
            activeDeck = activeDeck.filter(v => v !== currentVar);
            document.getElementById('words-left').innerText = activeDeck.length;

            // GAME OVER CHECK
            if (activeDeck.length === 0) {
                badge.innerText = "game over! perfect!";
                badge.style.color = "#d4af37";
                document.getElementById('spin-btn').classList.add('hidden');
                document.getElementById('reset-btn').classList.remove('hidden'); 
            } else {
                badge.innerText = "jackpot! +50";
                badge.style.color = "#00ff00";
            }
            
        } else {
            badge.innerText = "yanlış!";
            badge.style.color = "#ff4444";
        }
    } catch (error) {
        badge.innerText = "connection failed";
        badge.style.color = "#ff4444";
        mirror.innerText = "could not reach the ai judge.";
    }
}
