// =========================================
// LITURGIA DIÁRIA - PWA (COM TABS)
// =========================================

let liturgiaData = null;
let shareModal;
let abaAtiva = 'primeira';
let leituras = [];

// =========================================
// Mapeamento de tabs
// =========================================
const nomeAba = {
  'primeira': '1ª Leitura',
  'salmo': 'Salmo',
  'segunda': '2ª Leitura',
  'evangelho': 'Evangelho'
};

// =========================================
// Formata texto com versículos destacados
// =========================================
function formatarTextoComVersiculos(texto) {
  if (!texto) return '';
  
  const partes = texto.split(/(\d+\s)/g);
  
  return partes.map(parte => {
    if (/^\d+\s$/.test(parte)) {
      return `<span class="versiculo-num">${parte.trim()}</span>`;
    }
    return parte;
  }).join('');
}

// =========================================
// Detecta abas disponíveis (VERSÃO CORRIGIDA)
// =========================================
function detectarAbas(leituras) {
  const abas = [];
  
  leituras.forEach((leitura, index) => {
    const titulo = leitura.titulo.toLowerCase();
    const tipo = leitura.tipo;
    
    // Lógica por TIPO (mais confiável que por título)
    if (tipo === 'leitura') {
      // Primeira leitura: índice 0 OU título contém "primeira/1ª"
      if (index === 0 || titulo.includes('primeira') || titulo.includes('1ª') || titulo.includes('1a') || titulo.includes('1.')) {
        if (!abas.includes('primeira')) abas.push('primeira');
      }
      // Segunda leitura: índice 1+ OU título contém "segunda/2ª"
      else if (titulo.includes('segunda') || titulo.includes('2ª') || titulo.includes('2a') || titulo.includes('2.') || index >= 2) {
        if (!abas.includes('segunda')) abas.push('segunda');
      }
    } 
    else if (tipo === 'salmo' || titulo.includes('salmo') || titulo.includes('responsorial')) {
      if (!abas.includes('salmo')) abas.push('salmo');
    } 
    else if (tipo === 'evangelho' || titulo.includes('evangelho')) {
      if (!abas.includes('evangelho')) abas.push('evangelho');
    }
  });
  
  // Debug: mostra quais abas foram detectadas
  console.log('🔍 Abas detectadas:', abas);
  console.log('📚 Leituras recebidas:', leituras.map(l => ({titulo: l.titulo, tipo: l.tipo})));
  
  return abas;
}

// =========================================
// Obtém leitura atual (VERSÃO CORRIGIDA)
// =========================================
function getLeituraAtual(aba) {
  switch (aba) {
    case 'primeira':
      // Prioriza por tipo, depois por título
      return leituras.find(l => l.tipo === 'leitura' && 
        (l.titulo.toLowerCase().includes('primeira') || 
         l.titulo.toLowerCase().includes('1ª') || 
         l.titulo.toLowerCase().includes('1a') ||
         l.titulo.toLowerCase().includes('1.') ||
         leituras.indexOf(l) === 0)) || null;
      
    case 'salmo':
      return leituras.find(l => l.tipo === 'salmo' || 
        l.titulo.toLowerCase().includes('salmo') || 
        l.titulo.toLowerCase().includes('responsorial')) || null;
      
    case 'segunda':
      // Busca por tipo OU por título OU por posição (após a primeira leitura e salmo)
      return leituras.find(l => {
        const titulo = l.titulo.toLowerCase();
        const isSegundaPorTipo = l.tipo === 'leitura' && titulo.includes('segunda');
        const isSegundaPorTitulo = titulo.includes('2ª') || titulo.includes('2a') || titulo.includes('2.');
        const isSegundaPorPosicao = l.tipo === 'leitura' && 
          leituras.filter(x => x.tipo === 'leitura').indexOf(l) === 1; // Segunda leitura na lista
        return isSegundaPorTipo || isSegundaPorTitulo || isSegundaPorPosicao;
      }) || null;
      
    case 'evangelho':
      return leituras.find(l => l.tipo === 'evangelho' || 
        l.titulo.toLowerCase().includes('evangelho')) || null;
      
    default:
      return null;
  }
}

