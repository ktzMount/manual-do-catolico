// =========================================
// SANTO DO DIA - PWA (IGUAL AO MOBILE)
// =========================================

let santos = [];
let dataAtual = new Date();
let dataHoje = new Date();
let modalCalendario;

// =========================================
// Formata data para exibição
// =========================================
function formatarDataExibida(data) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let dataFormatada = data.toLocaleDateString('pt-BR', options);
  return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
}

// =========================================
// Formata data para calendário (YYYY-MM-DD)
// =========================================
function formatarDataCalendario(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// =========================================
// Carrega santo do dia
// =========================================
function carregarSantoDoDia(data) {
  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  
  const santo = santos.find(s => s.dia === dia && s.mes === mes);
  
  if (santo) {
    document.getElementById('santo-nome').textContent = santo.nome;
    document.getElementById('santo-descricao').textContent = santo.descricaoCurta;
    document.getElementById('santo-dia-festivo').textContent = santo.diaFestivo;
    document.getElementById('santo-canonizacao').textContent = santo.canonizacao;
    document.getElementById('santo-historia').textContent = santo.historia;
    
    const imgElement = document.getElementById('santo-imagem');
    imgElement.alt = santo.nome;
    imgElement.style.display = 'block';
    
    if (santo.imagem) {
      // Remove require() e ajusta caminho: assets/ → ../assets/
      let caminhoImagem = santo.imagem
        .replace("require('../", "")
        .replace(".png')", ".png")
        .replace(".jpg')", ".jpg");
      
      // Se começar com assets/, adiciona ../ para subir da pasta html/
      if (caminhoImagem.startsWith('assets/')) {
        caminhoImagem = '../' + caminhoImagem;
      }
      
      imgElement.src = caminhoImagem;
      
      // Fallback elegante se a imagem não existir
      imgElement.onerror = function() {
        this.style.display = 'none';
      };
    }
    
    document.title = `${santo.nome} - Santo do Dia`;
  } else {
    document.getElementById('santo-nome').textContent = 'Nenhum registro encontrado';
    document.getElementById('santo-descricao').textContent = 'Não há registro de santo para esta data.';
    document.getElementById('santo-dia-festivo').textContent = '';
    document.getElementById('santo-canonizacao').textContent = '';
    document.getElementById('santo-historia').textContent = '';
    
    const imgElement = document.getElementById('santo-imagem');
    imgElement.style.display = 'none';
  }
  
  document.getElementById('data-exibida').textContent = formatarDataExibida(data);
}

// =========================================
// Gera calendário BONITO com ícones
// =========================================
function gerarCalendario() {
  const container = document.getElementById('calendario-container');
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
      <button class="btn-calendario-nav" id="cal-mes-anterior">
        <ion-icon name="chevron-back"></ion-icon>
      </button>
      <div class="calendar-month-year text-center">
        <div class="calendar-month">${nomesMeses[mes]}</div>
        <div class="calendar-year">${ano}</div>
      </div>
      <button class="btn-calendario-nav" id="cal-mes-proximo">
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
  
  // Dias vazios antes do primeiro dia
  for (let i = 0; i < diaSemanaInicio; i++) {
    html += `<div class="calendar-day calendar-day-empty"></div>`;
  }
  
  // Dias do mês
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
  
  // Event listeners para os dias
  container.querySelectorAll('.calendar-day:not(.calendar-day-empty)').forEach(btn => {
    btn.addEventListener('click', () => {
      const dia = parseInt(btn.dataset.dia);
      const mes = parseInt(btn.dataset.mes);
      const ano = parseInt(btn.dataset.ano);
      
      dataAtual = new Date(ano, mes - 1, dia);
      carregarSantoDoDia(dataAtual);
      
      // Remove seleção anterior
      container.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('calendar-day-selected'));
      btn.classList.add('calendar-day-selected');
      
      if (modalCalendario) modalCalendario.hide();
    });
  });
  
  // Navegação entre meses
  document.getElementById('cal-mes-anterior')?.addEventListener('click', () => {
    dataAtual.setMonth(dataAtual.getMonth() - 1);
    gerarCalendario();
  });
  
  document.getElementById('cal-mes-proximo')?.addEventListener('click', () => {
    dataAtual.setMonth(dataAtual.getMonth() + 1);
    gerarCalendario();
  });
}

