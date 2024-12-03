document.addEventListener('DOMContentLoaded', function() {
    // Crear y agregar el overlay de carga
    const loaderOverlay = document.createElement('div');
    loaderOverlay.className = 'loader-overlay';
    loaderOverlay.innerHTML = `
        <div class="loader-content">
            <img src="/static/images/logo.png" alt="Loading..." style="width: 100px;">
        </div>
    `;
    document.body.appendChild(loaderOverlay);
    
    // Precargar la imagen de fondo
    const bgImage = new Image();
    bgImage.src = '/static/images/library.jpg';
    
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
        // Esperar a que el documento esté completamente cargado
        new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        }),
        // Dar un mínimo de tiempo para la animación
        new Promise(resolve => setTimeout(resolve, 500))
    ]).then(showContent);
    
    // Manejar la carga de otras imágenes
    const images = document.querySelectorAll('.fondo img');
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                img.classList.add('loaded');
            });
        }
    });
}); 