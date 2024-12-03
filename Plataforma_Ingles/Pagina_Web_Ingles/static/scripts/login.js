document.documentElement.classList.add('preload');

document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.querySelector('.loading-screen');
    const bgImage = new Image();
    bgImage.src = '/static/images/library.jpg';
    
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
        new Promise(resolve => {
            if (bgImage.complete) resolve();
            else bgImage.onload = resolve;
        }),
        new Promise(resolve => {
            if (document.readyState === 'complete') resolve();
            else window.addEventListener('load', resolve);
        }),
        new Promise(resolve => setTimeout(resolve, 500))
    ]).then(showContent);
}); 