// =========================================
// Renderiza tabs
// =========================================
function renderizarTabs(abas) {
  const container = document.getElementById('tabs-container');
  container.innerHTML = '';
  
  const tabsDiv = document.createElement('div');
  tabsDiv.className = 'tabs-wrapper';
  
  abas.forEach(aba => {
    const btn = document.createElement('button');
    btn.className = `tab ${abaAtiva === aba ? 'tab-ativa' : ''}`;
    btn.textContent = nomeAba[aba];
    btn.onclick = () => {
      abaAtiva = aba;
      renderizarTabs(abas);
      renderizarConteudo();
    };
    tabsDiv.appendChild(btn);
  });
  
  container.appendChild(tabsDiv);
}

// =========================================
// Renderiza conteúdo da aba
// =========================================
function renderizarConteudo() {
  const leitura = getLeituraAtual(abaAtiva);
  const contentSection = document.getElementById('content-section');
  
  if (!leitura) {
    contentSection.style.display = 'none';
    return;
  }
  
  document.getElementById('leitura-titulo').textContent = leitura.titulo;
  document.getElementById('leitura-referencia').textContent = leitura.referencia;
  document.getElementById('leitura-texto').innerHTML = formatarTextoComVersiculos(leitura.texto);
  
  const refraoContainer = document.getElementById('refrao-container');
  if (leitura.isSalmo && leitura.refrao) {
    document.getElementById('refrao-texto').textContent = `R. ${leitura.refrao}`;
    refraoContainer.style.display = 'block';
  } else {
    refraoContainer.style.display = 'none';
  }
  
  contentSection.style.display = 'block';
  
  const btnCompartilhar = document.getElementById('btn-compartilhar-leitura');
  btnCompartilhar.onclick = () => {
    prepararCompartilhamento(leitura);
    shareModal.show();
  };
}

// =========================================
// Busca liturgia da API
// =========================================
async function buscarLiturgia() {
  try {
    const response = await fetch('https://liturgia.up.railway.app/v2/');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = await response.json();
    const leiturasAPI = raw.leituras || {};
    leituras = [];

    const pLeitura = Array.isArray(leiturasAPI.primeiraLeitura) ? leiturasAPI.primeiraLeitura[0] : null;
    if (pLeitura?.texto) {
      leituras.push({
        titulo: pLeitura.titulo || "Primeira Leitura",
        referencia: pLeitura.referencia || "",
        texto: pLeitura.texto,
        tipo: 'leitura'
      });
    }

    const salmo = Array.isArray(leiturasAPI.salmo) ? leiturasAPI.salmo[0] : null;
    if (salmo?.texto) {
      leituras.push({
        titulo: "Salmo Responsorial",
        referencia: salmo.referencia || "",
        texto: salmo.texto,
        refrao: salmo.refrao || "",
        isSalmo: true,
        tipo: 'salmo'
      });
    }

    const sLeitura = Array.isArray(leiturasAPI.segundaLeitura) ? leiturasAPI.segundaLeitura[0] : null;
    if (sLeitura?.texto) {
      leituras.push({
        titulo: sLeitura.titulo || "Segunda Leitura",
        referencia: sLeitura.referencia || "",
        texto: sLeitura.texto,
        tipo: 'leitura'
      });
    }

    const evangelho = Array.isArray(leiturasAPI.evangelho) ? leiturasAPI.evangelho[0] : null;
    if (evangelho?.texto) {
      leituras.push({
        titulo: "Evangelho",
        referencia: evangelho.referencia || "",
        texto: evangelho.texto,
        tipo: 'evangelho'
      });
    }

    const santo = typeof raw.santo === 'string' ? raw.santo : raw.santo?.texto;

    return {
      titulo: raw.liturgia || "Liturgia Diária",
      data: raw.data || "",
      cor: raw.cor || "Desconhecida",
      santo: santo || null,
      leituras: leituras
    };

  } catch (error) {
    console.error("❌ Erro ao buscar liturgia:", error);
    return {
      titulo: "Erro",
      data: "",
      cor: "",
      santo: null,
      leituras: [],
      erro: "Não foi possível carregar a liturgia. Verifique sua conexão."
    };
  }
}

