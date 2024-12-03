document.addEventListener('DOMContentLoaded', function() {
    // Crear el overlay de carga
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    
    // Agregar el contenido del loading
    loadingScreen.innerHTML = `
        <div class="loading-content">
            <img src="/static/images/logo.png" alt="Logo" class="loading-logo">
            <div class="loading-spinner"></div>
            <div class="loading-text">Cargando...</div>
        </div>
    `;
    
    // Agregar al body
    document.body.appendChild(loadingScreen);
    
    // Precargar la imagen de fondo
    const bgImage = new Image();
    bgImage.src = '/static/images/library.jpg';
    
    // Función para mostrar todo el contenido
    function showContent() {
        // Primero desvanecemos el loading screen
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.remove();
            // Luego mostramos el contenido
            document.body.style.visibility = 'visible';
            document.body.classList.add('content-loaded');
        }, 500);
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
