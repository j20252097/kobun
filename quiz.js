document.addEventListener('DOMContentLoaded', () => {
    let quizData = [];
    let currentQuiz = {};
    let shuffledIndices = [];
    let currentIndex = 0;

    const questionText = document.getElementById('question-text');
    const checkButton = document.getElementById('check-button');
    const nextButton = document.getElementById('next-button');
    const resultArea = document.getElementById('result-area');
    const toggleTableButton = document.getElementById('toggle-table-button'); // 追加
    const katsuyouTable = document.getElementById('katsuyou-table-container'); // 追加
    
    const inputFields = document.querySelectorAll('.answer-grid input');
    const correctAnswerDisplays = document.querySelectorAll('.correct-answer'); // 追加

    // 活用表の表示/非表示を切り替える
    toggleTableButton.addEventListener('click', () => {
        const isHidden = katsuyouTable.style.display === 'none' || katsuyouTable.style.display === '';
        katsuyouTable.style.display = isHidden ? 'block' : 'none';
        toggleTableButton.textContent = isHidden ? '活用表を非表示' : '活用表を表示/非表示';
    });


    // 1. JSONデータの読み込み (前と同じ)
    async function loadQuizData() {
        try {
            const response = await fetch('kogo.json'); 
            if (!response.ok) {
                throw new Error('kogo.jsonファイルの読み込みに失敗しました。');
            }
            quizData = await response.json();
            
            if(quizData.length === 0) {
                 questionText.textContent = '問題データが空です。';
                 return;
            }
            
            setupQuiz();
        } catch (error) {
            console.error(error);
            questionText.textContent = '問題の読み込みに失敗しました。';
        }
    }

    // 2. クイズのセットアップ（問題のシャッフル） (前と同じ)
    function setupQuiz() {
        shuffledIndices = quizData.map((_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }
        currentIndex = 0;
        displayQuestion();
    }

    // 3. 問題の表示 (正解表示エリアのリセットを追加)
    function displayQuestion() {
        if (currentIndex >= shuffledIndices.length) {
            questionText.textContent = '全問終了！ 🎉';
            clearAllInputs();
            inputFields.forEach(input => input.disabled = true);
            checkButton.disabled = true;
            nextButton.disabled = false; 
            nextButton.textContent = 'リスタート';
            currentIndex = 0;
            return;
        }

        currentQuiz = quizData[shuffledIndices[currentIndex]];
        questionText.textContent = currentQuiz.question;

        // UIリセット
        clearAllInputs();
        resetCorrectAnswerDisplays(); // 正解表示をリセット
        resultArea.textContent = '';
        resultArea.className = '';
        checkButton.disabled = false; 
        nextButton.disabled = true;  
        nextButton.textContent = '次の問題';
    }

    // 4. 入力欄のクリアとスタイルのリセット (前と同じ)
    function clearAllInputs() {
        inputFields.forEach(input => {
            input.value = '';
            input.className = '';
            input.disabled = false; 
            input.placeholder = '';
        });
    }

    // 4.5 正解表示エリアのリセット (新規追加)
    function resetCorrectAnswerDisplays() {
        correctAnswerDisplays.forEach(p => {
            p.textContent = '';
        });
    }

    // 5. 採点処理 (不正解時の正解表示機能を追加)
    function checkAnswer() {
        let allCorrect = true;
        resetCorrectAnswerDisplays(); // 採点前にリセット

        inputFields.forEach(input => {
            const key = input.dataset.answerKey; 
            const correctAnswer = currentQuiz.answers[key]; 
            const userAnswer = input.value.trim(); 
            const answerDisplay = document.querySelector(`.correct-answer[data-key="${key}"]`); // 正解表示要素を取得

            if (!correctAnswer) return; 

            const correctOptions = correctAnswer.split('・').map(opt => opt.trim());
            const isMatch = correctOptions.some(option => option === userAnswer);

            if (isMatch) {
                input.className = 'correct'; 
            } else {
                input.className = 'incorrect'; 
                allCorrect = false;
                
                // ***【機能追加】不正解の場合、下に正しい答えを表示する***
                answerDisplay.textContent = `正: ${correctAnswer}`;
            }
            input.disabled = true; 
        });

        // 全体の結果表示 (前と同じ)
        if (allCorrect) {
            resultArea.textContent = '正解！ 💮';
            resultArea.className = 'correct';
        } else {
            resultArea.textContent = '不正解... ❌';
            resultArea.className = 'incorrect';
        }

        checkButton.disabled = true; 
        nextButton.disabled = false; 
    }

    // 6. 次の問題へ (前と同じ)
    function nextQuestion() {
        if (nextButton.textContent === 'リスタート') {
            setupQuiz(); 
        } else {
            currentIndex++;
            displayQuestion();
        }
    }

    // イベントリスナーの設定 (前と同じ + Enterキー操作の改善)
    checkButton.addEventListener('click', checkAnswer);
    nextButton.addEventListener('click', nextQuestion);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!checkButton.disabled) {
                checkAnswer();
            } else if (!nextButton.disabled) {
                nextQuestion();
            }
        }
    });

    // 初期化
    loadQuizData();
});
