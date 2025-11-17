// Ini data game beserta petunjuknya
// =================================
const allGameWords = [
    { krama: "SEKOLAHAN", hint: "Tempat menuntut ilmu." },
    { krama: "GRIYA", hint: "Istilah krama alus untuk rumah." },
    { krama: "SIRAH", hint: "Anggota badan paling atas (kepala)." },
    { krama: "SARE", hint: "Istilah krama alus untuk tidur." },
    { krama: "DHAHAR", hint: "Istilah krama alus untuk makan." },
    { krama: "ASTA", hint: "Istilah krama alus untuk tangan." },
    { krama: "SEPATU", hint: "Alas kaki untuk melindungi telapak kaki." },
    { krama: "PRING", hint: "Tumbuhan keras berongga yang banyak digunakan untuk bangunan (bambu)." },

];

// Inisialisasi variabel game
let currentRound = 1;
let currentSecretWord = '';
let hintShown = false; // Flag untuk melacak apakah hint sudah ditampilkan

//==============================
//Dapatkan elemen-elemen HTML
//==============================
const roundDisplay = document.getElementById('round-display'); // UBAH INI
const hintDisplay = document.getElementById('hint-display');
const showHintButton = document.getElementById('show-hint-button'); // ELEMEN BARU
const scrambledArea = document.getElementById('scrambled-letters-area');
const userGuess = document.getElementById('user-guess');
const submitButton = document.getElementById('submit-button');
const messageArea = document.getElementById('message-area');
const keyboardContainer = document.getElementById('keyboard-container');


//============================================== 
//FUNCTION INTI UNTUK MENGACAK KATA DAN HURUF 
// ==============================================

// =======================
// mengacak kata dan huruf
// =======================
function getRandomWord() {
    // Cek apakah masih ada kata
    if (allGameWords.length === 0) {
        return null;
    }
    
    // Pilih indeks (nomor) acak
    const randomIndex = Math.floor(Math.random() * allGameWords.length);
    
    // Ambil objek kata dari indeks tersebut
    const wordData = allGameWords[randomIndex];
    
    // **PENTING:** Hapus kata yang sudah dipakai agar tidak berulang
    allGameWords.splice(randomIndex, 1); 
    
    return wordData;
}

function shuffleWord(word) {
    let array = word.split('');
    // Algoritma Fisher-Yates (populer untuk mengacak)
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

/**
 * Membuat tombol keyboard virtual A-Z.
 */
function createVirtualKeyboard() {
    keyboardContainer.innerHTML = ''; // Kosongkan keyboard lama
    
    // Daftar semua huruf yang ingin ditampilkan
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Tambahkan tombol-tombol huruf
    alphabet.split('').forEach(letter => {
        const keyButton = document.createElement('button');
        keyButton.textContent = letter;
        keyButton.classList.add('key-button');
        // Tambahkan event listener untuk tombol huruf
        keyButton.addEventListener('click', () => {
            // Logika: Tambahkan huruf ke input
            userGuess.value += letter;
        });
        keyboardContainer.appendChild(keyButton);
    });

    // Tambahkan tombol fungsional (Hapus/Backspace)
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'HAPUS';
    deleteButton.classList.add('key-button', 'function-key');
    deleteButton.addEventListener('click', () => {
        // Logika: Hapus satu huruf dari belakang
        userGuess.value = userGuess.value.slice(0, -1);
    });
    keyboardContainer.appendChild(deleteButton);
}


// =================================
// FUNCTION UNTUK MEMUAT LEVEL 
// =================================

function loadLevel() {
    if (allGameWords.length === 0) {
        roundDisplay.textContent = "Kabeh putaran wis rampung!";
        hintDisplay.textContent = "Anda telah menguasai kamus kami. Mulai ulang halaman untuk bermain lagi!";
        hintDisplay.classList.remove('hidden-hint'); // Pastikan pesan akhir terlihat
        showHintButton.style.display = 'none';
        scrambledArea.textContent = "";
        userGuess.style.display = 'none';
        submitButton.style.display = 'none';
        messageArea.textContent = "";
        return;
    }
    const levelData = getRandomWord();
    currentSecretWord = levelData.krama;
    const shuffledLetters = shuffleWord(currentSecretWord);
    
    roundDisplay.textContent = `Putaran ke-${currentRound}`;
    scrambledArea.textContent = shuffledLetters; 

    // 4. RESET PETUNJUK
    hintDisplay.textContent = levelData.hint;
    hintDisplay.classList.add('hidden-hint'); // Sembunyikan petunjuk
    showHintButton.style.display = 'block'; // Tampilkan tombol petunjuk

    createVirtualKeyboard(); 

    userGuess.value = '';
    messageArea.textContent = '';
}

// =================================
// Event Listener untuk tombol petunjuk

function checkGuess() {
    const userInput = userGuess.value.toUpperCase().trim();
    
    // ngecek jawaban
    if (userInput === currentSecretWord) {
        messageArea.textContent = "✅ BENAR! Panjenengan pinter sanget!";
        messageArea.style.color = 'green';
        
        // Lanjut ke level berikutnya setelah jeda sebentar
        setTimeout(() => {
            currentRound++;
            loadLevel();
        }, 1500); 
    } else {
        messageArea.textContent = "❌ SALAH! Cobi malih, nggih.";
        messageArea.style.color = 'red';
    }
}

// --- FUNGSI BARU UNTUK MENAMPILKAN HINT ---
function showHint() {
    hintDisplay.classList.remove('hidden-hint'); // Hapus kelas CSS yang menyembunyikan
    showHintButton.style.display = 'none'; // Sembunyikan tombol setelah diklik
}

// Tambahkan Event Listener (Mendengarkan klik tombol)
submitButton.addEventListener('click', checkGuess);

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkGuess();
        e.preventDefault(); 
    }
});

showHintButton.addEventListener('click', showHint);

// Inisialisasi game saat halaman dimuat
loadLevel();