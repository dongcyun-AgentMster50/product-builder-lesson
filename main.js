document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const bonusCheckbox = document.getElementById('bonus-checkbox');
    const numbersDisplay = document.getElementById('numbers-display');
    const timestampElem = document.getElementById('timestamp');
    const themeToggle = document.getElementById('theme-toggle');
    const THEME_STORAGE_KEY = 'lotto-theme';

    let allNumberSets = []; // 모든 번호 세트를 저장할 배열

    function applyTheme(theme) {
        const nextTheme = theme === 'light' ? 'light' : 'dark';
        document.body.dataset.theme = nextTheme;
        themeToggle.textContent = nextTheme === 'dark' ? '화이트 모드' : '다크 모드';
        themeToggle.setAttribute('aria-pressed', String(nextTheme === 'light'));
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        applyTheme(savedTheme || 'dark');
    }

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
        const mainCount = includeBonus ? 5 : 6;
        const numbers = new Set();
        
        // 메인 번호 생성
        while (numbers.size < mainCount) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        const mainNumbers = Array.from(numbers).sort((a, b) => a - b);
        
        let bonusNumber = null;
        if (includeBonus) {
            while (true) {
                const randomBonus = Math.floor(Math.random() * 45) + 1;
                if (!numbers.has(randomBonus)) {
                    bonusNumber = randomBonus;
                    break;
                }
            }
        }
        
        return { main: mainNumbers, bonus: bonusNumber };
    }

    // 5개의 번호 세트를 생성하고 화면에 표시
    function generateAndDisplaySets() {
        numbersDisplay.innerHTML = '';
        allNumberSets = [];

        for (let i = 0; i < 5; i++) {
            const includeBonus = bonusCheckbox.checked;
            const { main, bonus } = generateSingleSet(includeBonus);
            
            // 복사용 데이터 저장
            const fullSetString = bonus !== null ? `${main.join(', ')} + ${bonus}` : main.join(', ');
            allNumberSets.push(fullSetString);

            const setBox = document.createElement('div');
            setBox.className = 'result-set-box';

            const label = document.createElement('span');
            label.className = 'set-label';
            label.textContent = `자동 ${i + 1}`;

            const numberCirclesContainer = document.createElement('div');
            numberCirclesContainer.className = 'number-circles-container';

            // 메인 번호 표시
            main.forEach(number => {
                const circle = document.createElement('div');
                circle.className = 'number-circle';
                circle.textContent = number;
                circle.style.backgroundColor = getNumberColor(number);
                numberCirclesContainer.appendChild(circle);
            });

            // 보너스 번호 표시 (있을 경우)
            if (bonus !== null) {
                const plusSign = document.createElement('span');
                plusSign.className = 'bonus-separator';
                plusSign.textContent = '+';
                numberCirclesContainer.appendChild(plusSign);

                const bonusCircle = document.createElement('div');
                bonusCircle.className = 'number-circle';
                bonusCircle.textContent = bonus;
                bonusCircle.style.backgroundColor = '#10B981'; // 보너스는 녹색 고정
                numberCirclesContainer.appendChild(bonusCircle);
            }
            
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
        const numbersString = allNumberSets.join('\n');
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
    themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });

    initializeTheme();
    generateAndDisplaySets(); // 초기 로드 시 번호 생성
});
