  const numberGrid      = document.getElementById("number-grid");
  const startBtn        = document.getElementById("start-btn");
  const playAgainBtn    = document.getElementById("play-again-btn");
  const setupPanel      = document.getElementById("setup-panel");
  const quizPanel       = document.getElementById("quiz-panel");
  const summaryPanel    = document.getElementById("summary-panel");
  const quizTable       = document.getElementById("quiz-table");
  const timerPill       = document.getElementById("timer-pill");
  const remainingPill   = document.getElementById("remaining-pill");
  const attemptsPill    = document.getElementById("attempts-pill");
  const masteredPill    = document.getElementById("mastered-pill");
  const sessionProgress = document.getElementById("session-progress");
  const questionText    = document.getElementById("question-text");
  const mcGrid          = document.getElementById("mc-grid");
  const feedback        = document.getElementById("feedback");
  const summaryText     = document.getElementById("summary-text");
  const summaryDetail   = document.getElementById("summary-detail");
  const modeMC          = document.getElementById("mode-mc");
  const modeType        = document.getElementById("mode-type");
  const timerOffBtn     = document.getElementById("timer-off");
  const timerOnBtn      = document.getElementById("timer-on");
  const numberEntry     = document.getElementById("number-entry");
  const answerInput     = document.getElementById("answer-input");
  const submitAnswerBtn = document.getElementById("submit-answer-btn");
  const exitBtn         = document.getElementById("exit-btn");
  const scoreTotalEl    = document.getElementById("score-total-el");

  const STORAGE_KEY = "multiply_learn_states";
  const STATE_EMOJI = { n: "❔", lg: "🙂", dg: "⭐", or: "😕", rd: "😰" };
  const STATE_LABEL = { n: "Denenmedi", lg: "Az bildim", dg: "Ustalaştım!", or: "Zorlandım", rd: "Unutuyorum" };
  const TIME_PER_Q  = 3;

  let selectedNumbers    = new Set();
  let filterStates       = new Set();
  let questionQueue      = [];
  let sessionFacts       = [];
  let sessionCorrectKeys = new Set();
  let currentQuestion    = null;
  let locked             = false;
  let gameActive         = false;
  let sessionAttempts    = 0;
  let inputMode          = "mc";
  let timerMode          = false;
  let timerInterval      = null;
  let timeLeft           = 0;

  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  function stateKey(n, m) { return `${n}_${m}`; }
  function getState(d, n, m) { return d[stateKey(n, m)] || "n"; }
  function nextState(current, correct) {
    if (correct) {
      if (current === "dg") return "dg";
      if (current === "lg") return "dg";
      return "lg";
    } else {
      if (current === "or" || current === "rd") return "rd";
      return "or";
    }
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateChoices(correct) {
    const offs = shuffle([-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7]);
    const wrong = [];
    for (const o of offs) {
      const c = correct + o;
      if (c > 0 && c !== correct && !wrong.includes(c)) {
        wrong.push(c);
        if (wrong.length === 2) break;
      }
    }
    return shuffle([correct, ...wrong]);
  }

  function renderTable(n) {
    const d = loadData();
    quizTable.innerHTML = "";
    for (let m = 2; m <= 9; m++) {
      const row = document.createElement("div");
      row.className = "trow";
      row.dataset.m = m;
      if (currentQuestion && currentQuestion.factorB === m) row.classList.add("current");
      row.innerHTML = `<span>${m}</span><span class="trow-emoji">${STATE_EMOJI[getState(d, n, m)]}</span>`;
      quizTable.appendChild(row);
    }
  }

  function updateTableRow(m) {
    if (filterStates.size > 0 || selectedNumbers.size !== 1) return;
    const d = loadData();
    const row = quizTable.querySelector(`[data-m="${m}"]`);
    if (!row) return;
    row.querySelector(".trow-emoji").textContent = STATE_EMOJI[getState(d, [...selectedNumbers][0], m)];
  }

  function highlightCurrentRow() {
    if (filterStates.size > 0 || selectedNumbers.size !== 1) return;
    quizTable.querySelectorAll(".trow").forEach(r => r.classList.remove("current"));
    if (currentQuestion) {
      const row = quizTable.querySelector(`[data-m="${currentQuestion.factorB}"]`);
      if (row) row.classList.add("current");
    }
  }

  function buildNumberButtons() {
    numberGrid.innerHTML = "";
    const d = loadData();
    for (let n = 2; n <= 9; n++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "number-btn";
      btn.dataset.n = n;

      let mastered = 0;
      for (let m = 2; m <= 9; m++)
        if (getState(d, n, m) === "dg") mastered++;

      btn.appendChild(document.createTextNode(n));
      const badge = document.createElement("span");
      badge.className = "mbadge";
      badge.textContent = `⭐ ${mastered}/8`;
      btn.appendChild(badge);

      btn.addEventListener("click", () => {
        if (selectedNumbers.has(n)) selectedNumbers.delete(n);
        else selectedNumbers.add(n);
        btn.classList.toggle("active", selectedNumbers.has(n));
        startBtn.disabled = selectedNumbers.size === 0 && filterStates.size === 0;
        buildEmojiPresets();
      });
      numberGrid.appendChild(btn);
    }
  }

  function buildEmojiPresets() {
    const container = document.getElementById("emoji-presets");
    const d = loadData();
    container.innerHTML = "";
    const numsToCount = selectedNumbers.size > 0 ? [...selectedNumbers] : [2,3,4,5,6,7,8,9];
    ["n","lg","dg","or","rd"].forEach(state => {
      let count = 0;
      for (const n of numsToCount)
        for (let m = 2; m <= 9; m++)
          if (getState(d, n, m) === state) count++;
      if (count === 0) filterStates.delete(state);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "emoji-preset-btn";
      btn.disabled = count === 0;
      if (filterStates.has(state)) btn.classList.add("active");
      btn.innerHTML = `<span class="preset-count">${count}</span><span class="preset-emoji">${STATE_EMOJI[state]}</span><span class="preset-label">${STATE_LABEL[state]}</span>`;
      btn.addEventListener("click", () => {
        if (filterStates.has(state)) filterStates.delete(state);
        else filterStates.add(state);
        buildEmojiPresets();
      });
      container.appendChild(btn);
    });
    startBtn.disabled = selectedNumbers.size === 0 && filterStates.size === 0;
  }

  function buildQueue() {
    const d = loadData();
    const groups = { rd: [], or: [], n: [], lg: [], dg: [] };
    for (let n = 2; n <= 9; n++) {
      if (selectedNumbers.size > 0 && !selectedNumbers.has(n)) continue;
      for (let m = 2; m <= 9; m++) {
        const st = getState(d, n, m);
        if (st === "dg" && !filterStates.has("dg")) continue;
        if (filterStates.size > 0 && !filterStates.has(st)) continue;
        if (groups[st]) groups[st].push({ factorA: n, factorB: m, answer: n * m });
      }
    }
    return [
      ...shuffle(groups.rd),
      ...shuffle(groups.or),
      ...shuffle(groups.n),
      ...shuffle(groups.lg),
      ...shuffle(groups.dg),
    ];
  }

  function updatePills() {
    masteredPill.textContent  = `${sessionCorrectKeys.size}`;
    scoreTotalEl.textContent  = `${sessionFacts.length}`;
    attemptsPill.textContent  = `${sessionAttempts} deneme`;
    const pct = sessionFacts.length > 0
      ? Math.round(sessionCorrectKeys.size / sessionFacts.length * 100)
      : 0;
    sessionProgress.style.width = `${pct}%`;
  }

  function startTimer() {
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      if (timeLeft <= 0) endGame(false);
    }, 1000);
  }

  function updateTimerDisplay() {
    timerPill.textContent = `⏱ ${Math.max(0, timeLeft)}s`;
    timerPill.classList.toggle("timer-urgent", timeLeft <= 10);
  }

  function nextQuestion() {
    if (questionQueue.length === 0) { endGame(true); return; }

    locked = false;
    feedback.textContent = "";
    feedback.className = "feedback";

    currentQuestion = questionQueue[0];
    questionText.textContent = `${currentQuestion.factorA} × ${currentQuestion.factorB} = ?`;

    highlightCurrentRow();

    if (inputMode === "mc") {
      numberEntry.classList.add("hidden");
      mcGrid.classList.remove("hidden");
      const choices = generateChoices(currentQuestion.answer);
      mcGrid.innerHTML = "";
      choices.forEach(val => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.textContent = val;
        btn.addEventListener("click", () => handleChoice(btn, val));
        mcGrid.appendChild(btn);
      });
    } else {
      mcGrid.classList.add("hidden");
      numberEntry.classList.remove("hidden");
      answerInput.value = "";
      answerInput.className = "answer-input";
      answerInput.disabled = false;
      submitAnswerBtn.disabled = false;
      answerInput.focus();
    }
  }

  function submitAnswer() {
    const val = parseInt(answerInput.value, 10);
    if (isNaN(val) || answerInput.disabled) return;
    handleChoice(null, val);
  }
  submitAnswerBtn.addEventListener("click", submitAnswer);
  answerInput.addEventListener("keydown", e => { if (e.key === "Enter") submitAnswer(); });

  function handleChoice(btn, value) {
    if (locked || !gameActive) return;
    locked = true;
    sessionAttempts++;

    if (inputMode === "mc") mcGrid.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);
    else { answerInput.disabled = true; submitAnswerBtn.disabled = true; }

    const d     = loadData();
    const n     = currentQuestion.factorA;
    const m     = currentQuestion.factorB;
    const prev  = getState(d, n, m);
    const isCorrect = value === currentQuestion.answer;
    const next  = nextState(prev, isCorrect);

    d[stateKey(n, m)] = next;
    if (m >= 2) d[stateKey(m, n)] = next;
    saveData(d);
    updateTableRow(m);

    if (isCorrect) {
      sessionCorrectKeys.add(stateKey(n, m));
      playFeedback(true);
      if (btn) btn.classList.add("correct");
      else answerInput.classList.add("correct");
      questionQueue.shift();
      if (timerMode && next !== "dg") questionQueue.push(currentQuestion);
      feedback.textContent = "Doğru! 🎉";
      feedback.className = "feedback ok";
    } else {
      playFeedback(false);
      if (btn) {
        btn.classList.add("wrong");
        mcGrid.querySelectorAll(".choice-btn").forEach(b => {
          if (Number(b.textContent) === currentQuestion.answer) b.classList.add("reveal");
        });
      } else {
        answerInput.classList.add("wrong");
        answerInput.value = currentQuestion.answer;
      }
      feedback.textContent = `Yanlış! Doğru cevap: ${currentQuestion.answer}.`;
      feedback.className = "feedback err";
      questionQueue.shift();
      questionQueue.push(currentQuestion);
    }

    updatePills();

    if (isCorrect && questionQueue.length === 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      setTimeout(() => endGame(true), 900);
    } else {
      setTimeout(nextQuestion, 1100);
    }
  }

  function playFeedback(isCorrect) {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    if (isCorrect) {
      [523, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine"; osc.frequency.value = freq;
        osc.connect(gain);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.22);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.22);
      });
    } else {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  }

  function playVictory() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.connect(ctx.destination);
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      osc.connect(gain); gain.connect(master);
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    });
    [523.25, 659.25, 783.99].forEach(freq => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      osc.connect(gain); gain.connect(master);
      const t = ctx.currentTime + 4 * 0.13;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
      osc.start(t); osc.stop(t + 0.9);
    });
  }

  function launchConfetti() {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const c = canvas.getContext("2d");
    const colors = ["#ff7a59","#2eaa82","#ffd700","#ff4081","#7c4dff","#00bcd4","#ff9800"];
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width, y: -10 - Math.random() * 60,
      vx: (Math.random() - 0.5) * 5, vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 10 + 5, h: Math.random() * 5 + 3,
      angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.18,
    }));
    const duration = 3200; let start = null;
    function frame(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      c.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.angle += p.spin;
        c.save(); c.translate(p.x, p.y); c.rotate(p.angle);
        c.globalAlpha = Math.max(0, 1 - elapsed / duration);
        c.fillStyle = p.color;
        c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c.restore();
      });
      if (elapsed < duration) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  function startGame() {
    questionQueue      = buildQueue();
    sessionFacts       = [...questionQueue];
    sessionCorrectKeys = new Set();
    sessionAttempts    = 0;
    locked             = false;
    gameActive         = true;

    setupPanel.classList.add("hidden");
    summaryPanel.classList.add("hidden");
    quizPanel.classList.remove("hidden");
    sessionProgress.style.width = "0%";
    scoreTotalEl.textContent = `${sessionFacts.length}`;

    if (filterStates.size === 0 && selectedNumbers.size === 1) {
      quizTable.classList.remove("hidden");
      renderTable([...selectedNumbers][0]);
    } else {
      quizTable.classList.add("hidden");
    }

    if (timerMode) {
      timeLeft = sessionFacts.length * TIME_PER_Q;
      timerPill.classList.remove("hidden");
      startTimer();
    } else {
      timerPill.classList.add("hidden");
    }

    updatePills();
    nextQuestion();
  }

  function endGame(cleared = false) {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(timerInterval);
    timerInterval = null;
    locked = true;

    quizPanel.classList.add("hidden");
    summaryPanel.classList.remove("hidden");

    const score = sessionCorrectKeys.size;
    const total = sessionFacts.length;

    if (timerMode && !cleared) {
      summaryText.textContent = `Süre doldu! ⭐ ${score} / ${total} doğru yaptın.`;
      summaryDetail.textContent = `${sessionAttempts} denemede çalıştın.`;
    } else {
      const d = loadData();
      const allMastered = filterStates.size > 0
        ? true
        : [...selectedNumbers].every(n =>
            [...Array(8)].every((_, i) => getState(d, n, i + 2) === "dg")
          );
      if (allMastered) {
        const label = filterStates.size > 0
          ? "bu grubu"
          : selectedNumbers.size === 1
            ? `${[...selectedNumbers][0]} tablosunu`
            : "seçili tabloları";
        summaryText.textContent = `Tebrikler! ${label} bitirdin! ⭐ ${score} / ${total}`;
        playVictory();
        launchConfetti();
      } else {
        summaryText.textContent = `Bu turu tamamladın! ⭐ ${score} / ${total}`;
      }
      summaryDetail.textContent = `${sessionAttempts} denemede çalıştın.`;
    }
  }

  exitBtn.addEventListener("click", () => {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(timerInterval);
    timerInterval = null;
    quizPanel.classList.add("hidden");
    summaryPanel.classList.add("hidden");
    setupPanel.classList.remove("hidden");
    selectedNumbers.clear();
    filterStates.clear();
    startBtn.disabled = true;
    buildNumberButtons();
    buildEmojiPresets();
  });

  modeMC    .addEventListener("click", () => { inputMode = "mc";   modeMC.classList.add("active");     modeType.classList.remove("active"); });
  modeType  .addEventListener("click", () => { inputMode = "type"; modeType.classList.add("active");   modeMC.classList.remove("active"); });
  timerOffBtn.addEventListener("click", () => { timerMode = false; timerOffBtn.classList.add("active"); timerOnBtn.classList.remove("active"); });
  timerOnBtn .addEventListener("click", () => { timerMode = true;  timerOnBtn.classList.add("active");  timerOffBtn.classList.remove("active"); });

  startBtn.addEventListener("click", startGame);

  playAgainBtn.addEventListener("click", () => {
    summaryPanel.classList.add("hidden");
    setupPanel.classList.remove("hidden");
    selectedNumbers.clear();
    filterStates.clear();
    startBtn.disabled = true;
    buildNumberButtons();
    buildEmojiPresets();
  });

  buildNumberButtons();
  buildEmojiPresets();