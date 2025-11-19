// --- VARIABEL GLOBAL YANG AKAN DI-ASSIGN SAAT DOM SIAP ---
let currentRound = 0;
let totalQuestions = 0;
let currentSecretWord = '';
let availableWords = [];
let lives = 5; 
let currentLetterIndex = 0; 
let currentGuessArray = []; 
let skippedWords = []; 
let correctCount = 0;
let incorrectCount = 0;
let initialWordsCount = 0; 

// Deklarasi variabel untuk elemen HTML (akan diisi di initDOM)
let introContainer, descriptionContainer, rulesContainer, setupContainer, gameContainer, gameoverContainer, summaryContainer;
let progressBar, categorySelect, numQuestionsInput, roundDisplay, livesDisplay, hintDisplay, showHintButton, scrambledArea, letterBoxesContainer, messageArea, keyboardContainer;
let nextToRulesButton, startSetupButton, startGameButton, submitButton, skipButton, restartButton, exitButton;
let replaySkippedButton, finishGameButton, summaryMessage, summaryStats;


// --- FUNGSI UTILITAS ---

function shuffleWord(word) {
    let array = word.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

function createVirtualKeyboard() {
    keyboardContainer.innerHTML = ''; 
    const rows = ["QWERTYUIOP", "ASDFGHJKL", "⌫ZXCVBNM"];

    rows.forEach((rowString) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        
        rowString.split('').forEach(keyChar => {
            const keyButton = document.createElement('button');
            keyButton.textContent = keyChar === '⌫' ? '⌫' : keyChar;
            keyButton.classList.add('key-button');

            if (keyChar === '⌫') {
                keyButton.classList.add('function-key');
                keyButton.style.flex = '1.5';
                keyButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleInput('BACKSPACE');
                });
            } else {
                keyButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleInput(keyChar);
                });
            }
            rowDiv.appendChild(keyButton);
        });
        keyboardContainer.appendChild(rowDiv);
    });
}

function createLetterBoxes(wordLength) {
    letterBoxesContainer.innerHTML = '';
    currentGuessArray = Array(wordLength).fill('');
    currentLetterIndex = 0;
    
    for (let i = 0; i < wordLength; i++) {
        const box = document.createElement('div');
        box.classList.add('letter-box');
        if (i === 0) box.classList.add('active'); 
        letterBoxesContainer.appendChild(box);
    }
}

function updateBoxesUI() {
    const boxes = letterBoxesContainer.children;
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].textContent = currentGuessArray[i];
        boxes[i].classList.remove('active');
    }
    if (currentLetterIndex < boxes.length) {
         boxes[currentLetterIndex].classList.add('active');
    } else if (boxes.length > 0) {
        boxes[boxes.length - 1].classList.add('active');
    }
}

function handleInput(key) {
    const wordLength = currentSecretWord.length;

    if (key === 'BACKSPACE' || key === 'DELETE') {
        if (currentLetterIndex > 0) {
            if (currentGuessArray[currentLetterIndex] === '') {
                 currentLetterIndex--;
            }
            currentGuessArray[currentLetterIndex] = '';
            updateBoxesUI();
        }
    } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        if (currentLetterIndex < wordLength) {
            currentGuessArray[currentLetterIndex] = key;
            if (currentLetterIndex < wordLength - 1) {
                currentLetterIndex++;
            }
            updateBoxesUI();
        }
    } else if (key === 'ENTER') {
        checkGuess();
    }
}

function updateLivesDisplay() {
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤️";
    for (let i = lives; i < 5; i++) hearts += "🖤";
    livesDisplay.textContent = hearts;
}


// --- ALUR LAYAR (SCREEN FLOW) ---

function showScreen(screenToShow) {
    // Sembunyikan semua layar
    [introContainer, descriptionContainer, rulesContainer, setupContainer, gameContainer, gameoverContainer, summaryContainer].forEach(el => {
        if(el) el.classList.add('hidden');
    });
    // Tampilkan target
    if(screenToShow) screenToShow.classList.remove('hidden');
}

/**
 * PENTING: Initialization Function
 */
