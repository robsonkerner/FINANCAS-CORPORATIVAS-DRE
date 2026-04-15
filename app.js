const STORAGE_KEY = "dre_tentativas";
const FALLBACK_BASE_DATA = {
  categoriasDre: [
    "Receita Bruta",
    "Deducoes",
    "CMV",
    "Despesas Operacionais",
    "Resultado Financeiro",
    "Impostos sobre Lucro"
  ],
  exercicios: [
    {
      id: "easy-001",
      dificuldade: "easy",
      titulo: "Loja Basica",
      registros: [
        { id: "e1", conta: "Venda de Mercadorias", valor: 50000, categoriaCorreta: "Receita Bruta" },
        { id: "e2", conta: "Impostos sobre Vendas", valor: 5000, categoriaCorreta: "Deducoes" },
        { id: "e3", conta: "Custo das Mercadorias Vendidas", valor: 20000, categoriaCorreta: "CMV" },
        { id: "e4", conta: "Despesa com Salarios", valor: 7000, categoriaCorreta: "Despesas Operacionais" },
        { id: "e5", conta: "Despesa Financeira", valor: 1000, categoriaCorreta: "Resultado Financeiro" },
        { id: "e6", conta: "IRPJ e CSLL", valor: 3000, categoriaCorreta: "Impostos sobre Lucro" }
      ]
    },
    {
      id: "normal-001",
      dificuldade: "normal",
      titulo: "Comercio Varejista",
      registros: [
        { id: "n1", conta: "Venda de Mercadorias", valor: 120000, categoriaCorreta: "Receita Bruta" },
        { id: "n2", conta: "Devolucoes de Vendas", valor: 5000, categoriaCorreta: "Deducoes" },
        { id: "n3", conta: "Impostos sobre Vendas", valor: 9000, categoriaCorreta: "Deducoes" },
        { id: "n4", conta: "Custo das Mercadorias Vendidas", valor: 45000, categoriaCorreta: "CMV" },
        { id: "n5", conta: "Despesas com Salarios Administrativos", valor: 14000, categoriaCorreta: "Despesas Operacionais" },
        { id: "n6", conta: "Despesas com Aluguel", valor: 6000, categoriaCorreta: "Despesas Operacionais" },
        { id: "n7", conta: "Receita Financeira", valor: 2000, categoriaCorreta: "Resultado Financeiro" },
        { id: "n8", conta: "Despesa Financeira", valor: 3000, categoriaCorreta: "Resultado Financeiro" },
        { id: "n9", conta: "IRPJ e CSLL", valor: 9500, categoriaCorreta: "Impostos sobre Lucro" }
      ]
    },
    {
      id: "hard-001",
      dificuldade: "hard",
      titulo: "Industria Multiplas Linhas",
      registros: [
        { id: "h1", conta: "Receita de Vendas Mercado Interno", valor: 210000, categoriaCorreta: "Receita Bruta" },
        { id: "h2", conta: "Receita de Exportacao", valor: 90000, categoriaCorreta: "Receita Bruta" },
        { id: "h3", conta: "Devolucoes e Abatimentos", valor: 12000, categoriaCorreta: "Deducoes" },
        { id: "h4", conta: "Tributos sobre Vendas", valor: 26000, categoriaCorreta: "Deducoes" },
        { id: "h5", conta: "Custo de Materia Prima Consumida", valor: 70000, categoriaCorreta: "CMV" },
        { id: "h6", conta: "Custo de Mao de Obra Direta", valor: 38000, categoriaCorreta: "CMV" },
        { id: "h7", conta: "Custos Indiretos de Fabricacao", valor: 24000, categoriaCorreta: "CMV" },
        { id: "h8", conta: "Despesas Comerciais", valor: 19000, categoriaCorreta: "Despesas Operacionais" },
        { id: "h9", conta: "Despesas Administrativas", valor: 22000, categoriaCorreta: "Despesas Operacionais" },
        { id: "h10", conta: "Outras Despesas Operacionais", valor: 7000, categoriaCorreta: "Despesas Operacionais" },
        { id: "h11", conta: "Receita Financeira", valor: 6500, categoriaCorreta: "Resultado Financeiro" },
        { id: "h12", conta: "Juros sobre Emprestimos", valor: 10000, categoriaCorreta: "Resultado Financeiro" },
        { id: "h13", conta: "Despesa Financeira", valor: 2500, categoriaCorreta: "Resultado Financeiro" },
        { id: "h14", conta: "Imposto de Renda e Contribuicao Social", valor: 28000, categoriaCorreta: "Impostos sobre Lucro" }
      ]
    }
  ]
};

