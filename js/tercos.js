// =========================================
// TERÇOS - PWA (IGUAL AO MOBILE)
// =========================================

let conjuntos = [];
let textosOracoes = {};
let etapas = [];
let indiceAtual = 0;
let conjuntoAtual = null;
let modalReflexao;

// =========================================
// Gerar etapas do terço
// =========================================
function gerarEtapas(conjunto) {
  const etapas = [];
  const t = textosOracoes;

  // --- Introdução ---
  const introGrupo = [
    { nome: t.sinalDaCruz.nome, texto: t.sinalDaCruz.oracao, tipo: 'intro', grupo: [] },
    { nome: t.creio.nome, texto: t.creio.oracao, tipo: 'intro', grupo: [] },
    { nome: t.paiNosso.nome, texto: t.paiNosso.oracao, tipo: 'intro', grupo: [] },
    ...Array.from({ length: 3 }, (_, i) => ({
      nome: `${t.aveMaria.nome} ${i + 1}`,
      texto: t.aveMaria.oracao,
      tipo: 'intro',
      grupo: [],
    })),
    { nome: t.gloria.nome, texto: t.gloria.oracao, tipo: 'intro', grupo: [] },
    { nome: t.oMeuJesus.nome, texto: t.oMeuJesus.oracao, tipo: 'intro', grupo: [] },
  ];
  introGrupo.forEach(e => (e.grupo = introGrupo));
  etapas.push(...introGrupo);

  // --- Mistérios ---
  conjunto.misterios.forEach((m, idx) => {
    const indiceMisterio = idx + 1;
    const misterioObj = {
      titulo: m.titulo,
      resumo: m.meditacoes.resumo,
      biblica: m.meditacoes.biblica,
      reflexao: m.meditacoes.reflexao,
    };

    // Introdução do mistério
    const misterioIntroEtapa = {
      nome: misterioObj.titulo,
      texto: `Contemplemos o ${indiceMisterio}º Mistério:\n\n${m.meditacoes.resumo}`,
      tipo: 'misterioIntro',
      grupo: [],
      mistério: misterioObj,
      indiceMisterio,
    };
    misterioIntroEtapa.grupo = [misterioIntroEtapa];
    etapas.push(misterioIntroEtapa);

    // Dezena
    const dezenaGrupo = [
      { nome: t.paiNosso.nome, texto: t.paiNosso.oracao, tipo: 'dezena', grupo: [], mistério: misterioObj, indiceMisterio },
      ...Array.from({ length: 10 }, (_, i) => ({
        nome: `${t.aveMaria.nome} ${i + 1}`,
        texto: t.aveMaria.oracao,
        tipo: 'dezena',
        grupo: [],
        mistério: misterioObj,
        indiceMisterio,
      })),
      { nome: t.gloria.nome, texto: t.gloria.oracao, tipo: 'dezena', grupo: [], mistério: misterioObj, indiceMisterio },
      { nome: t.oMeuJesus.nome, texto: t.oMeuJesus.oracao, tipo: 'dezena', grupo: [], mistério: misterioObj, indiceMisterio },
    ];
    dezenaGrupo.forEach(e => (e.grupo = dezenaGrupo));
    etapas.push(...dezenaGrupo);
  });

  // --- Final ---
  const finalGrupo = [
    { nome: t.salveRainha.nome, texto: t.salveRainha.oracao, tipo: 'final', grupo: [] },
  ];
  finalGrupo.forEach(e => (e.grupo = finalGrupo));
  etapas.push(...finalGrupo);

  // --- Amém final ---
  const amemEtapa = {
    nome: t.amemFinal.nome,
    texto: t.amemFinal.oracao,
    tipo: 'amem',
    grupo: [],
  };
  amemEtapa.grupo = [amemEtapa];
  etapas.push(amemEtapa);

  return etapas;
}

// =========================================
// Renderizar lista de conjuntos
// =========================================
function renderizarLista() {
  const grid = document.getElementById('tercos-grid');
  if (!grid) return;

  grid.innerHTML = '';
  conjuntos.forEach(conjunto => {
    const card = document.createElement('div');
    card.className = 'card-conjunto';
    card.innerHTML = `
      <h3 class="card-conjunto-title">${conjunto.nome}</h3>
      <div class="card-conjunto-divider"></div>
      <p class="card-conjunto-dias">${conjunto.dias}</p>
    `;
    card.addEventListener('click', () => {
      window.location.href = `rezar-terco.html?id=${conjunto.id}`;
    });
    grid.appendChild(card);
  });
}

