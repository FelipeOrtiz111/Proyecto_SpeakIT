document.addEventListener("DOMContentLoaded", function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('main');

    // Mejorar el manejo del toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('minimized');
            mainContent.classList.toggle('expanded');
        });
    }

    // Manejar clics en el sidebar cuando está minimizado
    sidebar.addEventListener('click', function(e) {
        if (sidebar.classList.contains('minimized') && 
            !e.target.closest('.sidebar-toggle')) {
            sidebar.classList.remove('minimized');
            mainContent.classList.remove('expanded');
        }
    });

    // Oculta todos los videos al cargar la página
    const videoSections = document.querySelectorAll('.video-section');
    const noVideoMessage = document.querySelector('.no-video');

    if (videoSections.length > 0) {
        videoSections.forEach(video => video.style.display = 'none');
        if (noVideoMessage) {
            noVideoMessage.style.display = 'block';
        }
    }

    // Desplegar todos los menús al cargar la página
    var dropdownBtns = document.getElementsByClassName("dropdown-btn");
    for (let btn of dropdownBtns) {
        btn.classList.add("active");
        var dropdownContent = btn.nextElementSibling;
        dropdownContent.style.display = "block";
    }
});

// Manejo de los dropdowns
var dropdown = document.getElementsByClassName("dropdown-btn");
for (let i = 0; i < dropdown.length; i++) {
    dropdown[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
    });
}

const links = document.querySelectorAll('.dropdown-container a.dc-a');
const videoSections = document.querySelectorAll('.video-section');
const noVideoMessage = document.querySelector('.no-video');

links.forEach(link => {
    link.addEventListener('click', function() {
        const selectedTitle = this.getAttribute('data-titulo');
        const noVideoMessage = document.querySelector('.no-video');
        const tituloMain = document.querySelector('.titulo-main');

        // Desactiva todos los enlaces y oculta todos los videos si el enlace ya estaba activo
        if (this.classList.contains('clicked')) {
            links.forEach(item => item.classList.remove('clicked'));
            videoSections.forEach(video => video.style.display = 'none');
            if (noVideoMessage) {
                noVideoMessage.style.display = 'block';
            }
            // Restaurar título por defecto
            if (tituloMain) {
                tituloMain.textContent = 'SpeakIT';
            }
        } else {
            // Alterna el estado de activación usando toggle
            links.forEach(item => item.classList.remove('clicked'));
            this.classList.toggle('clicked');

            videoSections.forEach(video => video.style.display = 'none');
            let videoFound = false;

            videoSections.forEach(video => {
                const title = video.querySelector('h3').innerText;
                if (title === selectedTitle) {
                    video.style.display = 'block';
                    videoFound = true;
                    // Actualizar título principal
                    if (tituloMain) {
                        tituloMain.textContent = title;
                    }
                }
            });

            // Muestra u oculta el mensaje "No se encuentra Video"
            if (noVideoMessage) {
                noVideoMessage.style.display = videoFound ? 'none' : 'block';
            }
        }
    });
});

// Sección de Unidades
function checkAnswer(option, feedbackId) {
    const feedback = document.getElementById(feedbackId);

    // Mostrar feedback según la respuesta seleccionada
    if (option.value === 'correct') {
        feedback.textContent = "¡Correcto!";
        feedback.className = "feedback correct";
    } else {
        feedback.textContent = "Incorrecto";
        feedback.className = "feedback incorrect";
    }

    feedback.style.display = "block"; // Mostrar el mensaje
}

// Función para mostrar la siguiente unidad
function showNextUnit(unitId) {
    const allUnits = document.querySelectorAll('.video-section');
    const tituloMain = document.querySelector('.titulo-main');
    
    allUnits.forEach(unit => {
        unit.style.display = 'none';
    });

    const nextUnit = document.getElementById(unitId);
    if (nextUnit) {
        nextUnit.style.display = 'block';
        const title = nextUnit.querySelector('h3').innerText;
        
        // Actualizar título principal
        if (tituloMain) {
            tituloMain.textContent = title;
        }
        
        // Encontrar y activar el enlace correspondiente
        const correspondingLink = Array.from(links)
            .find(link => link.getAttribute('data-titulo') === title);
        
        if (correspondingLink) {
            links.forEach(link => link.classList.remove('clicked'));
            correspondingLink.classList.add('clicked');
        }
    }
}

// Función para mostrar la unidad anterior
function showPreviousUnit(unitId) {
    const allUnits = document.querySelectorAll('.video-section');
    const tituloMain = document.querySelector('.titulo-main');
    
    allUnits.forEach(unit => {
        unit.style.display = 'none';
    });
    
    const previousUnit = document.getElementById(unitId);
    if (previousUnit) {
        previousUnit.style.display = 'block';
        const title = previousUnit.querySelector('h3').innerText;
        
        // Actualizar título principal
        if (tituloMain) {
            tituloMain.textContent = title;
        }
        
        // Encontrar y activar el enlace correspondiente
        const correspondingLink = Array.from(links)
            .find(link => link.getAttribute('data-titulo') === title);
        
        if (correspondingLink) {
            links.forEach(link => link.classList.remove('clicked'));
            correspondingLink.classList.add('clicked');
        }
    }
}

// Funciones para manejar los botones "Subir al siguiente nivel" y "Volver al nivel anterior"
function showNextLevel(levelId) {
    const allLevels = document.querySelectorAll('.video-section');
    allLevels.forEach(level => level.style.display = 'none');

    const nextLevel = document.getElementById(levelId);
    if (nextLevel) {
        nextLevel.style.display = 'block';
        
        // Encontrar y activar el enlace correspondiente
        const title = nextLevel.querySelector('h3').innerText;
        const correspondingLink = Array.from(links)
            .find(link => link.getAttribute('data-titulo') === title);
        
        if (correspondingLink) {
            links.forEach(link => link.classList.remove('clicked'));
            correspondingLink.classList.add('clicked');
            
            // Encontrar el dropdown-btn padre
            const parentDropdown = correspondingLink.closest('.dropdown-container')
                .previousElementSibling;
            
            // Si el dropdown no está expandido, expandirlo
            if (parentDropdown && !parentDropdown.classList.contains('active')) {
                parentDropdown.click();
            }
            
            // Hacer scroll hacia arriba suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

function showPreviousLevel(levelId) {
    const allLevels = document.querySelectorAll('.video-section');
    allLevels.forEach(level => level.style.display = 'none');

    const previousLevel = document.getElementById(levelId);
    if (previousLevel) {
        previousLevel.style.display = 'block';
        
        // Encontrar y activar el enlace correspondiente
        const title = previousLevel.querySelector('h3').innerText;
        const correspondingLink = Array.from(links)
            .find(link => link.getAttribute('data-titulo') === title);
        
        if (correspondingLink) {
            links.forEach(link => link.classList.remove('clicked'));
            correspondingLink.classList.add('clicked');
            
            // Encontrar el dropdown-btn padre
            const parentDropdown = correspondingLink.closest('.dropdown-container')
                .previousElementSibling;
            
            // Si el dropdown no está expandido, expandirlo
            if (parentDropdown && !parentDropdown.classList.contains('active')) {
                parentDropdown.click();
            }
            
            // Hacer scroll hacia arriba suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

