// =========================================
// LITURGIA DIÁRIA - VERSÃO REFATORADA
// =========================================

let liturgiaData = null;
let shareModal;
let abaAtiva = 'primeira';
let leituras = {};

// =========================================
// Nomes das abas
// =========================================
const nomeAba = {
  primeira: '1ª Leitura',
  salmo: 'Salmo',
  segunda: '2ª Leitura',
  evangelho: 'Evangelho'
};

// =========================================
// Formatação de versículos (CORRIGIDO)
// =========================================
function formatarTextoComVersiculos(texto) {
  if (!texto) return '';

  return texto
    .replace(/\n/g, '<br>')
    .replace(/(\d+)(?=[A-ZÁÉÍÓÚÂÊÔÃÕ“])/g, 
      '<span class="versiculo-num">$1</span>');
}

// =========================================
// Buscar liturgia (SIMPLIFICADO)
// =========================================
async function buscarLiturgia() {
  try {
    const response = await fetch('https://liturgia.up.railway.app/v2/');
    const raw = await response.json();

    const leiturasAPI = raw.leituras || {};

    const p = leiturasAPI.primeiraLeitura?.[0] || null;
    const s = leiturasAPI.segundaLeitura?.[0] || null;
    const salmo = leiturasAPI.salmo?.[0] || null;
    const ev = leiturasAPI.evangelho?.[0] || null;

    leituras = {
      primeira: p,
      salmo: salmo,
      segunda: s,
      evangelho: ev
    };

    return {
      titulo: raw.liturgia || "Liturgia Diária",
      data: raw.data || "",
      cor: raw.cor || "",
      santo: raw.santo || null
    };

  } catch (error) {
    console.error("Erro ao buscar:", error);
    return { erro: true };
  }
}

// =========================================
// Gerar abas automaticamente
// =========================================
function gerarAbas() {
  const abas = [];

  if (leituras.primeira) abas.push('primeira');
  if (leituras.salmo) abas.push('salmo');
  if (leituras.segunda) abas.push('segunda');
  if (leituras.evangelho) abas.push('evangelho');

  return abas;
}

// =========================================
// Renderizar tabs
// =========================================
function renderizarTabs(abas) {
  const container = document.getElementById('tabs-container');
  container.innerHTML = '';

  // 🔥 cria o wrapper de novo
  const tabsDiv = document.createElement('div');
  tabsDiv.className = 'tabs-wrapper';

  abas.forEach(aba => {
    const btn = document.createElement('button');
    btn.className = `tab ${aba === abaAtiva ? 'tab-ativa' : ''}`;
    btn.textContent = nomeAba[aba];

    btn.onclick = () => {
      abaAtiva = aba;
      renderizarTabs(abas);
      renderizarConteudo();
    };

    tabsDiv.appendChild(btn);
  });

  // 🔥 adiciona o wrapper no container
  container.appendChild(tabsDiv);
}
// =========================================
// Renderizar conteúdo
// =========================================
function renderizarConteudo() {
  const leitura = leituras[abaAtiva];
  const contentSection = document.getElementById('content-section');

  if (!leitura) {
    contentSection.style.display = 'none';
    return;
  }

  document.getElementById('leitura-titulo').textContent =
    leitura.titulo || nomeAba[abaAtiva];

  document.getElementById('leitura-referencia').textContent =
    leitura.referencia || '';

  document.getElementById('leitura-texto').innerHTML =
    formatarTextoComVersiculos(leitura.texto);

  // Salmo (refrão)
  const refraoContainer = document.getElementById('refrao-container');
  if (abaAtiva === 'salmo' && leitura.refrao) {
    document.getElementById('refrao-texto').textContent = `R. ${leitura.refrao}`;
    refraoContainer.style.display = 'block';
  } else {
    refraoContainer.style.display = 'none';
  }

  contentSection.style.display = 'block';
}

// =========================================
// Renderizar tudo
// =========================================
function renderizarLiturgia(data) {
  document.getElementById('liturgia-titulo').textContent = data.titulo;
  document.getElementById('liturgia-data').textContent = data.data;
  document.getElementById('liturgia-cor').textContent = `Cor Litúrgica: ${data.cor}`;

  const abas = gerarAbas();

  abaAtiva = abas[0];
  renderizarTabs(abas);
  renderizarConteudo();

  document.getElementById('loading').style.display = 'none';
  document.getElementById('liturgia-content').style.display = 'block';
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
  const data = await buscarLiturgia();

  if (data.erro) {
    document.getElementById('loading').innerHTML =
      'Erro ao carregar liturgia.';
    return;
  }

  liturgiaData = data;
  renderizarLiturgia(data);
});