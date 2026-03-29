// =========================================
// PRECES - PWA (IGUAL AO MOBILE)
// =========================================

let preces = [];

// =========================================
// Renderizar lista de preces
// =========================================
function renderizarLista() {
  const list = document.getElementById('preces-list');
  if (!list) return;

  list.innerHTML = '';
  
  preces.forEach(prece => {
    const card = document.createElement('div');
    card.className = 'prece-card';
    
    card.innerHTML = `
      <div class="prece-icon">
        <ion-icon name="hand-left-outline"></ion-icon>
      </div>
      <p class="prece-nome">${prece.nome}</p>
      <ion-icon name="chevron-forward" class="prece-chevron"></ion-icon>
    `;
    
    card.addEventListener('click', () => {
      window.location.href = `prece-detalhe.html?id=${prece.id}`;
    });
    
    list.appendChild(card);
  });
  
  // Atualizar ícones do Ionicons
  if (typeof ionicons !== 'undefined') {
    ionicons.load({});
  }
}

// =========================================
// Renderizar detalhe da prece
// =========================================
function renderizarDetalhe(prece) {
  if (!prece) {
    document.getElementById('loading').innerHTML = `
      <div class="error-container">
        <p class="error-text">Prece não encontrada.</p>
        <button class="error-button" onclick="window.location.href='preces.html'">Voltar</button>
      </div>
    `;
    return;
  }
  
  // Título
  document.getElementById('prece-nome').textContent = prece.nome;
  
  // Texto da prece (preserva quebras de linha)
  document.getElementById('prece-texto').textContent = prece.texto;
  
  // Esconder loading, mostrar conteúdo
  document.getElementById('loading').style.display = 'none';
  document.getElementById('prece-content').style.display = 'block';
  
  // Atualizar título da página
  document.title = `${prece.nome} - Preces`;
}

// =========================================
// Inicialização - LISTA (preces.html)
// =========================================
function inicializarLista() {
  // Carregar dados
  if (typeof window.precesData !== 'undefined') {
    preces = window.precesData;
    renderizarLista();
  } else {
    console.error('❌ Dados das preces não carregados!');
    document.getElementById('preces-list').innerHTML = '<p class="text-danger">Erro ao carregar preces.</p>';
  }
}

// =========================================
// Inicialização - DETALHE (prece-detalhe.html)
// =========================================
function inicializarDetalhe() {
  // Carregar dados
  if (typeof window.precesData === 'undefined') {
    console.error('❌ Dados das preces não carregados!');
    document.getElementById('loading').innerHTML = '<p class="text-danger">Erro ao carregar dados.</p>';
    return;
  }
  
  preces = window.precesData;
  
  // Pegar ID da URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  const prece = preces.find(p => p.id === id);
  renderizarDetalhe(prece);
  
  // Botão "Amém" → volta para lista
  document.getElementById('btn-amen')?.addEventListener('click', () => {
    window.location.href = 'preces.html';
  });
}

// =========================================
// INICIALIZAÇÃO GERAL
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('prece-detalhe.html')) {
    inicializarDetalhe();
  } else {
    inicializarLista();
  }
});