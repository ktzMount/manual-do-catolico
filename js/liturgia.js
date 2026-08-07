// =========================================
// LITURGIA DIÁRIA - VERSÃO REFATORADA
// =========================================

let liturgiaData = null;
let shareModal;
let abaAtiva = 'primeira';
let leituras = {};

let dataAtual = new Date();
let dataHoje = new Date();
let modoDomingo = ehDomingo(dataAtual);
let showCalendarModal = null;

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
// Helpers de data
// =========================================
function formatarData(d) {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarDataAPI(d) {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}-${mes}-${ano}`;
}

function formatarDataCalendario(d) {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function ehSabado(d) {
  return d.getDay() === 6;
}

function ehDomingo(d) {
  return d.getDay() === 0;
}

// =========================================
// Formatação de versículos
// =========================================
function formatarTextoComVersiculos(texto) {
  if (!texto) return '';

  return texto
    .replace(/\n/g, '<br>')
    .replace(/(\d+)(?=[A-ZÁÉÍÓÚÂÊÔÃÕ“])/g,
      '<span class="versiculo-num">$1</span>');
}

// =========================================
// Buscar liturgia (data opcional)
// =========================================
async function buscarLiturgia(dataStr) {
  try {
    const url = dataStr
      ? `https://liturgia.up.railway.app/v2/${dataStr}`
      : 'https://liturgia.up.railway.app/v2/';
    const response = await fetch(url);
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
      santo: (typeof raw.santo === 'string' ? raw.santo : raw.santo?.texto) || null
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

  // cria o wrapper de novo
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

  // adiciona o wrapper no container
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

  // Santo do Dia
  const santoSection = document.getElementById('santo-section');
  if (data.santo) {
    document.getElementById('santo-texto').innerHTML =
      formatarTextoComVersiculos(data.santo);
    santoSection.style.display = 'block';
  } else {
    santoSection.style.display = 'none';
  }

  const abas = gerarAbas();

  abaAtiva = abas[0];
  renderizarTabs(abas);
  renderizarConteudo();

  // Data exibida no centro da navegação
  const dataExibidaEl = document.getElementById('liturgia-data-exibida');
  if (dataExibidaEl) dataExibidaEl.textContent = formatarData(dataAtual);

  // Toggle sábado → domingo
  atualizarToggleDomingo();

  document.getElementById('loading').style.display = 'none';
  document.getElementById('liturgia-content').style.display = 'block';
}

// =========================================
// Toggle sábado → domingo (igual ao app)
// =========================================
function atualizarToggleDomingo() {
  const wrapper = document.getElementById('domingo-toggle');
  if (!wrapper) return;
  const podeModoDomingo = ehSabado(dataAtual);

  if (!podeModoDomingo) {
    wrapper.style.display = 'none';
    return;
  }
  wrapper.style.display = 'flex';

  const btnSabado = document.getElementById('btn-domingo-sabado');
  const btnDomingo = document.getElementById('btn-domingo-domingo');

  btnSabado.textContent = 'Liturgia de Sábado';
  btnSabado.classList.toggle('domingo-btn-ativo', !modoDomingo);
  btnDomingo.classList.toggle('domingo-btn-ativo', modoDomingo);
}

// =========================================
// Carregar liturgia com data
// =========================================
async function carregarLiturgia(data, forcarDomingo) {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('liturgia-content').style.display = 'none';

  const usarDomingo = forcarDomingo !== undefined ? forcarDomingo : modoDomingo;
  let dataBusca = data;

  if (usarDomingo && !ehDomingo(data) && ehSabado(data)) {
    const domingo = new Date(data);
    domingo.setDate(domingo.getDate() + 1);
    dataBusca = domingo;
  }

  const result = await buscarLiturgia(formatarDataAPI(dataBusca));
  if (result.erro) {
    document.getElementById('loading').innerHTML =
      '<div class="alert alert-danger text-center">Erro ao carregar liturgia. <button class="btn btn-brown btn-sm mt-2" onclick="location.reload()">Recarregar</button></div>';
    return;
  }

  liturgiaData = result;
  renderizarLiturgia(result);
}

// =========================================
// Navegação de data
// =========================================
function navegar(direcao) {
  const nova = new Date(dataAtual);
  nova.setDate(nova.getDate() + direcao);
  dataAtual = nova;
  modoDomingo = ehDomingo(nova);
  carregarLiturgia(nova);
}

function selecionarData(dataSelecionada) {
  dataAtual = dataSelecionada;
  modoDomingo = ehDomingo(dataSelecionada);
  if (showCalendarModal) showCalendarModal.hide();
  carregarLiturgia(dataSelecionada);
}

function voltarParaHoje() {
  dataAtual = new Date();
  modoDomingo = ehDomingo(dataAtual);
  if (showCalendarModal) showCalendarModal.hide();
  carregarLiturgia(dataAtual);
}

