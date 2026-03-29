// =========================================
// SANTOS - PWA (IGUAL AO MOBILE)
// =========================================

let santos = [];
let termoBusca = '';

// =========================================
// Filtrar santos
// =========================================
function filtrarSantos() {
  if (!termoBusca) return santos;
  const termo = termoBusca.toLowerCase().trim();
  return santos.filter(santo =>
    santo.nome.toLowerCase().includes(termo) ||
    (santo.regiao && santo.regiao.toLowerCase().includes(termo))
  );
}

// =========================================
// Renderizar lista de santos
// =========================================
function renderizarLista() {
  const list = document.getElementById('santos-list');
  const emptyMsg = document.getElementById('empty-message');
  const filtrados = filtrarSantos();
  
  list.innerHTML = '';
  
  if (filtrados.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  
  emptyMsg.style.display = 'none';
  
  filtrados.forEach(santo => {
    const card = document.createElement('div');
    card.className = 'santo-card';
    card.innerHTML = `
      <div class="santo-image-wrapper">
        <img src="../${santo.imagem}" alt="${santo.nome}" />
      </div>
      <div class="santo-info">
        <p class="santo-nome">${santo.nome}</p>
        <p class="santo-dia">${santo.diaFestivo}</p>
      </div>
      <ion-icon name="chevron-forward" class="santo-chevron"></ion-icon>
    `;
    
    card.addEventListener('click', () => {
      window.location.href = `santo-detalhe.html?nome=${encodeURIComponent(santo.nome)}`;
    });
    
    list.appendChild(card);
  });
  
  // Atualizar ícones do Ionicons
  if (typeof ionicons !== 'undefined') {
    ionicons.load({});
  }
}

// =========================================
// Renderizar detalhe do santo
// =========================================
function renderizarDetalhe(santo) {
  if (!santo) {
    document.getElementById('loading').innerHTML = '<p class="text-danger">Santo não encontrado.</p>';
    return;
  }
  
  // Imagem
  document.getElementById('santo-imagem').src = `../${santo.imagem}`;
  document.getElementById('santo-imagem').alt = santo.nome;
  
  // Vida e Martírio
  document.getElementById('santo-historia').textContent = santo.historia;
  
  // Dia Festivo
  document.getElementById('santo-diafestivo').textContent = santo.diaFestivo;
  
  // Região (opcional)
  const cardRegiao = document.getElementById('card-regiao');
  if (santo.regiao) {
    cardRegiao.style.display = 'block';
    document.getElementById('santo-regiao').textContent = santo.regiao;
  } else {
    cardRegiao.style.display = 'none';
  }
  
  // Nascimento (opcional)
  const cardNascimento = document.getElementById('card-nascimento');
  if (santo.dataNascimento) {
    cardNascimento.style.display = 'block';
    document.getElementById('santo-nascimento').textContent = santo.dataNascimento;
  } else {
    cardNascimento.style.display = 'none';
  }
  
  // Canonização (opcional)
  const cardCanonizacao = document.getElementById('card-canonizacao');
  if (santo.dataCanonizacao) {
    cardCanonizacao.style.display = 'block';
    document.getElementById('santo-canonizacao').textContent = santo.dataCanonizacao;
  } else {
    cardCanonizacao.style.display = 'none';
  }
  
  // Curiosidade (opcional)
  const cardCuriosidade = document.getElementById('card-curiosidade');
  if (santo.curiosidade) {
    cardCuriosidade.style.display = 'block';
    document.getElementById('santo-curiosidade').textContent = santo.curiosidade;
  } else {
    cardCuriosidade.style.display = 'none';
  }
  
  // Esconder loading, mostrar conteúdo
  document.getElementById('loading').style.display = 'none';
  document.getElementById('santo-content').style.display = 'block';
  
  // Atualizar título da página
  document.title = `${santo.nome} - Santos`;
}

// =========================================
// Inicialização - LISTA (santos.html)
// =========================================
function inicializarLista() {
  // Carregar dados
  if (typeof window.santosData !== 'undefined') {
    santos = window.santosData;
    renderizarLista();
  } else {
    console.error('❌ Dados dos santos não carregados!');
    document.getElementById('santos-list').innerHTML = '<p class="text-danger">Erro ao carregar santos.</p>';
  }
  
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
// Inicialização - DETALHE (santo-detalhe.html)
// =========================================
function inicializarDetalhe() {
  // Carregar dados
  if (typeof window.santosData === 'undefined') {
    console.error('❌ Dados dos santos não carregados!');
    document.getElementById('loading').innerHTML = '<p class="text-danger">Erro ao carregar dados.</p>';
    return;
  }
  
  santos = window.santosData;
  
  // Pegar nome da URL
  const params = new URLSearchParams(window.location.search);
  const nome = decodeURIComponent(params.get('nome') || '');
  
  const santo = santos.find(s => s.nome === nome);
  renderizarDetalhe(santo);
}

// =========================================
// INICIALIZAÇÃO GERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('santo-detalhe.html')) {
    inicializarDetalhe();
  } else {
    inicializarLista();
  }
});