const state = {
  aluno: "",
  dificuldade: "normal",
  dadosBase: null,
  exercicioAtual: null,
  selecoes: {},
  tentativas: [],
  rodadaSubmetida: false,
  inicioJogoRodada: null
};

const loginCard = document.getElementById("login-card");
const exerciseCard = document.getElementById("exercise-card");
const attemptsCard = document.getElementById("attempts-card");
const loginError = document.getElementById("login-error");
const studentNameInput = document.getElementById("student-name");
const difficultySelect = document.getElementById("difficulty-level");
const studentLabel = document.getElementById("student-label");
const recordsBank = document.getElementById("records-bank");
const dreBoard = document.getElementById("dre-board");
const summaryEl = document.getElementById("summary");
const resultMessage = document.getElementById("result-message");
const attemptsOutput = document.getElementById("attempts-output");
const importFileInput = document.getElementById("import-file");
const submitBtn = document.getElementById("submit-btn");
const activityLogEl = document.getElementById("activity-log");
const attemptReviewEl = document.getElementById("attempt-review");
const reviewMetaEl = document.getElementById("review-meta");
const reviewColumnsEl = document.getElementById("review-columns");

document.getElementById("enter-btn").addEventListener("click", onEnter);
document.getElementById("back-home-btn").addEventListener("click", backToHome);
document.getElementById("submit-btn").addEventListener("click", onSubmit);
document.getElementById("new-exercise-btn").addEventListener("click", buildExercise);
document.getElementById("show-attempts-btn").addEventListener("click", toggleAttempts);
document.getElementById("export-btn").addEventListener("click", exportAttempts);
document.getElementById("close-review-btn").addEventListener("click", closeAttemptReview);
importFileInput.addEventListener("change", importAttempts);
recordsBank.addEventListener("dragover", onDragOverZone);
recordsBank.addEventListener("dragleave", onDragLeaveZone);
recordsBank.addEventListener("drop", onDropRecord);
activityLogEl.addEventListener("click", onActivityLogClick);

init();

async function init() {
  state.tentativas = loadAttempts();
  renderAttempts();
  renderActivityLog();
  state.dadosBase = await loadBaseData();
}

function onEnter() {
  const nome = studentNameInput.value.trim();
  if (!nome) {
    loginError.classList.remove("hidden");
    return;
  }

  loginError.classList.add("hidden");
  state.aluno = nome;
  state.dificuldade = difficultySelect.value || "normal";
  studentLabel.textContent = `Aluno: ${nome} | Nivel: ${formatDifficultyLabel(state.dificuldade)}`;
  loginCard.classList.add("hidden");
  exerciseCard.classList.remove("hidden");
  buildExercise();
}

function backToHome() {
  exerciseCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
  studentNameInput.value = state.aluno;
  difficultySelect.value = state.dificuldade;
  renderActivityLog();
}

function buildExercise() {
  if (!state.dadosBase || !state.dadosBase.exercicios?.length) {
    return;
  }

  const exerciciosDoNivel = state.dadosBase.exercicios.filter(
    (exercicio) => (exercicio.dificuldade || "normal") === state.dificuldade
  );

  if (!exerciciosDoNivel.length) {
    resultMessage.textContent = `Nao existem exercicios no nivel ${formatDifficultyLabel(state.dificuldade)}.`;
    resultMessage.className = "result-message result-error";
    return;
  }

  const randomIndex = Math.floor(Math.random() * exerciciosDoNivel.length);
  state.exercicioAtual = structuredClone(exerciciosDoNivel[randomIndex]);
  state.selecoes = {};
  state.rodadaSubmetida = false;
  state.inicioJogoRodada = new Date().toISOString();
  resultMessage.textContent = "";
  resultMessage.className = "result-message";

  submitBtn.disabled = false;
  submitBtn.removeAttribute("title");

  const shuffledRecords = shuffleArray(state.exercicioAtual.registros);
  recordsBank.innerHTML = "";
  recordsBank.insertAdjacentHTML("beforeend", `<p class="drop-hint">Solte aqui para remover da DRE.</p>`);
  renderDreTemplate();

  shuffledRecords.forEach((registro) => {
    const card = createRecordCard(registro);
    recordsBank.appendChild(card);
  });

  renderSummary();
}

