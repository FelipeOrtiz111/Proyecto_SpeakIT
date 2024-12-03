// Asegurarnos de que el contenido esté oculto inicialmente
document.documentElement.classList.add('preload');
document.body.style.visibility = 'hidden';

document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    const mainLogin = document.getElementById('main-login');
    const background = document.querySelector('.background');
    
    // Asegurarnos de que el loading sea visible inicialmente
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
    }
    
    function showContent() {
        if (loadingScreen) {
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
                        }, index * 200);
                    });
                }
            }, 500);
        }
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