// =========================================
// Renderizar etapa atual
// =========================================
function renderizarEtapa() {
  const etapa = etapas[indiceAtual];
  if (!etapa) return;

  // Atualizar título
  document.getElementById('conjunto-nome').textContent = conjuntoAtual.nome;

  // Card do mistério (quando aplicável)
  const misterioCard = document.getElementById('misterio-card');
  const misterio = etapa.mistério;
  
  if (misterio && etapa.tipo !== 'amem') {
    misterioCard.style.display = 'block';
    document.getElementById('misterio-numeral').textContent = 
      etapa.indiceMisterio ? `${etapa.indiceMisterio}º Mistério` : '';
    document.getElementById('misterio-titulo').textContent = misterio.titulo;
    document.getElementById('misterio-resumo').textContent = misterio.resumo;
    
    // Botão de reflexão
    const btnReflexao = document.getElementById('btn-reflexao');
    btnReflexao.onclick = () => {
      document.getElementById('reflexao-texto').textContent = misterio.reflexao;
      modalReflexao.show();
    };
  } else {
    misterioCard.style.display = 'none';
  }

  // Bolinhas de progresso
  renderizarBolinhas(etapa);

  // Texto da oração
  document.getElementById('oracao-nome').textContent = etapa.nome;
  document.getElementById('oracao-texto').textContent = etapa.texto;

  // Seção bíblica (apenas em misterioIntro)
  const biblicaSection = document.getElementById('biblica-section');
  if (etapa.tipo === 'misterioIntro' && misterio?.biblica) {
    biblicaSection.style.display = 'block';
    document.getElementById('biblica-texto').textContent = misterio.biblica;
  } else {
    biblicaSection.style.display = 'none';
  }

  // Botões de navegação
  const btnAnterior = document.getElementById('btn-anterior');
  const btnProximo = document.getElementById('btn-proximo');
  
  btnAnterior.disabled = indiceAtual === 0;
  
  if (etapa.tipo === 'amem') {
    btnProximo.innerHTML = '<span>Amém!</span><ion-icon name="heart"></ion-icon>';
    btnProximo.onclick = () => {
      window.location.href = 'tercos.html';
    };
  } else {
    btnProximo.innerHTML = '<span>Próximo</span><ion-icon name="chevron-forward"></ion-icon>';
    btnProximo.onclick = () => trocarEtapa(indiceAtual + 1);
  }
  
  btnAnterior.onclick = () => trocarEtapa(indiceAtual - 1);

  // Atualizar título da página
  document.title = `${etapa.nome} - ${conjuntoAtual.nome}`;
}

// =========================================
// Renderizar bolinhas de progresso
// =========================================
function renderizarBolinhas(etapaAtual) {
  const container = document.getElementById('bolinhas-container');
  if (!container) return;

  const grupo = etapaAtual.grupo || [];
  if (grupo.length === 0) {
    container.innerHTML = '';
    return;
  }

  const pos = grupo.indexOf(etapaAtual);
  container.innerHTML = '';

  grupo.forEach((_, i) => {
    const bolinha = document.createElement('div');
    bolinha.className = 'bolinha';
    
    if (i < pos) {
      bolinha.classList.add('concluida');
    } else if (i === pos) {
      bolinha.classList.add('ativa');
    } else {
      bolinha.classList.add('pendente');
    }
    
    container.appendChild(bolinha);
  });

  // Scroll automático para bolinha ativa
  const bolinhaAtiva = container.querySelector('.ativa');
  if (bolinhaAtiva) {
    bolinhaAtiva.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

// =========================================
// Trocar etapa com animação
// =========================================
function trocarEtapa(novoIndice) {
  if (novoIndice < 0 || novoIndice >= etapas.length) return;

  const content = document.getElementById('terco-content');
  content.style.opacity = '0';
  content.style.transition = 'opacity 0.15s';

  setTimeout(() => {
    indiceAtual = novoIndice;
    renderizarEtapa();
    content.style.opacity = '1';
  }, 150);
}

// =========================================
// Inicializar tela de reza
// =========================================
function inicializarReza() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('loading').innerHTML = '<p class="text-danger">Erro: ID não informado.</p>';
    return;
  }

  conjuntoAtual = conjuntos.find(c => c.id === id.trim());
  if (!conjuntoAtual) {
    document.getElementById('loading').innerHTML = '<p class="text-danger">Conjunto não encontrado.</p>';
    return;
  }

  // Gerar etapas
  etapas = gerarEtapas(conjuntoAtual);
  indiceAtual = 0;

  // Inicializar modal
  const modalEl = document.getElementById('modalReflexao');
  modalReflexao = new bootstrap.Modal(modalEl);

  // Esconder loading, mostrar conteúdo
  document.getElementById('loading').style.display = 'none';
  document.getElementById('terco-content').style.display = 'block';

  // Renderizar primeira etapa
  renderizarEtapa();
}

// =========================================
// INICIALIZAÇÃO GERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Carregar dados
  if (typeof window.tercosData !== 'undefined') {
    conjuntos = window.tercosData;
    textosOracoes = window.textosOracoes || {};
  } else {
    console.error('❌ Dados dos terços não carregados!');
    return;
  }

  // Verificar qual página estamos
  if (window.location.pathname.includes('rezar-terco.html')) {
    inicializarReza();
  } else {
    renderizarLista();
  }
});