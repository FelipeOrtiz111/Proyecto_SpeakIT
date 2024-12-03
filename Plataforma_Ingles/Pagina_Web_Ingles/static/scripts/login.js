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
        loaderOverlay.classList.add('fade-out');
        document.body.classList.add('content-loaded');
        
        // Remover el overlay después de la transición
        setTimeout(() => {
            loaderOverlay.remove();
        }, 500);
    }
    
    // Pequeño retraso para asegurar que el overlay se muestre
    setTimeout(() => {
        // Esperar a que las imágenes estén cargadas
        Promise.all(
            Array.from(document.images)
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                    img.onload = img.onerror = resolve;
                }))
        ).then(() => {
            console.log('Todas las imágenes cargadas');
            showContent();
        });
    }, 500);
}); 