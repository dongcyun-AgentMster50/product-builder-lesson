document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const bonusCheckbox = document.getElementById('bonus-checkbox');
    const numbersDisplay = document.getElementById('numbers-display');
    const timestampElem = document.getElementById('timestamp');

    let allNumberSets = []; // 모든 번호 세트를 저장할 배열

    // 번호에 따른 색상 반환
    function getNumberColor(number) {
        if (number <= 10) return '#FBBF24'; // 노란색
        if (number <= 20) return '#3B82F6'; // 파란색
        if (number <= 30) return '#EF4444'; // 빨간색
        if (number <= 40) return '#6B7280'; // 회색
        return '#10B981'; // 녹색
    }

    // 단일 번호 세트 생성
    function generateSingleSet(includeBonus) {
        const count = includeBonus ? 7 : 6;
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    // 5개의 번호 세트를 생성하고 화면에 표시
    function generateAndDisplaySets() {
        numbersDisplay.innerHTML = '';
        allNumberSets = [];

        for (let i = 0; i < 5; i++) {
            const includeBonus = bonusCheckbox.checked;
            const numberSet = generateSingleSet(includeBonus);
            allNumberSets.push(numberSet);

            const setBox = document.createElement('div');
            setBox.className = 'result-set-box';

            const label = document.createElement('span');
            label.className = 'set-label';
            label.textContent = `자동 ${i + 1}`;

            const numberCirclesContainer = document.createElement('div');
            numberCirclesContainer.className = 'number-circles-container';

            numberSet.forEach((number, index) => {
                const isBonus = includeBonus && index === numberSet.length - 1;
                const circle = document.createElement('div');
                circle.className = 'number-circle';
                circle.textContent = number;
                // 보너스 번호는 항상 녹색으로 표시
                circle.style.backgroundColor = isBonus ? '#10B981' : getNumberColor(number);
                numberCirclesContainer.appendChild(circle);
            });
            
            setBox.appendChild(label);
            setBox.appendChild(numberCirclesContainer);
            numbersDisplay.appendChild(setBox);
        }

        updateTimestamp();
    }

    function updateTimestamp() {
        const now = new Date();
        timestampElem.textContent = `추천 완료! (${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. ${now.getHours()}시 ${now.getMinutes()}분 ${now.getSeconds()}초)`;
    }

    function copyToClipboard() {
        if (allNumberSets.length === 0) {
            alert('먼저 번호를 추천받아 주세요.');
            return;
        }
        const numbersString = allNumberSets.map(set => set.join(', ')).join('\n');
        navigator.clipboard.writeText(numbersString).then(() => {
            alert('5세트의 번호가 클립보드에 복사되었습니다.');
        }).catch(err => {
            alert('복사에 실패했습니다.');
            console.error('Copy failed', err);
        });
    }

    generateBtn.addEventListener('click', generateAndDisplaySets);
    copyBtn.addEventListener('click', copyToClipboard);
    bonusCheckbox.addEventListener('change', generateAndDisplaySets);

    generateAndDisplaySets(); // 초기 로드 시 번호 생성
});