// =========================================
// Calendário customizado (igual ao Santo do Dia)
// =========================================
function gerarCalendario() {
  const container = document.getElementById('liturgia-calendario-container');
  if (!container) return;

  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  let html = `
    <div class="calendar-header d-flex justify-content-between align-items-center mb-4">
      <button class="btn-calendario-nav" id="lit-cal-mes-anterior">
        <ion-icon name="chevron-back"></ion-icon>
      </button>
      <div class="calendar-month-year text-center">
        <div class="calendar-month">${nomesMeses[mes]}</div>
        <div class="calendar-year">${ano}</div>
      </div>
      <button class="btn-calendario-nav" id="lit-cal-mes-proximo">
        <ion-icon name="chevron-forward"></ion-icon>
      </button>
    </div>

    <div class="calendar-weekdays">
      <div class="calendar-weekday">Dom</div>
      <div class="calendar-weekday">Seg</div>
      <div class="calendar-weekday">Ter</div>
      <div class="calendar-weekday">Qua</div>
      <div class="calendar-weekday">Qui</div>
      <div class="calendar-weekday">Sex</div>
      <div class="calendar-weekday">Sáb</div>
    </div>

    <div class="calendar-days">
  `;

  for (let i = 0; i < diaSemanaInicio; i++) {
    html += `<div class="calendar-day calendar-day-empty"></div>`;
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const dataDia = new Date(ano, mes, dia);
    const isHoje = dataDia.toDateString() === dataHoje.toDateString();
    const isSelecionado = dataDia.toDateString() === dataAtual.toDateString();

    let classes = 'calendar-day';
    if (isHoje) classes += ' calendar-day-today';
    if (isSelecionado) classes += ' calendar-day-selected';

    html += `
      <button class="${classes}" data-dia="${dia}" data-mes="${mes + 1}" data-ano="${ano}">
        <span class="day-number">${dia}</span>
        ${isHoje ? '<ion-icon name="today" class="today-icon"></ion-icon>' : ''}
      </button>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll('.calendar-day:not(.calendar-day-empty)').forEach(btn => {
    btn.addEventListener('click', () => {
      const dia = parseInt(btn.dataset.dia);
      const mes = parseInt(btn.dataset.mes);
      const ano = parseInt(btn.dataset.ano);
      selecionarData(new Date(ano, mes - 1, dia));
    });
  });

  document.getElementById('lit-cal-mes-anterior')?.addEventListener('click', () => {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    gerarCalendario();
  });

  document.getElementById('lit-cal-mes-proximo')?.addEventListener('click', () => {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    gerarCalendario();
  });
}

// =========================================
// Compartilhar (2 opções, igual ao app)
// =========================================
let shareData = { titulo: "", ref: "", texto: "" };

function handleShare(tipo) {
  const linkPlayStore = 'https://play.google.com/store/apps/details?id=com.manualdocatolico.app';

  const msg = tipo === "curto"
    ? `📖 *${shareData.titulo}*\n${shareData.ref}\n\n🙏 Confira a liturgia no app Manual do Católico!\n📲 ${linkPlayStore}`
    : `📖 *${shareData.titulo}*\n${shareData.ref}\n\n${shareData.texto}\n\n🙏 Leia a liturgia diária no app Manual do Católico!\n📲 ${linkPlayStore}`;

  if (navigator.share) {
    navigator.share({ title: 'Liturgia Diária', text: msg })
      .catch(err => {
        if (err.name !== 'AbortError') console.error('Erro ao compartilhar:', err);
      });
  } else {
    navigator.clipboard.writeText(msg)
      .then(() => alert('Texto copiado! Cole onde quiser compartilhar.'))
      .catch(() => alert('Não foi possível compartilhar. Tente manualmente.'));
  }

  if (shareModal) shareModal.hide();
}

function compartilharAbaAtual() {
  const leitura = leituras[abaAtiva];
  if (!leitura) return;
  shareData = {
    titulo: leitura.titulo || nomeAba[abaAtiva],
    ref: leitura.referencia || '',
    texto: leitura.texto || ''
  };
  if (shareModal) shareModal.show();
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
  dataAtual = new Date();
  dataHoje = new Date();

  // Modais Bootstrap
  const shareModalEl = document.getElementById('shareModal');
  if (shareModalEl && typeof bootstrap !== 'undefined') {
    shareModal = new bootstrap.Modal(shareModalEl);
  }
  const calModalEl = document.getElementById('calendarModal');
  if (calModalEl && typeof bootstrap !== 'undefined') {
    showCalendarModal = new bootstrap.Modal(calModalEl);
    calModalEl.addEventListener('shown.bs.modal', () => {
      gerarCalendario();
    });
  }

  // Botões de navegação de data
  document.getElementById('btn-data-anterior')?.addEventListener('click', () => navegar(-1));
  document.getElementById('btn-data-proximo')?.addEventListener('click', () => navegar(1));
  document.getElementById('btn-data-centro')?.addEventListener('click', () => {
    if (showCalendarModal) {
      gerarCalendario();
      showCalendarModal.show();
    }
  });

  // Botão "Ir para hoje"
  document.getElementById('btn-lit-ir-hoje')?.addEventListener('click', voltarParaHoje);

  // Toggle sábado → domingo
  document.getElementById('btn-domingo-sabado')?.addEventListener('click', () => {
    modoDomingo = false;
    atualizarToggleDomingo();
    carregarLiturgia(dataAtual, false);
  });
  document.getElementById('btn-domingo-domingo')?.addEventListener('click', () => {
    modoDomingo = true;
    atualizarToggleDomingo();
    carregarLiturgia(dataAtual, true);
  });

  // Compartilhar
  document.getElementById('btn-compartilhar-leitura')?.addEventListener('click', compartilharAbaAtual);
  document.getElementById('share-curto')?.addEventListener('click', () => handleShare('curto'));
  document.getElementById('share-completo')?.addEventListener('click', () => handleShare('completo'));

  await carregarLiturgia(dataAtual);
});
