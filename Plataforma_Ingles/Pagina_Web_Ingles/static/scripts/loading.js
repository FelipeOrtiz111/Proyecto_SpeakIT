document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
});

window.addEventListener('load', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 500);
    }
}); 