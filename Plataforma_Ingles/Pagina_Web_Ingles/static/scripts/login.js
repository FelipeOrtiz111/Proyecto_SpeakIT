document.addEventListener('DOMContentLoaded', function() {
    // Crear y agregar el overlay de carga
    const loaderOverlay = document.createElement('div');
    loaderOverlay.className = 'loader-overlay';
    loaderOverlay.innerHTML = `
        <div class="loader-content">
            <img src="/static/images/logo.png" alt="Loading..." style="width: 100px;">
        </div>
    `;
    document.body.insertBefore(loaderOverlay, document.body.firstChild);
    
    // Función para mostrar el contenido
    function showContent() {
        console.log('Contenido cargado, iniciando transición');
        document.body.style.visibility = 'visible';
        loaderOverlay.classList.add('fade-out');
        
        // Remover el overlay después de la transición
        setTimeout(() => {
            loaderOverlay.remove();
            document.body.classList.add('content-loaded');
        }, 500);
    }

    // Asegurarnos de que el contenido esté oculto inicialmente
    document.body.style.visibility = 'hidden';
    
    // Pequeño retraso para asegurar que el overlay se muestre
    window.addEventListener('load', () => {
        console.log('Ventana cargada completamente');
        setTimeout(showContent, 500);
    });
}); 