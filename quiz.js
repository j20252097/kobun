document.addEventListener('DOMContentLoaded', () => {
    let quizData = [];
    let currentQuiz = {};
    let shuffledIndices = [];
    let currentIndex = 0;

    const questionText = document.getElementById('question-text');
    const checkButton = document.getElementById('check-button');
    const nextButton = document.getElementById('next-button');
    const resultArea = document.getElementById('result-area');
    
    // 全ての入力欄を取得
    const inputFields = document.querySelectorAll('.answer-grid input');

    // 1. JSONデータの読み込み
    async function loadQuizData() {
        try {
            // "kogo.json" を読み込む
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

    // 2. クイズのセットアップ（問題のシャッフル）
    function setupQuiz() {
        // 問題のインデックス配列を作成 (0, 1, 2, ...)
        shuffledIndices = quizData.map((_, i) => i);
        
        // 配列をシャッフル (Fisher-Yates shuffle)
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }
        
        currentIndex = 0;
        displayQuestion();
    }

    // 3. 問題の表示
    function displayQuestion() {
        if (currentIndex >= shuffledIndices.length) {
            // 全問終了
            questionText.textContent = '全問終了！ 🎉';
            clearAllInputs();
            inputFields.forEach(input => input.disabled = true); // 全て入力不可に
            checkButton.disabled = true;
            nextButton.disabled = false; // リスタートボタンは有効
            nextButton.textContent = 'リスタート';
            currentIndex = 0; // リスタートできるようにインデックスをリセット
            return;
        }

        // 次の問題を取得
        currentQuiz = quizData[shuffledIndices[currentIndex]];
        questionText.textContent = currentQuiz.question;

        // UIリセット
        clearAllInputs();
        resultArea.textContent = '';
        resultArea.className = '';
        checkButton.disabled = false; // 採点ボタンを有効化
        nextButton.disabled = true;  // 次へボタンを無効化
        nextButton.textContent = '次の問題';
    }

    // 4. 入力欄のクリアとスタイルのリセット
    function clearAllInputs() {
        inputFields.forEach(input => {
            input.value = '';
            input.className = '';
            input.disabled = false; // 入力可能に
            input.placeholder = ''; // プレースホルダーも消す
        });
    }

    // 5. 採点処理
    function checkAnswer() {
        let allCorrect = true;
        
        inputFields.forEach(input => {
            // inputタグの data-answer-key 属性 (gokan, katsuyou, mizen...) を取得
            const key = input.dataset.answerKey; 
            const correctAnswer = currentQuiz.answers[key]; // JSONから正解を取得
            const userAnswer = input.value.trim(); // ユーザーの入力（前後の空白削除）

            if (!correctAnswer) return; // JSONに解答がないキーはスキップ

            // 正解判定
            // 形容詞・形容動詞の「なり・に」や「く・から」のように
            // 「・」で区切られている解答に対応
            const correctOptions = correctAnswer.split('・').map(opt => opt.trim());
            
            // ユーザーの入力が正解パターンのいずれかに一致するか
            const isMatch = correctOptions.some(option => option === userAnswer);

            if (isMatch) {
                input.className = 'correct'; // 正解クラス
            } else {
                input.className = 'incorrect'; // 不正解クラス
                allCorrect = false;
            }
            input.disabled = true; // 採点後は入力不可に
        });

        // 全体の結果表示
        if (allCorrect) {
            resultArea.textContent = '正解！ 💮';
            resultArea.className = 'correct';
        } else {
            resultArea.textContent = '不正解... ❌';
            resultArea.className = 'incorrect';
            
            // 不正解だった箇所の正解をヒントとして表示
            inputFields.forEach(input => {
                if (input.classList.contains('incorrect')) {
                    const key = input.dataset.answerKey;
                    const correctAnswer = currentQuiz.answers[key];
                    // 答えが空欄だった場合はプレースホルダーに正解を表示
                    if(input.value === "") {
                        input.placeholder = `正: ${correctAnswer}`;
                    }
                }
            });
        }

        checkButton.disabled = true; // 採点ボタンを無効化
        nextButton.disabled = false; // 次へボタンを有効化
    }

    // 6. 次の問題へ
    function nextQuestion() {
        if (nextButton.textContent === 'リスタート') {
            setupQuiz(); // シャッフルからやり直し
        } else {
            currentIndex++; // 次の問題へ
            displayQuestion();
        }
    }

    // イベントリスナーの設定
    checkButton.addEventListener('click', checkAnswer);
    nextButton.addEventListener('click', nextQuestion);
    
    // Enterキーで採点・次に進む（利便性のため）
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // フォームの送信を防ぐ
            if (!checkButton.disabled) {
                checkAnswer(); // 採点ボタンが押せる状態なら採点
            } else if (!nextButton.disabled) {
                nextQuestion(); // 次へボタンが押せる状態なら次へ
            }
        }
    });

    // 初期化
    loadQuizData();
});