function renderSummary() {
  const totals = calculateBySelection();
  const receitaLiquida = totals["Receita Bruta"] - totals.Deducoes;
  const lucroBruto = receitaLiquida - totals.CMV;
  const lucroOperacional = lucroBruto - totals["Despesas Operacionais"];
  const resultadoAntesImpostos = lucroOperacional + totals["Resultado Financeiro"];
  const lucroLiquido = resultadoAntesImpostos - totals["Impostos sobre Lucro"];

  const summaryRows = [
    ["Receita Bruta", totals["Receita Bruta"]],
    ["(-) Deducoes", totals.Deducoes],
    ["= Receita Liquida", receitaLiquida],
    ["(-) CMV", totals.CMV],
    ["= Lucro Bruto", lucroBruto],
    ["(-) Despesas Operacionais", totals["Despesas Operacionais"]],
    ["(+/-) Resultado Financeiro", totals["Resultado Financeiro"]],
    ["= Resultado Antes dos Impostos", resultadoAntesImpostos],
    ["(-) Impostos sobre Lucro", totals["Impostos sobre Lucro"]],
    ["= Lucro Liquido", lucroLiquido]
  ];

  summaryEl.innerHTML = summaryRows
    .map(([label, value]) => `<div class="summary-item"><strong>${label}</strong><br>${formatBRL(value)}</div>`)
    .join("");
}

function onSubmit() {
  if (!state.exercicioAtual) {
    return;
  }

  if (state.rodadaSubmetida) {
    resultMessage.textContent = "Voce ja submeteu nesta rodada. Clique em Gerar nova lista para jogar de novo.";
    resultMessage.className = "result-message result-error";
    return;
  }

  const missing = state.exercicioAtual.registros.filter((registro) => !state.selecoes[registro.id]);
  if (missing.length > 0) {
    resultMessage.textContent = "Preencha a classificacao de todos os registros antes de submeter.";
    resultMessage.className = "result-message result-error";
    return;
  }

  const classificacaoCorreta = state.exercicioAtual.registros.every(
    (registro) => state.selecoes[registro.id] === registro.categoriaCorreta
  );

  const expected = calculateExpectedTotals(state.exercicioAtual.registros);
  const selected = calculateBySelection();
  const resultadoCorreto = JSON.stringify(expected) === JSON.stringify(selected);

  const ok = classificacaoCorreta && resultadoCorreto;

  resultMessage.textContent = ok
    ? "Resposta correta! Classificacao e resultado da DRE estao corretos. Clique em Gerar nova lista para jogar de novo."
    : "Erro na DRE. Nesta rodada nao e possivel submeter de novo. Clique em Gerar nova lista para uma nova tentativa.";
  resultMessage.className = `result-message ${ok ? "result-correct" : "result-error"}`;

  registerAttempt(ok, expected, selected);
  lockRoundAfterSubmit();
}

function calculateBySelection() {
  const totals = emptyTotals();
  if (!state.exercicioAtual) {
    return totals;
  }

  for (const registro of state.exercicioAtual.registros) {
    const categoria = state.selecoes[registro.id];
    if (categoria && totals[categoria] !== undefined) {
      if (categoria === "Resultado Financeiro") {
        const signal = /despesa|juros/i.test(registro.conta) ? -1 : 1;
        totals[categoria] += registro.valor * signal;
      } else {
        totals[categoria] += registro.valor;
      }
    }
  }

  return totals;
}

function calculateExpectedTotals(registros) {
  const totals = emptyTotals();

  for (const registro of registros) {
    const categoria = registro.categoriaCorreta;
    if (categoria === "Resultado Financeiro") {
      const signal = /despesa|juros/i.test(registro.conta) ? -1 : 1;
      totals[categoria] += registro.valor * signal;
    } else {
      totals[categoria] += registro.valor;
    }
  }

  return totals;
}

function emptyTotals() {
  return {
    "Receita Bruta": 0,
    Deducoes: 0,
    CMV: 0,
    "Despesas Operacionais": 0,
    "Resultado Financeiro": 0,
    "Impostos sobre Lucro": 0
  };
}

