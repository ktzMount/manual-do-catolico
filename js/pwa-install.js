document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário já fechou esse modal antes
    if (localStorage.getItem('pwaModalVisto') === 'true') return;

    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) return;

    if (isIos) {
        criarModalPWA('ios');
    } else if (isAndroid) {
        criarModalPWA('android');
    }
});

function criarModalPWA(plataforma) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'pwa-modal-overlay';
    
    let conteudo = '';

    if (plataforma === 'ios') {
        conteudo = `
            <img src="/assets/images/icons/og-image.png" alt="App Icon" class="modal-icon">
            <h3>Instale o Manual no iPhone</h3>
            <p>Tenha acesso rápido às orações! Toque no ícone de compartilhar <ion-icon name="share-outline"></ion-icon> e selecione <b>"Adicionar à Tela de Início"</b>.</p>
        `;
    } else {
        conteudo = `
            <img src="/assets/images/icons/og-image.png" alt="App Icon" class="modal-icon">
            <h3>App Manual do Católico</h3>
            <p>Nossa versão oficial está disponível na Play Store com recursos exclusivos.</p>
            <a href="https://play.google.com/store/apps/details?id=com.manualdocatolico.app" target="_blank" class="btn-modal-play" onclick="fecharModalPWA()">BAIXAR AGORA</a>
        `;
    }

    modalOverlay.innerHTML = `
        <div class="pwa-modal-card">
            <button class="btn-fechar-modal" onclick="fecharModalPWA()">✕</button>
            ${conteudo}
            <button class="btn-modal-depois" onclick="fecharModalPWA()">Agora não</button>
        </div>
    `;
    document.body.appendChild(modalOverlay);
}

function fecharModalPWA() {
    document.getElementById('pwa-modal-overlay').remove();
    // Salva no navegador que o usuário já viu o modal
    localStorage.setItem('pwaModalVisto', 'true');
}