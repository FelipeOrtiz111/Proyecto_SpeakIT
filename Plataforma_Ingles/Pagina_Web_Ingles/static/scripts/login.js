document.documentElement.classList.add('preload');

document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    const bgImage = new Image();
    const loginImage = new Image();
    
    bgImage.src = '/static/images/library.jpg';
    loginImage.src = '/static/images/bg_login.jpeg';
    
    function showContent() {
        document.documentElement.classList.remove('preload');
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.remove();
            document.body.style.visibility = 'visible';
            document.body.classList.add('content-loaded');
        }, 500);
    }
    
    Promise.all([
        // Esperar a que la imagen de fondo cargue
        new Promise(resolve => {
            if (bgImage.complete) resolve();
            else bgImage.onload = resolve;
        }),
        // Esperar a que la imagen del login cargue
        new Promise(resolve => {
            if (loginImage.complete) resolve();
            else loginImage.onload = resolve;
        }),
        // Esperar a que el documento esté completamente cargado
        new Promise(resolve => {
            if (document.readyState === 'complete') resolve();
            else window.addEventListener('load', resolve);
        }),
        // Tiempo mínimo de carga
        new Promise(resolve => setTimeout(resolve, 500))
    ]).then(showContent);
}); 
