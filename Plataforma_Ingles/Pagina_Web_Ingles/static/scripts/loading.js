document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    const mainLogin = document.getElementById('main-login');
    const background = document.querySelector('.background');
    
    function showContent() {
        document.documentElement.classList.remove('preload');
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.remove();
            document.body.style.visibility = 'visible';
            document.body.classList.add('content-loaded');
            
            // Iniciar animaciones específicas del login si estamos en esa página
            if (mainLogin && background) {
                background.classList.add('fade-in');
                mainLogin.classList.add('fade-in-delayed');
                
                // Animar elementos del formulario si existen
                const formElements = document.querySelectorAll('.form-group, .form-button, .border-top');
                formElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.style.opacity = '1';
                    }, index * 200); // Retraso escalonado para cada elemento
                });
            }
        }, 500);
    }
    
    // Esperar a que todos los recursos estén cargados
    Promise.all([
        new Promise(resolve => {
            if (document.readyState === 'complete') resolve();
            else window.addEventListener('load', resolve);
        }),
        // Tiempo mínimo de carga
        new Promise(resolve => setTimeout(resolve, 500))
    ]).then(showContent);
}); 