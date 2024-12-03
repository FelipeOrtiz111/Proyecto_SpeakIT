document.addEventListener('DOMContentLoaded', function() {
    // Ocultar todo el contenido inicialmente
    document.body.style.visibility = 'hidden';
    
    // Precargar la imagen de fondo
    const bgImage = new Image();
    bgImage.src = '/static/images/library.jpg';
    
    // Función para mostrar todo el contenido
    function showContent() {
        // Primero hacemos visible el body pero con opacidad 0
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '0';
        
        // Pequeño retraso para asegurar que la transición funcione
        setTimeout(() => {
            document.body.classList.add('content-loaded');
            document.body.style.opacity = '1';
        }, 50);
    }
    
    // Esperar a que la imagen de fondo y todos los recursos estén cargados
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
        // Dar un pequeño tiempo mínimo de carga
        new Promise(resolve => setTimeout(resolve, 300))
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