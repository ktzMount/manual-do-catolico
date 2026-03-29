// =========================================
// ORAÇÕES - PWA (IGUAL AO MOBILE)
// =========================================

let oracoes = [];
let favoritos = new Set();
let mostrarApenasFavoritas = false;
let termoBusca = '';

// =========================================
// Carregar orações dos dados embutidos
// =========================================
function carregarOracoes() {
  if (typeof window.oracoesData !== 'undefined') {
    return Promise.resolve(window.oracoesData);
  }
  return fetch('../data/oracoesdata.js')
    .then(response => response.ok ? [] : [])
    .catch(() => []);
}

// =========================================
// Carregar favoritos do localStorage
// =========================================
function carregarFavoritos() {
  try {
    const salvos = localStorage.getItem('@manual_catolico:favoritos');
    return salvos ? new Set(JSON.parse(salvos)) : new Set();
  } catch (e) {
    console.error('Erro ao carregar favoritos:', e);
    return new Set();
  }
}

// =========================================
// Salvar favoritos no localStorage
// =========================================
function salvarFavoritos() {
  try {
    localStorage.setItem('@manual_catolico:favoritos', JSON.stringify(Array.from(favoritos)));
  } catch (e) {
    console.error('Erro ao salvar favoritos:', e);
  }
}

// =========================================
// Alternar favorito
// =========================================
function alternarFavorito(id) {
  if (favoritos.has(id)) {
    favoritos.delete(id);
  } else {
    favoritos.add(id);
  }
  salvarFavoritos();
  renderizarLista();
}

// =========================================
// Filtrar orações
// =========================================
function filtrarOracoes() {
  return oracoes.filter(oracao => {
    if (mostrarApenasFavoritas && !favoritos.has(oracao.id)) return false;
    if (termoBusca && !oracao.nome.toLowerCase().includes(termoBusca.toLowerCase())) return false;
    return true;
  });
}

// =========================================
// Renderizar lista de orações
// =========================================
function renderizarLista() {
  const grid = document.getElementById('oracoes-grid');
  const emptyMsg = document.getElementById('empty-message');
  const countEl = document.getElementById('resultados-count');
  const filtradas = filtrarOracoes();
  
  grid.innerHTML = '';
  
  // Atualiza contador
  countEl.textContent = `${filtradas.length} ${filtradas.length === 1 ? 'oração' : 'orações'}`;
  
  if (filtradas.length === 0) {
    emptyMsg.style.display = 'block';
    document.getElementById('empty-title').textContent = 
      mostrarApenasFavoritas ? 'Nenhuma oração favorita.' : 'Nenhuma oração encontrada.';
    document.getElementById('empty-subtitle').textContent = 
      mostrarApenasFavoritas ? 'Toque no ❤️ para favoritar!' : 
      termoBusca ? 'Tente buscar por outro nome.' : '';
    return;
  }
  
  emptyMsg.style.display = 'none';
  
  filtradas.forEach(oracao => {
    const card = document.createElement('div');
    card.className = 'card-oracao-lista';
    card.dataset.id = oracao.id;
    
    const isFavorito = favoritos.has(oracao.id);
    
    card.innerHTML = `
      <button class="btn-favorito-card ${isFavorito ? 'favoritado' : ''}" title="Favoritar" data-id="${oracao.id}">
        <ion-icon name="${isFavorito ? 'heart' : 'heart-outline'}"></ion-icon>
      </button>
      <div class="image-wrapper">
        <img src="../${oracao.imagem}" alt="${oracao.nome}" class="oracao-imagem-small" />
      </div>
      <p class="nome">${oracao.nome}</p>
    `;
    
    // Clique no card → vai para detalhe
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-favorito-card')) {
        window.location.href = `oracao-detalhe.html?id=${oracao.id}`;
      }
    });
    
    // Clique no coração → alterna favorito
    const btnFav = card.querySelector('.btn-favorito-card');
    btnFav.addEventListener('click', (e) => {
      e.stopPropagation();
      alternarFavorito(oracao.id);
    });
    
    grid.appendChild(card);
  });
  
  // Recarrega ícones do Ionicons
  if (typeof ionicons !== 'undefined') ionicons.load({});
}

// =========================================
// Renderizar detalhe da oração
// =========================================
function renderizarDetalhe(oracao) {
  if (!oracao) {
    document.getElementById('loading').innerHTML = '<p class="text-danger">Oração não encontrada.</p>';
    return;
  }
  
  document.getElementById('oracao-nome').textContent = oracao.nome;
  document.getElementById('oracao-texto').textContent = oracao.texto;
  document.getElementById('oracao-imagem').src = `../${oracao.imagem}`;
  document.getElementById('oracao-imagem').alt = oracao.nome;
  
  // Atualiza botão favoritar
  const isFavorito = favoritos.has(oracao.id);
  const icon = document.getElementById('icon-favorito-detalhe');
  const btn = document.getElementById('btn-favorito-detalhe');
  if (icon && btn) {
    icon.name = isFavorito ? 'heart' : 'heart-outline';
    btn.classList.toggle('favoritado', isFavorito);
  }
  
  // Esconde loading, mostra conteúdo
  document.getElementById('loading').style.display = 'none';
  document.getElementById('oracao-content').style.display = 'block';
  
  // Atualiza título da página
  document.title = `${oracao.nome} - Orações`;
}

// =========================================
// Inicialização - LISTA (oracoes.html)
// =========================================
function inicializarLista() {
  carregarOracoes().then(dados => {
    oracoes = dados;
    favoritos = carregarFavoritos();
    renderizarLista();
  });
  
  // Filtro de favoritos
  const btnFiltro = document.getElementById('btn-favoritas');
  const iconFiltro = document.getElementById('icon-favoritas');
  const textoFiltro = document.getElementById('texto-favoritas');
  
  btnFiltro?.addEventListener('click', () => {
    mostrarApenasFavoritas = !mostrarApenasFavoritas;
    
    if (mostrarApenasFavoritas) {
      btnFiltro.classList.add('ativo');
      iconFiltro.name = 'heart';
      textoFiltro.textContent = 'Favoritas';
    } else {
      btnFiltro.classList.remove('ativo');
      iconFiltro.name = 'heart-outline';
      textoFiltro.textContent = 'Favoritas';
    }
    
    renderizarLista();
  });
  
  // Busca
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search');
  
  searchInput?.addEventListener('input', (e) => {
    termoBusca = e.target.value.trim();
    clearBtn.style.display = termoBusca ? 'block' : 'none';
    renderizarLista();
  });
  
  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    termoBusca = '';
    clearBtn.style.display = 'none';
    renderizarLista();
    searchInput.focus();
  });
}

// =========================================
// Inicialização - DETALHE (oracao-detalhe.html)
// =========================================
function inicializarDetalhe() {
  Promise.all([carregarOracoes(), carregarFavoritos()]).then(([dados, favs]) => {
    oracoes = dados;
    favoritos = favs;
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    const oracao = oracoes.find(o => o.id === id);
    renderizarDetalhe(oracao);
  });
  
  // Botão "Amém" → volta para lista
  document.getElementById('btn-amen')?.addEventListener('click', () => {
    window.location.href = 'oracoes.html';
  });
  
  // Botão favoritar na tela de detalhe
  document.getElementById('btn-favorito-detalhe')?.addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) alternarFavorito(id);
  });
}

// =========================================
// INICIALIZAÇÃO GERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('oracao-detalhe.html')) {
    inicializarDetalhe();
  } else {
    inicializarLista();
  }
});