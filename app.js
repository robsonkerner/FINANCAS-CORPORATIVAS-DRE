const STORAGE_KEY = "dre_tentativas";

const state = {
  aluno: "",
  dadosBase: null,
  exercicioAtual: null,
  selecoes: {},
  tentativas: []
};

const loginCard = document.getElementById("login-card");
const exerciseCard = document.getElementById("exercise-card");
const attemptsCard = document.getElementById("attempts-card");
const loginError = document.getElementById("login-error");
const studentNameInput = document.getElementById("student-name");
const studentLabel = document.getElementById("student-label");
const recordsList = document.getElementById("records-list");
const summaryEl = document.getElementById("summary");
const resultMessage = document.getElementById("result-message");
const attemptsOutput = document.getElementById("attempts-output");
const importFileInput = document.getElementById("import-file");

document.getElementById("enter-btn").addEventListener("click", onEnter);
document.getElementById("submit-btn").addEventListener("click", onSubmit);
document.getElementById("new-exercise-btn").addEventListener("click", buildExercise);
document.getElementById("show-attempts-btn").addEventListener("click", toggleAttempts);
document.getElementById("export-btn").addEventListener("click", exportAttempts);
importFileInput.addEventListener("change", importAttempts);

init();

async function init() {
  state.tentativas = loadAttempts();
  renderAttempts();

  try {
    const response = await fetch("./dados/registros-base.json");
    state.dadosBase = await response.json();
  } catch (error) {
    resultMessage.textContent = "Erro ao carregar arquivo de dados base.";
    resultMessage.className = "result-message result-error";
  }
}

function onEnter() {
  const nome = studentNameInput.value.trim();
  if (!nome) {
    loginError.classList.remove("hidden");
    return;
  }

  loginError.classList.add("hidden");
  state.aluno = nome;
  studentLabel.textContent = `Aluno: ${nome}`;
  loginCard.classList.add("hidden");
  exerciseCard.classList.remove("hidden");
  buildExercise();
}

function buildExercise() {
  if (!state.dadosBase || !state.dadosBase.exercicios?.length) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * state.dadosBase.exercicios.length);
  state.exercicioAtual = structuredClone(state.dadosBase.exercicios[randomIndex]);
  state.selecoes = {};
  resultMessage.textContent = "";
  resultMessage.className = "result-message";

  const shuffledRecords = shuffleArray(state.exercicioAtual.registros);
  recordsList.innerHTML = "";

  shuffledRecords.forEach((registro) => {
    const card = document.createElement("article");
    card.className = "record-item";

    const header = document.createElement("div");
    header.className = "record-header";
    header.innerHTML = `<span>${registro.conta}</span><span>${formatBRL(registro.valor)}</span>`;

    const select = document.createElement("select");
    select.dataset.id = registro.id;
    select.innerHTML = `
      <option value="">Selecione a categoria na DRE</option>
      ${state.dadosBase.categoriasDre.map((categoria) => `<option value="${categoria}">${categoria}</option>`).join("")}
    `;
    select.addEventListener("change", (event) => {
      state.selecoes[registro.id] = event.target.value;
      renderSummary();
    });

    card.append(header, select);
    recordsList.appendChild(card);
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
    ? "Resposta correta! Classificacao e resultado da DRE estao corretos."
    : "Erro na DRE. Revise a classificacao e tente novamente.";
  resultMessage.className = `result-message ${ok ? "result-correct" : "result-error"}`;

  registerAttempt(ok, expected, selected);
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
  const attempt = {
    dataHora: new Date().toISOString(),
    aluno: state.aluno,
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
