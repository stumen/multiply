  const STORAGE_KEY = "multiply_learn_states";
  const STATE_EMOJI = { n: "❔", lg: "🙂", dg: "⭐", or: "😕", rd: "😰" };
  const STATE_BG    = { n: "#f0f0f0", lg: "#d4f5e5", dg: "#86efac", or: "#fed7aa", rd: "#fca5a5" };
  const STATE_LABEL = { n: "Denenmedi", lg: "1 kez doğru", dg: "Ustalaştın!", or: "Zorlandın", rd: "Tekrar lazım" };

  const progressFraction = document.getElementById("progress-fraction");
  const progressPct      = document.getElementById("progress-pct");
  const progressFill     = document.getElementById("progress-fill");
  const factGrid         = document.getElementById("fact-grid");
  const legendEl         = document.getElementById("legend");
  const resetBtn         = document.getElementById("reset-btn");

  function loadData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  function buildGrid() {
    factGrid.innerHTML = "";

    const corner = document.createElement("div");
    corner.className = "grid-corner";
    corner.textContent = "×";
    factGrid.appendChild(corner);

    for (let m = 2; m <= 9; m++) {
      const h = document.createElement("div");
      h.className = "grid-header";
      h.textContent = m;
      factGrid.appendChild(h);
    }

    for (let n = 2; n <= 9; n++) {
      const label = document.createElement("div");
      label.className = "grid-row-label";
      label.textContent = n;
      factGrid.appendChild(label);

      for (let m = 2; m <= 9; m++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        cell.dataset.n = n;
        cell.dataset.m = m;
        cell.title = `${n} × ${m} = ${n * m}`;
        factGrid.appendChild(cell);
      }
    }
  }

  function buildLegend() {
    legendEl.innerHTML = "";
    Object.entries(STATE_LABEL).forEach(([st, label]) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      const dot = document.createElement("div");
      dot.className = "legend-dot";
      dot.style.background = STATE_BG[st];
      dot.textContent = STATE_EMOJI[st];
      item.appendChild(dot);
      item.appendChild(document.createTextNode(label));
      legendEl.appendChild(item);
    });
  }

  function renderDashboard() {
    const d = loadData();
    let mastered = 0;

    for (let n = 2; n <= 9; n++) {
      for (let m = 2; m <= 9; m++) {
        const st = d[`${n}_${m}`] || "n";
        const cell = factGrid.querySelector(`[data-n="${n}"][data-m="${m}"]`);
        cell.textContent      = STATE_EMOJI[st];
        cell.style.background = STATE_BG[st];
        if (st === "dg") mastered++;
      }
    }

    const pct = Math.round(mastered / 64 * 100);
    progressFill.style.width      = `${pct}%`;
    progressFraction.textContent  = `${mastered} / 64`;
    progressPct.textContent       = `%${pct}`;
  }

  resetBtn.addEventListener("click", () => {
    if (!confirm("Tüm ilerleme silinecek. Emin misin?")) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("multiply_exam_states");
    localStorage.removeItem("multiply_flashcard_states");
    renderDashboard();
  });

  buildGrid();
  buildLegend();
  renderDashboard();