function registerAttempt(ok, esperado, informado) {
  const dataResposta = new Date().toISOString();
  const attempt = {
    idTentativa: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    dataHora: dataResposta,
    dataResposta,
    inicioJogo: state.inicioJogoRodada,
    aluno: state.aluno,
    dificuldade: state.dificuldade,
    exercicioId: state.exercicioAtual.id,
    exercicioTitulo: state.exercicioAtual.titulo,
    classificacoes: state.selecoes,
    totaisEsperados: esperado,
    totaisInformados: informado,
    correto: ok
  };

  state.tentativas.push(attempt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tentativas, null, 2));
  renderAttempts();
  renderActivityLog();
}

function loadAttempts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function toggleAttempts() {
  attemptsCard.classList.toggle("hidden");
}

function renderAttempts() {
  attemptsOutput.textContent = JSON.stringify(state.tentativas, null, 2);
}

function renderActivityLog() {
  if (!activityLogEl) {
    return;
  }

  if (!state.tentativas.length) {
    activityLogEl.innerHTML = '<p class="log-empty">Nenhum registro ainda.</p>';
    return;
  }

  const recent = [...state.tentativas].reverse().slice(0, 50);
  const fmt = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
    } catch (e) {
      return iso;
    }
  };

  const rows = recent
    .map(
      (t) => `
    <tr>
      <td>${escapeHtml(t.aluno || "-")}</td>
      <td>${t.inicioJogo ? fmt(t.inicioJogo) : "-"}</td>
      <td>${fmt(t.dataResposta || t.dataHora)}</td>
      <td class="${t.correto ? "ok" : "fail"}">${t.correto ? "Acertou" : "Errou"}</td>
      <td class="view-col"><button class="secondary view-attempt-btn" data-attempt-id="${escapeHtml(t.idTentativa || "")}" data-attempt-time="${escapeHtml(t.dataResposta || t.dataHora || "")}">Ver</button></td>
    </tr>`
    )
    .join("");

  activityLogEl.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Aluno</th>
          <th>Inicio do jogo</th>
          <th>Resposta enviada</th>
          <th>Resultado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function lockRoundAfterSubmit() {
  state.rodadaSubmetida = true;
  submitBtn.disabled = true;
  submitBtn.title = "Uma submissao por rodada. Use Gerar nova lista para uma nova tentativa.";

  document.querySelectorAll(".record-item").forEach((el) => {
    el.draggable = false;
    el.classList.add("record-locked");
  });
}