function initGame() {
    // Tampilkan Intro Loading
    showScreen(introContainer);
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.width = '100%'; 
        }, 150);
    }
    setTimeout(() => {
        showScreen(descriptionContainer);
    }, 6000); 
}

function gameOver() {
    showScreen(gameoverContainer);
}

function showSummary(isSkippedReplay = false) {
    const skippedCount = skippedWords.length;
    const totalProcessed = initialWordsCount; 
    
    summaryStats.textContent = `Total: ${totalProcessed} | Benar: ${correctCount} | Salah: ${incorrectCount} | Dilewati: ${skippedCount}`;

    if (isSkippedReplay) {
        summaryMessage.textContent = "Sesi pengulangan selesai!";
        replaySkippedButton.style.display = 'none';
    } else {
        if (skippedCount > 0) {
            summaryMessage.textContent = `Kamu melewatkan ${skippedCount} kata. Ingin coba lagi kata-kata itu?`;
            replaySkippedButton.style.display = 'inline-block';
        } else {
            summaryMessage.textContent = "Selamat! Kamu menyelesaikan semua kata!";
            replaySkippedButton.style.display = 'none';
        }
    }
    showScreen(summaryContainer);
}


// --- LOGIKA GAMEPLAY UTAMA ---

function startGame(words = null) {
    // Reset skor total
    correctCount = 0; 
    incorrectCount = 0; 
    skippedWords = [];
    
    if (words === null) {
        // MODE NORMAL (DARI SETUP)
        const selectedCategory = categorySelect.value;
        const requestedQuestions = parseInt(numQuestionsInput.value);
        
        // Cek data kosakata global (PENTING)
        if (typeof KOSA_KATA_GAME === 'undefined' || !KOSA_KATA_GAME[selectedCategory]) {
            alert("Error: Data kosakata (KOSA_KATA_GAME) tidak ditemukan. Pastikan file data.js dimuat."); 
            return;
        }
        
        let pool = [...KOSA_KATA_GAME[selectedCategory]];
        availableWords = [];
        const count = Math.min(requestedQuestions, pool.length);
        
        for (let i = 0; i < count; i++) {
            const randIndex = Math.floor(Math.random() * pool.length);
            availableWords.push(pool[randIndex]);
            pool.splice(randIndex, 1);
        }

        totalQuestions = count;
        initialWordsCount = count; // Simpan total kata awal
        lives = 5;
        
    } else {
        // MODE REPLAY
        availableWords = words;
        totalQuestions = words.length;
        initialWordsCount = words.length; 
        lives = 5; 
    }

    currentRound = 0;
    showScreen(gameContainer);
    loadRound();
}

function loadRound() {
    if (availableWords.length === 0) {
        showSummary(skippedWords.length === 0 && currentRound > 0); 
        return;
    }
    
    if (lives <= 0) {
        gameOver();
        return;
    }
    
    currentRound++;
    const levelData = availableWords.shift(); 
    currentSecretWord = levelData.krama;

    // Reset Tampilan
    roundDisplay.textContent = `Kata ke-${currentRound}`;
    scrambledArea.textContent = shuffleWord(currentSecretWord);
    updateLivesDisplay();
    
    hintDisplay.textContent = levelData.hint;
    hintDisplay.classList.add('hidden-hint');
    showHintButton.style.display = 'block';
    messageArea.textContent = '';

    // Setup Input Kotak
    createLetterBoxes(currentSecretWord.length); 
    createVirtualKeyboard();
}

function checkGuess() {
    const userInput = currentGuessArray.join('').toUpperCase();
    
    if (userInput.length !== currentSecretWord.length) {
        messageArea.textContent = "⚠️ Huruf belum lengkap!";
        messageArea.style.color = 'orange';
        return;
    }

    if (userInput === currentSecretWord) {
        correctCount++;
        messageArea.textContent = "✅ Benar!";
        messageArea.style.color = 'green';
        setTimeout(() => { loadRound(); }, 1500);
    } else {
        lives--;
        updateLivesDisplay();
        incorrectCount++;
        
        if (lives <= 0) {
            // Hitung sisa kata sebagai salah dan tampilkan Game Over
            incorrectCount += availableWords.length;
            availableWords = [];
            loadRound(); 
        } else {
            messageArea.textContent = `❌ SALAH! Kesempatan sisa: ${lives}`;
            messageArea.style.color = 'red';
            
            letterBoxesContainer.classList.add('shake');
            setTimeout(()=>letterBoxesContainer.classList.remove('shake'), 500);
            
            createLetterBoxes(currentSecretWord.length);
        }
    }
}

