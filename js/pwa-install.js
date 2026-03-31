document.addEventListener('DOMContentLoaded', () => {
    const ua = navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isStandalone) return; // Se já for app instalado, ignora.

    if (isIos) {
        criarBannerIOS();
    } else if (isAndroid) {
        criarBannerAndroid();
    }
});

function criarBannerIOS() {
    const banner = document.createElement('div');
    banner.id = 'pwa-link-banner';
    banner.innerHTML = `
        <div class="banner-pwa-content">
            <img src="assets/images/icons/og-image.png" alt="App Icon">
            <div class="textos">
                <p><b>Instale o Manual no iPhone</b></p>
                <span>Toque em <ion-icon name="share-outline"></ion-icon> e "Adicionar à Tela de Início"</span>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
    `;
    document.body.appendChild(banner);
}

function criarBannerAndroid() {
    const banner = document.createElement('div');
    banner.id = 'pwa-link-banner';
    banner.innerHTML = `
        <div class="banner-pwa-content">
            <img src="/assets/images/icons/og-image.png" alt="App Icon">
            <div class="textos">
                <p><b>App Manual do Católico</b></p>
                <span>Versão oficial na Play Store</span>
            </div>
            <a href="https://play.google.com/store/apps/details?id=com.manualdocatolico.app" target="_blank" class="btn-play">ABRIR</a>
        </div>
    `;
    document.body.appendChild(banner);
}