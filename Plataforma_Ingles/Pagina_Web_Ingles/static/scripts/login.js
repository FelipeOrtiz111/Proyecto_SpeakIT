document.addEventListener('DOMContentLoaded', function() {
    const bgImage = new Image();
    const loginImage = new Image();
    
    bgImage.src = '/static/images/library.jpg';
    loginImage.src = '/static/images/bg_login.jpeg';
    
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