// =========================================
// COMPARTILHAMENTO DIRETO (UMA OPÇÃO SÓ)
// =========================================
async function compartilharSanto() {
  const santoNome = document.getElementById('santo-nome').textContent;
  const dia = dataAtual.getDate();
  const mes = dataAtual.toLocaleString('pt-BR', { month: 'long' });
  const descricaoCurta = document.getElementById('santo-descricao').textContent;
  
  // Links oficiais do app
  const linkPlayStore = 'https://play.google.com/store/apps/details?id=com.manualdocatolico.app';
  const linkPWA = 'https://manualdocatolico.vercel.app'; // ← URL BASE do site (sem /html/...)
  
  // Rodapé personalizado (igual à Liturgia)
  const rodapeCompartilhamento = `\n\n Baixe no Android: ${linkPlayStore}\n Acesse também no: ${linkPWA}`;
  
  // Mensagem completa
  const mensagem = ` *Santo do Dia: ${santoNome}*\n\n ${dia} de ${mes}\n\n${descricaoCurta}${rodapeCompartilhamento}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Santo do Dia',
        text: mensagem,
        url: linkPWA  // ← USA A URL BASE, NÃO window.location.href
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Erro ao compartilhar:', err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(mensagem);
      alert('Texto copiado! Cole onde quiser compartilhar.');
    } catch (err) {
      alert('Não foi possível compartilhar. Tente manualmente.');
    }
  }
}

// =========================================
// Carregar dados dos santos (SIMPLIFICADO)
// =========================================
async function carregarDadosSantos() {
  // Usa os dados já carregados via <script src="santos.js">
  if (typeof window.santosData !== 'undefined' && Array.isArray(window.santosData)) {
    console.log('✅ Santos carregados:', window.santosData.length, 'santos');
    santos = window.santosData;
    return true;
  }
  
  console.error('❌ Dados dos santos não encontrados!');
  return false;
}

// =========================================
// INICIALIZAÇÃO
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const dadosCarregados = await carregarDadosSantos();
    if (!dadosCarregados || santos.length === 0) {
      throw new Error('Nenhum dado de santos disponível');
    }
    
    // Inicializar modal do calendário (Bootstrap)
    const modalCalendarioEl = document.getElementById('modalCalendario');
    if (modalCalendarioEl && typeof bootstrap !== 'undefined') {
      modalCalendario = new bootstrap.Modal(modalCalendarioEl);
      
      modalCalendarioEl.addEventListener('shown.bs.modal', () => {
        gerarCalendario();
      });
    }
    
    // Botão do calendário na imagem
    document.getElementById('btn-calendario')?.addEventListener('click', () => {
      if (modalCalendario) {
        gerarCalendario();
        modalCalendario.show();
      }
    });
    
    // Botão "Ir para hoje" no modal
    document.getElementById('btn-ir-hoje')?.addEventListener('click', () => {
      dataAtual = new Date();
      carregarSantoDoDia(dataAtual);
      if (modalCalendario) modalCalendario.hide();
    });
    
    // Botão compartilhar (compartilha direto, sem modal)
    document.getElementById('btn-compartilhar')?.addEventListener('click', compartilharSanto);
    
    // Carregar santo de hoje
    dataAtual = new Date();
    dataHoje = new Date();
    carregarSantoDoDia(dataAtual);
    
    // Esconder loading, mostrar conteúdo
    document.getElementById('loading').style.display = 'none';
    document.getElementById('santo-content').style.display = 'block';
    
  } catch (error) {
    console.error('Erro ao carregar:', error);
    document.getElementById('loading').innerHTML = `
      <div class="alert alert-danger">Erro ao carregar dados. <button class="btn btn-brown btn-sm" onclick="location.reload()">Recarregar</button></div>
    `;
  }
});