function exportAttempts() {
  const blob = new Blob([JSON.stringify(state.tentativas, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "registros-tentativas.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importAttempts(event) {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) {
        throw new Error("Formato invalido");
      }
      state.tentativas = imported;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tentativas, null, 2));
      renderAttempts();
      renderActivityLog();
      alert("Arquivo importado com sucesso.");
    } catch (error) {
      alert("Arquivo JSON invalido.");
    } finally {
      importFileInput.value = "";
    }
  };
  reader.readAsText(file);
}

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shuffleArray(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderDreTemplate() {
  dreBoard.innerHTML = "";
  state.dadosBase.categoriasDre.forEach((categoria) => {
    const section = document.createElement("section");
    section.className = "dre-section";
    section.innerHTML = `<h5>${categoria}</h5>`;

    const dropZone = document.createElement("div");
    dropZone.className = "drop-zone";
    dropZone.dataset.category = categoria;
    dropZone.addEventListener("dragover", onDragOverZone);
    dropZone.addEventListener("dragleave", onDragLeaveZone);
    dropZone.addEventListener("drop", onDropRecord);

    section.appendChild(dropZone);
    dreBoard.appendChild(section);
  });
}

function createRecordCard(registro) {
  const card = document.createElement("article");
  card.className = "record-item";
  card.draggable = true;
  card.dataset.id = registro.id;
  card.innerHTML = `
    <div class="record-header">
      <span>${registro.conta}</span>
      <span>${formatBRL(registro.valor)}</span>
    </div>
  `;
  card.addEventListener("dragstart", onDragStartRecord);
  return card;
}

function onDragStartRecord(event) {
  const id = event.currentTarget.dataset.id;
  event.dataTransfer.setData("text/plain", id);
}

function onDragOverZone(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function onDragLeaveZone(event) {
  event.currentTarget.classList.remove("drag-over");
}

function onDropRecord(event) {
  event.preventDefault();
  const zone = event.currentTarget;
  zone.classList.remove("drag-over");

  if (state.rodadaSubmetida) {
    return;
  }

  const recordId = event.dataTransfer.getData("text/plain");
  if (!recordId) {
    return;
  }

  const card = document.querySelector(`.record-item[data-id="${recordId}"]`);
  if (!card) {
    return;
  }

  zone.appendChild(card);

  const categoria = zone.dataset.category || "";
  if (categoria) {
    state.selecoes[recordId] = categoria;
  } else {
    delete state.selecoes[recordId];
  }

  renderSummary();
}

async function loadBaseData() {
  try {
    const response = await fetch("./dados/registros-base.json");
    if (!response.ok) {
      throw new Error("Resposta invalida no carregamento");
    }
    const data = await response.json();
    if (!Array.isArray(data?.exercicios) || !Array.isArray(data?.categoriasDre)) {
      throw new Error("Formato de dados invalido");
    }
    return data;
  } catch (error) {
    resultMessage.textContent = "JSON externo bloqueado no navegador. Usando base interna do app.";
    resultMessage.className = "result-message result-error";
    return structuredClone(FALLBACK_BASE_DATA);
  }
}

function formatDifficultyLabel(level) {
  if (level === "easy") return "Easy";
  if (level === "hard") return "Hard";
  return "Normal";
}

function onActivityLogClick(event) {
  const button = event.target.closest(".view-attempt-btn");
  if (!button) {
    return;
  }

  const attemptId = button.dataset.attemptId;
  const attemptTime = button.dataset.attemptTime;
  const attempt = state.tentativas.find((item) => {
    if (attemptId) {
      return item.idTentativa === attemptId;
    }
    return (item.dataResposta || item.dataHora || "") === attemptTime;
  });

  if (!attempt) {
    alert("Tentativa nao encontrada.");
    return;
  }

  openAttemptReview(attempt);
}

function openAttemptReview(attempt) {
  const exercicio = findExerciseById(attempt.exercicioId);
  if (!exercicio) {
    reviewMetaEl.textContent = "Nao foi possivel localizar o exercicio original para comparar.";
    reviewColumnsEl.innerHTML = "";
    attemptReviewEl.classList.remove("hidden");
    return;
  }

  const registros = exercicio.registros || [];
  const alunoItens = [];
  const corretoItens = [];

  registros.forEach((registro) => {
    const alunoCategoria = attempt.classificacoes?.[registro.id] || "(nao classificado)";
    const corretaCategoria = registro.categoriaCorreta;
    const ok = alunoCategoria === corretaCategoria;

    alunoItens.push(`
      <div class="review-item ${ok ? "ok" : "fail"}">
        <div class="account">${escapeHtml(registro.conta)}</div>
        <div class="category">Aluno: ${escapeHtml(alunoCategoria)}</div>
      </div>
    `);

    corretoItens.push(`
      <div class="review-item ${ok ? "ok" : "fail"}">
        <div class="account">${escapeHtml(registro.conta)}</div>
        <div class="category">Correto: ${escapeHtml(corretaCategoria)}</div>
      </div>
    `);
  });

  reviewMetaEl.textContent = `${attempt.aluno || "-"} | ${formatDifficultyLabel(attempt.dificuldade || "normal")} | ${attempt.correto ? "Acertou" : "Errou"} | Respondido em ${formatDateTime(attempt.dataResposta || attempt.dataHora)}`;
  reviewColumnsEl.innerHTML = `
    <div class="review-column">
      <h4>Resposta do aluno</h4>
      ${alunoItens.join("")}
    </div>
    <div class="review-column">
      <h4>Gabarito correto</h4>
      ${corretoItens.join("")}
    </div>
  `;

  attemptReviewEl.classList.remove("hidden");
}

function closeAttemptReview() {
  attemptReviewEl.classList.add("hidden");
}

function findExerciseById(exercicioId) {
  if (!state.dadosBase?.exercicios) {
    return null;
  }
  return state.dadosBase.exercicios.find((item) => item.id === exercicioId) || null;
}

function formatDateTime(iso) {
  if (!iso) {
    return "-";
  }
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
  } catch (error) {
    return iso;
  }
}
