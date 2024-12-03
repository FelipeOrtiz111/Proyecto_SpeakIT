// Asegurarnos de que el loading esté visible desde el inicio
const loadingScreen = document.querySelector('.loading-screen');
if (loadingScreen) {
    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';
}

// Cuando el DOM esté listo, preparamos la transición
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        // Asegurarnos de que el loading siga visible
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
});

// Cuando todo esté cargado, ocultamos el loading
window.addEventListener('load', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (loadingScreen) {
        // Pequeño delay para asegurar que todo esté listo
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 100);
    }
}); 