document.addEventListener('DOMContentLoaded', function() {
    // Manejar la carga de imágenes
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