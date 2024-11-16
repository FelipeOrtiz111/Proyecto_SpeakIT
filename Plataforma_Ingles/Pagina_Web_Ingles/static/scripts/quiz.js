// Función para los videos
function toggleDescription(element) {
    element.classList.toggle('expanded');
}

// Función para los quizes
function initializeQuizButtons() {
    const modalBtns = [...document.getElementsByClassName('modal-button')]
    modalBtns.forEach(modalBtn => modalBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Previene que el evento se propague al div padre
        const pk = modalBtn.getAttribute('data-pk')
        const quiz = modalBtn.getAttribute('data-quiz')
        const questions = modalBtn.getAttribute('data-questions')
        const difficulty = modalBtn.getAttribute('data-difficulty')
        const time = modalBtn.getAttribute('data-time')
        const pass = modalBtn.getAttribute('data-pass')
        
        // Navegar a la página del quiz
        window.location.href = `/quiz/${pk}/`
    }))
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeQuizButtons();
});
