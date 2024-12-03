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
    
    // Remover la pantalla de carga cuando todo esté listo
    window.addEventListener('load', function() {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500); // tiempo que dura la transición
    });
}); 