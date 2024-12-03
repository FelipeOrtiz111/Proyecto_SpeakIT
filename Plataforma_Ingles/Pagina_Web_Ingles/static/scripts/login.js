document.addEventListener('DOMContentLoaded', function() {
    // Ocultar todo el contenido inicialmente
    document.body.style.visibility = 'hidden';
    
    // Precargar la imagen de fondo
    const bgImage = new Image();
    bgImage.src = '/static/images/library.jpg';
    
    // Función para mostrar todo el contenido
    function showContent() {
        document.body.style.visibility = 'visible';
        document.body.classList.add('content-loaded');
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
        })
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