document.addEventListener('DOMContentLoaded', function() {
    // Crear y agregar el overlay de carga
    const loaderOverlay = document.createElement('div');
    loaderOverlay.className = 'loader-overlay';
    loaderOverlay.innerHTML = `
        <div class="loader-content">
            <img src="/static/images/logo.png" alt="Loading..." style="width: 100px; opacity: 1;">
        </div>
    `;
    document.body.appendChild(loaderOverlay);
    
    // Precargar la imagen de fondo y el logo
    const bgImage = new Image();
    bgImage.src = '/static/images/library.jpg';
    
    const logoImage = new Image();
    logoImage.src = '/static/images/logo.png';
    
    // Función para mostrar el contenido
    function showContent() {
        // Primero desvanecemos el overlay
        loaderOverlay.classList.add('fade-out');
        
        // Después de que se desvanezca el overlay, mostramos el contenido
        setTimeout(() => {
            document.body.classList.add('content-loaded');
            // Remover el overlay después de la animación
            setTimeout(() => {
                loaderOverlay.remove();
            }, 500);
        }, 500);
    }
    
    // Esperar a que todo esté cargado
    Promise.all([
        // Esperar a que la imagen de fondo cargue
        new Promise(resolve => {
            if (bgImage.complete) {
                resolve();
            } else {
                bgImage.onload = resolve;
            }
        }),
        // Esperar a que el logo cargue
        new Promise(resolve => {
            if (logoImage.complete) {
                resolve();
            } else {
                logoImage.onload = resolve;
            }
        }),
        // Esperar a que el documento esté completamente cargado
        new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        })
    ]).then(showContent);
}); 