// =========================================
// Prepara dados para compartilhamento
// =========================================
function prepararCompartilhamento(leitura) {
  // Seus links oficiais
  const linkPlayStore = 'https://play.google.com/store/apps/details?id=com.manualdocatolico.app';
  const linkPWA = 'https://manualdocatolico.vercel.app';
  
  // Mensagem personalizada que você queria
  const rodapeCompartilhamento = `\n\n Baixe no Android: https://play.google.com/store/apps/details?id=com.manualdocatolico.app\n Acesse também no: https://manualdocatolico.vercel.app/`;

  window.shareData = {
    curto: `${leitura.titulo}\n${leitura.referencia}${rodapeCompartilhamento}`,
    completo: `${leitura.titulo}\n${leitura.referencia}\n\n${leitura.texto}${rodapeCompartilhamento}`
  };
}

// =========================================
// Executa o compartilhamento
// =========================================
async function executarCompartilhamento(tipo) {
  const texto = window.shareData?.[tipo];
  if (!texto) return;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Liturgia Diária',
        text: texto,
        url: window.location.href
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Erro ao compartilhar:', err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(texto);
      alert('Texto copiado! Cole onde quiser compartilhar. ✝️');
    } catch (err) {
      alert('Não foi possível compartilhar. Tente manualmente.');
    }
  }
  shareModal.hide();
}

// =========================================
// Renderiza a liturgia completa
// =========================================
function renderizarLiturgia(data) {
  document.getElementById('liturgia-titulo').textContent = data.titulo;
  document.getElementById('liturgia-data').textContent = data.data;
  document.getElementById('liturgia-cor').textContent = `Cor Litúrgica: ${data.cor}`;

  const santoSection = document.getElementById('santo-section');
  if (data.santo) {
    document.getElementById('santo-texto').innerHTML = formatarTextoComVersiculos(data.santo);
    santoSection.style.display = 'block';
  } else {
    santoSection.style.display = 'none';
  }

  if (data.leituras.length > 0) {
    const abas = detectarAbas(data.leituras);
    if (abas.length > 0) {
      abaAtiva = abas[0];
      renderizarTabs(abas);
      renderizarConteudo();
    }
  }

  document.getElementById('loading').style.display = 'none';
  document.getElementById('liturgia-content').style.display = 'block';
}

// =========================================
// Inicialização
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
  const modalEl = document.getElementById('shareModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    shareModal = new bootstrap.Modal(modalEl);

    document.getElementById('share-curto')?.addEventListener('click', () => executarCompartilhamento('curto'));
    document.getElementById('share-completo')?.addEventListener('click', () => executarCompartilhamento('completo'));
  }

  try {
    const data = await buscarLiturgia();
    
    if (data.erro) {
      document.getElementById('loading').innerHTML = `
        <div class="alert alert-danger" role="alert">
          <h5>⚠️ ${data.erro}</h5>
          <button class="btn btn-brown mt-2" onclick="location.reload()">Tentar novamente</button>
        </div>
      `;
      return;
    }
    
    liturgiaData = data;
    renderizarLiturgia(data);
    
  } catch (error) {
    console.error('Erro crítico:', error);
    document.getElementById('loading').innerHTML = `
      <div class="alert alert-danger">Erro ao carregar. Recarregue a página.</div>
    `;
  }
});