window.addEventListener('load', function() {
    // Obtener la pantalla de carga existente
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (loadingScreen) {
        // Ocultar la pantalla de carga con una transición suave
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 500);
    }
}); 