// your secure google middleman link
const MIDDLEMAN_URL = "https://script.google.com/macros/s/AKfycbyPCH-SeqGBDjll7Eo30BgpTY7iKoJP2AvQXg6D68AMZrPpVAXE6QZgl7MUHYbAqlvN/exec";

const screens = {
    logo: document.getElementById('logo-screen'),
    instr: document.getElementById('instructions-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

let variables = ["because", "due to", "although", "despite", "when", "while", "after", "before"];
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
            
            // Only refill the deck if they have conquered every single word
            if (activeDeck.length === 0) {
                activeDeck = [...variables];
            }
        };
        grid.appendChild(card);
    });
}

// 2. load data
buildLobby([
    { name: "school", anchor: "the student opened the laptop..." },
    { name: "hospital", anchor: "the nurse took blood samples..." }
]);

fetch('./casinos.json')
    .then(res => res.json())
    .then(data => {
        // THE SCRUBBER: removes spaces, forces lowercase, and destroys accidental duplicates in your JSON
        variables = [...new Set(data.variables.map(v => v.trim().toLowerCase()))];
        activeDeck = [...variables]; 
        buildLobby(data.casinos);
    }).catch(e => console.log("using fallback data"));

// 3. unbreakable navigation
document.getElementById('to-instructions-btn').onclick = () => { screens.logo.classList.add('hidden'); screens.instr.classList.remove('hidden'); };
document.getElementById('to-lobby-btn').onclick = () => { screens.instr.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };
document.getElementById('back-to-lobby').onclick = () => { screens.game.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };

// 4. THE FLASHCARD SPIN 
document.getElementById('spin-btn').onclick = () => {
    const spinBtn = document.getElementById('spin-btn');
    
    // Physically lock the button and dim it so impatient tapping cannot scramble the brain
    spinBtn.disabled = true; 
    spinBtn.style.opacity = "0.5";
    
    document.getElementById('feedback-area').classList.add('hidden'); 
    document.getElementById('mic-btn').classList.add('hidden'); 
    
    // If they magically conquered every word, silently refill the deck so the app doesn't crash
    if (activeDeck.length === 0) {
        activeDeck = [...variables];
    }

    // Pick a word from the UNCONQUERED deck. 
    // If they just got a word wrong, try not to give them the exact same word immediately back-to-back.
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
            
            // Unlock the spin button
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
            judgeGrammar(transcript.toLowerCase());
        }, 700);
    };

    document.getElementById('mic-btn').onclick = () => {
        recognition.start();
        document.getElementById('mic-btn').innerText = "🔴 listening...";
        document.getElementById('feedback-area').classList.add('hidden');
    };
}

// 6. the real AI connection & CONQUER LOGIC
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
        mirror.innerText = "ai notes: " + aiJudge.feedback.toLowerCase();

        if (aiJudge.isCorrect) {
            badge.innerText = "jackpot! +50";
            badge.style.color = "#00ff00";
            score += 50;
            document.getElementById('score').innerText = score;
            
            // THE FLASHCARD RULE: Permanently delete this word from the active deck because they conquered it
            activeDeck = activeDeck.filter(v => v !== currentVar);
            
        } else {
            badge.innerText = "yanlış!";
            badge.style.color = "#ff4444";
            
            // If they get it wrong, it stays inside 'activeDeck' to test them again later.
        }
    } catch (error) {
        badge.innerText = "connection failed";
        badge.style.color = "#ff4444";
        mirror.innerText = "could not reach the ai judge.";
    }
}
