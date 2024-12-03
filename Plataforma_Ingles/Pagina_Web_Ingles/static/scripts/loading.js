document.documentElement.classList.add('preload');

document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (loadingScreen) {
        // Asegurarnos que el loading sea visible inicialmente
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
        
        function showContent() {
            document.documentElement.classList.remove('preload');
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.remove();
                document.body.style.visibility = 'visible';
                document.body.classList.add('content-loaded');
            }, 500);
        }
        
        // Esperar a que todos los recursos estén cargados
        Promise.all([
            new Promise(resolve => {
                if (document.readyState === 'complete') resolve();
                else window.addEventListener('load', resolve);
            }),
            // Tiempo mínimo de carga
            new Promise(resolve => setTimeout(resolve, 1000))
        ]).then(showContent);
    }
}); 