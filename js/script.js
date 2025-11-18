// --- VARIABEL GLOBAL DAN ELEMEN HTML ---

let currentRound = 0;
let totalQuestions = 0;
let currentSecretWord = '';
let availableWords = [];

// Elemen Halaman Alur (Intro, Deskripsi, Aturan)
const introContainer = document.getElementById('intro-container');
const descriptionContainer = document.getElementById('description-container');
const rulesContainer = document.getElementById('rules-container');
const nextToRulesButton = document.getElementById('next-to-rules-button');
const startSetupButton = document.getElementById('start-setup-button');
const progressBar = document.getElementById('progress-bar'); 

// Elemen Halaman Setup
const setupContainer = document.getElementById('setup-container');
const startGameButton = document.getElementById('start-game-button');
const categorySelect = document.getElementById('category-select');
const numQuestionsInput = document.getElementById('num-questions');

// Elemen Halaman Game Utama
const gameContainer = document.getElementById('game-container');
const roundDisplay = document.getElementById('round-display');
const hintDisplay = document.getElementById('hint-display');
const showHintButton = document.getElementById('show-hint-button');
const scrambledArea = document.getElementById('scrambled-letters-area');
const userGuess = document.getElementById('user-guess');
const submitButton = document.getElementById('submit-button');
const messageArea = document.getElementById('message-area');
const keyboardContainer = document.getElementById('keyboard-container');



function shuffleWord(word) {
    let array = word.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

/**
 * Membuat tombol keyboard virtual A-Z dan tombol HAPUS.
 */
function createVirtualKeyboard() {
    keyboardContainer.innerHTML = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Tambahkan tombol-tombol huruf
    alphabet.split('').forEach(letter => {
        const keyButton = document.createElement('button');
        keyButton.textContent = letter;
        keyButton.classList.add('key-button');
        keyButton.addEventListener('click', () => {
            userGuess.value += letter;
        });
        keyboardContainer.appendChild(keyButton);
    });

    // Tambahkan tombol fungsional (Hapus/Backspace)
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'HAPUS';
    deleteButton.classList.add('key-button', 'function-key');
    deleteButton.addEventListener('click', () => {
        userGuess.value = userGuess.value.slice(0, -1);
    });
    keyboardContainer.appendChild(deleteButton);
}


// --- FUNGSI ALUR LAYAR ---

function showScreen(screenToShow) {
    // Sembunyikan semua layar alur
    introContainer.classList.add('hidden');
    descriptionContainer.classList.add('hidden');
    rulesContainer.classList.add('hidden');
    setupContainer.classList.add('hidden');
    gameContainer.classList.add('hidden'); 
    
    // Tampilkan layar yang diminta
    screenToShow.classList.remove('hidden');
}

/**
 * Fungsi inisialisasi yang dijalankan saat halaman dimuat (INTRO).
 */
function initGame() {
    // Tampilkan Intro Loading
    showScreen(introContainer);
    
    // 1. Mulai animasi progress bar
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.width = '100%'; 
        }, 100);
    }

    // 2. Setelah 7 detik, pindah ke halaman Deskripsi
    setTimeout(() => {
        showScreen(descriptionContainer);
    }, 4000); 
}


// --- FUNGSI INTI GAME ---

/**
 * Mempersiapkan dan memulai game.
 */
function startGame() {
    const selectedCategory = categorySelect.value;
    const requestedQuestions = parseInt(numQuestionsInput.value);
    
    const sourceWords = KOSA_KATA_GAME[selectedCategory];
    
    // Validasi jumlah pertanyaan (minimal 5, kelipatan 5, dan tidak melebihi stok kata)
    if (requestedQuestions <= 0 || requestedQuestions % 5 !== 0 || requestedQuestions > sourceWords.length) {
        alert(`Masukkan jumlah pertanyaan kelipatan 5 yang valid dan tidak melebihi ${sourceWords.length} kata!`);
        return;
    }

    // 1. Inisialisasi variabel game
    totalQuestions = requestedQuestions;
    currentRound = 0;

    // 2. Ambil kata secara acak (tanpa pengulangan)
    let wordsToChooseFrom = [...sourceWords]; 
    availableWords = [];
    
    for (let i = 0; i < totalQuestions; i++) {
        const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length);
        availableWords.push(wordsToChooseFrom[randomIndex]);
        wordsToChooseFrom.splice(randomIndex, 1);
    }

    // 3. Sembunyikan setup, tampilkan game utama
    showScreen(gameContainer); 

    // 4. Muat putaran pertama
    loadRound();
}

/**
 * Memuat putaran game berikutnya.
 */
function loadRound() {
    currentRound++; 
    
    // Logika game selesai
    if (currentRound > totalQuestions) {
        roundDisplay.textContent = "🥳 SELAMAT! Semua Pertanyaan Selesai!";
        messageArea.textContent = `Anda berhasil menyelesaikan ${totalQuestions} kata krama alus!`;
        
        // Sembunyikan elemen input dan tombol
        userGuess.style.display = 'none';
        submitButton.style.display = 'none';
        showHintButton.style.display = 'none';
        scrambledArea.textContent = "Coba mulai permainan baru!";
        keyboardContainer.innerHTML = '';
        return;
    }
    
    // Ambil data kata untuk putaran saat ini
    const levelData = availableWords[currentRound - 1];
    currentSecretWord = levelData.krama;

    // Acak huruf dan update tampilan
    const shuffledLetters = shuffleWord(currentSecretWord);
    roundDisplay.textContent = `Putaran ke-${currentRound} dari ${totalQuestions}`;
    scrambledArea.textContent = shuffledLetters; 

    // RESET PETUNJUK
    hintDisplay.textContent = levelData.hint;
    hintDisplay.classList.add('hidden-hint');
    showHintButton.style.display = 'block';

    // RESET INPUT DAN KEYBOARD
    userGuess.value = '';
    messageArea.textContent = '';
    createVirtualKeyboard(); 
}

/**
 * Memeriksa tebakan pengguna.
 */
function checkGuess() {
    const userInput = userGuess.value.toUpperCase().trim();
    
    if (userInput === currentSecretWord) {
        messageArea.textContent = "✅ BENAR! Panjenengan pinter sanget!";
        messageArea.style.color = 'green';
        
        setTimeout(() => {
            loadRound(); // Lanjut ke putaran berikutnya
        }, 1500); 
    } else {
        messageArea.textContent = "❌ SALAH! Cobi malih, nggih. Gunakan tombol petunjuk jika kesulitan.";
        messageArea.style.color = 'red';
    }
}

/**
 * Menampilkan petunjuk saat tombol diklik.
 */
function showHint() {
    hintDisplay.classList.remove('hidden-hint'); 
    showHintButton.style.display = 'none'; 
}


// --- EVENT LISTENERS ---

// Alur Intro -> Deskripsi -> Petunjuk -> Setup
nextToRulesButton.addEventListener('click', () => {
    showScreen(rulesContainer);
});

startSetupButton.addEventListener('click', () => {
    showScreen(setupContainer);
});

// Memulai Game
startGameButton.addEventListener('click', startGame);

// Event Listeners Game
submitButton.addEventListener('click', checkGuess);
showHintButton.addEventListener('click', showHint);

userGuess.addEventListener('input', function() {
    // Hanya perbolehkan huruf A-Z, konversi ke huruf kapital
    let value = userGuess.value.toUpperCase().replace(/[^A-Z]/g, ''); 
    userGuess.value = value;
});

// Event Listener untuk tombol Enter (keyboard fisik)
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkGuess();
        e.preventDefault(); 
    }
});

// Inisialisasi: Mulai alur game
initGame();