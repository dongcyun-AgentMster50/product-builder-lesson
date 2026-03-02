const generateBtn = document.getElementById('generate');
const numbersContainer = document.getElementById('numbers');

function generateLottoSet() {
    const lottoNumbers = new Set();
    while(lottoNumbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        lottoNumbers.add(randomNumber);
    }
    return Array.from(lottoNumbers).sort((a, b) => a - b);
}

function generateMultipleSets() {
    numbersContainer.innerHTML = ''; // Clear previous sets

    for (let i = 0; i < 5; i++) {
        const sortedNumbers = generateLottoSet();

        const setDiv = document.createElement('div');
        setDiv.classList.add('lotto-set'); // A div for a single set of numbers

        sortedNumbers.forEach(number => {
            const numberDiv = document.createElement('div');
            numberDiv.classList.add('number');
            numberDiv.textContent = number;
            setDiv.appendChild(numberDiv);
        });

        numbersContainer.appendChild(setDiv);
    }
}

generateBtn.addEventListener('click', generateMultipleSets);

// Generate numbers on initial load
generateMultipleSets();
