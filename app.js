
let currentCasino = null;
let currentVariable = null;
let score = 0;
let recognition;
let silenceTimer;

// 1. Load Data from casinos.json
fetch('data/casinos.json')
    .then(res => res.json())
    .then(data => {
        // For this version, let's start in the Hospital Casino
        currentCasino = data.casinos[2]; 
        document.getElementById('casino-name').innerText = currentCasino.name + " Casino";
        document.getElementById('anchor-text').innerText = currentCasino.anchor;
        
        window.variables = data.variables;
    });

// 2. The Spin Logic
document.getElementById('spin-btn').addEventListener('click', () => {
    const reel = document.getElementById('variable-text');
    let spins = 0;
    
    // Disable spin button during spin
    document.getElementById('spin-btn').disabled = true;

    const interval = setInterval(() => {
        const randomVar = window.variables[Math.floor(Math.random() * window.variables.length)];
        reel.innerText = randomVar;
        spins++;

        if (spins > 20) {
            clearInterval(interval);
            currentVariable = randomVar;
            document.getElementById('spin-btn').disabled = false;
            document.getElementById('mic-btn').classList.remove('mic-hidden');
        }
    }, 50);
});

// 3. Speech Recognition (The Listening Brain)
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        clearTimeout(silenceTimer);
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        // 3-Second Silence Detection
        silenceTimer = setTimeout(() => {
            recognition.stop();
            processResult(transcript);
        }, 3000); 
    };
}

document.getElementById('mic-btn').addEventListener('click', () => {
    recognition.start();
    document.getElementById('mic-btn').innerText = "🔴 LISTENING...";
});

// 4. Processing the Result (Placeholder for the AI Judge)
function processResult(studentSpeech) {
    document.getElementById('mic-btn').innerText = "🎤 TAP TO SPEAK";
    document.getElementById('feedback-area').classList.remove('hidden');
    
    // NOTE: This is where we will connect to the AI API next!
    // For now, let's simulate a Jackpot for testing.
    document.getElementById('status-badge').innerText = "JACKPOT! +50";
    document.getElementById('turkish-mirror').innerText = "Tercüme: " + studentSpeech + " (Analyzing logic...)";
    
    score += 50;
    document.getElementById('score').innerText = score;
}