function handleSkip() {
    if (lives <= 0) return; 

    skippedWords.push({
        krama: currentSecretWord,
        hint: hintDisplay.textContent 
    });
    
    messageArea.textContent = "⏭️ Kata dilewati.";
    messageArea.style.color = '#457b9d';
    setTimeout(() => { loadRound(); }, 800);
}

function showHint() {
    hintDisplay.classList.remove('hidden-hint'); 
    showHintButton.style.display = 'none'; 
}


// --- FUNGSI INJEKSI DOM DAN EVENT LISTENERS ---

function initDOM() {
    // 1. Assign Element IDs ke Variabel Global
    introContainer = document.getElementById('intro-container');
    descriptionContainer = document.getElementById('description-container');
    rulesContainer = document.getElementById('rules-container');
    setupContainer = document.getElementById('setup-container');
    gameContainer = document.getElementById('game-container');
    gameoverContainer = document.getElementById('gameover-container');
    summaryContainer = document.getElementById('summary-container'); 

    progressBar = document.getElementById('progress-bar'); 
    categorySelect = document.getElementById('category-select');
    numQuestionsInput = document.getElementById('num-questions');
    roundDisplay = document.getElementById('round-display');
    livesDisplay = document.getElementById('lives-display'); 
    hintDisplay = document.getElementById('hint-display');
    showHintButton = document.getElementById('show-hint-button');
    scrambledArea = document.getElementById('scrambled-letters-area');
    letterBoxesContainer = document.getElementById('letter-boxes-container'); 
    messageArea = document.getElementById('message-area');
    keyboardContainer = document.getElementById('keyboard-container');

    nextToRulesButton = document.getElementById('next-to-rules-button');
    startSetupButton = document.getElementById('start-setup-button');
    startGameButton = document.getElementById('start-game-button');
    submitButton = document.getElementById('submit-button');
    skipButton = document.getElementById('skip-button'); 
    restartButton = document.getElementById('restart-button');
    exitButton = document.getElementById('exit-button');
    replaySkippedButton = document.getElementById('replay-skipped-button');
    finishGameButton = document.getElementById('finish-game-button');
    summaryMessage = document.getElementById('summary-message');
    summaryStats = document.getElementById('summary-stats');

    // 2. Tambahkan Event Listeners setelah elemen dipastikan ada
    nextToRulesButton.addEventListener('click', () => showScreen(rulesContainer));
    startSetupButton.addEventListener('click', () => showScreen(setupContainer));
    startGameButton.addEventListener('click', () => startGame(null));

    submitButton.addEventListener('click', checkGuess);
    skipButton.addEventListener('click', handleSkip);
    showHintButton.addEventListener('click', showHint);

    restartButton.addEventListener('click', () => showScreen(setupContainer));
    exitButton.addEventListener('click', () => showScreen(descriptionContainer));
    finishGameButton.addEventListener('click', () => showScreen(descriptionContainer));

    replaySkippedButton.addEventListener('click', () => {
        const wordsToReplay = [...skippedWords];
        skippedWords = [];
        startGame(wordsToReplay);
    });

    document.addEventListener('keydown', (e) => {
        if (!gameContainer.classList.contains('hidden')) {
            const key = e.key.toUpperCase();
            
            if (key.length === 1 && key >= 'A' && key <= 'Z') {
                handleInput(key);
            } else if (key === 'BACKSPACE' || key === 'DELETE') {
                handleInput('BACKSPACE');
            } else if (key === 'ENTER') {
                checkGuess();
            }
        }
    });
    
    // 3. Mulai Game
    initGame();
}

// Event yang menjamin semua HTML sudah dimuat sebelum menjalankan JS
window.addEventListener('load', initDOM);