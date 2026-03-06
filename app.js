// your secure google middleman link
const MIDDLEMAN_URL = "https://script.google.com/macros/s/AKfycbyPCH-SeqGBDjll7Eo30BgpTY7iKoJP2AvQXg6D68AMZrPpVAXE6QZgl7MUHYbAqlvN/exec";

const screens = {
    logo: document.getElementById('logo-screen'),
    instr: document.getElementById('instructions-screen'),
    lobby: document.getElementById('lobby-screen'),
    game: document.getElementById('game-screen')
};

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
        };
        grid.appendChild(card);
    });
}

// 2. load data
buildLobby(fallbackCasinos);
fetch('./casinos.json')
    .then(res => res.json())
    .then(data => {
        variables = data.variables;
        buildLobby(data.casinos);
    }).catch(e => console.log("using fallback data"));

// 3. unbreakable navigation
document.getElementById('to-instructions-btn').onclick = () => { screens.logo.classList.add('hidden'); screens.instr.classList.remove('hidden'); };
document.getElementById('to-lobby-btn').onclick = () => { screens.instr.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };
document.getElementById('back-to-lobby').onclick = () => { screens.game.classList.add('hidden'); screens.lobby.classList.remove('hidden'); };

// 4. smart spin (clears board and waits for manual click)
document.getElementById('spin-btn').onclick = () => {
    document.getElementById('feedback-area').classList.add('hidden'); // clears old AI message
    document.getElementById('mic-btn').classList.add('hidden'); // hide mic while spinning
    
    const reel = document.getElementById('variable-text');
    let count = 0;
    const interval = setInterval(() => {
        let tempVar;
        do {
            tempVar = variables[Math.floor(Math.random() * variables.length)];
        } while (tempVar === lastVar);
        
        currentVar = tempVar;
