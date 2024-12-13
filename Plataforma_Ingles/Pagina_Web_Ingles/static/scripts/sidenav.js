document.addEventListener("DOMContentLoaded", function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('main');

// Manejar el toggle del sidebar
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function (e) {
        e.stopPropagation(); // Evita que el evento se propague al body
        sidebar.classList.toggle('minimized');
        mainContent.classList.toggle('expanded');
    });
}

// Prevenir interacciones que afecten al estado del sidebar fuera de su botón
document.body.addEventListener('click', function (e) {
    // Solo actúa si el clic ocurre fuera del sidebar y del botón toggle
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        // No hacer nada, el sidebar permanece en su estado actual
    }
});

    // Botón para mostrar la siguiente unidad
    const nextButtons = document.querySelectorAll('.next-unit-btn');
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextUnitId = this.getAttribute('data-next-unit-id');
            showNextUnit(nextUnitId);
        });
    });

    // Botón para mostrar la unidad anterior
    const prevButtons = document.querySelectorAll('.prev-unit-btn');
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevUnitId = this.getAttribute('data-prev-unit-id');
            showPreviousUnit(prevUnitId);
        });
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

    // Cerrar todos los dropdowns primero
    var dropdownBtns = document.getElementsByClassName("dropdown-btn");
    for (let btn of dropdownBtns) {
        btn.classList.remove("active");
        var dropdownContent = btn.nextElementSibling;
        if (dropdownContent) {
            dropdownContent.style.display = "none";
        }
    }

    // Abrir solo Inglés Básico por defecto
    var inglesBasico = document.querySelector('.ing-b');
    if (inglesBasico) {
        inglesBasico.classList.add('active');
        var dropdownContent = inglesBasico.nextElementSibling;
        if (dropdownContent) {
            dropdownContent.style.display = "block";
        }
    }

    // Manejar los botones dropdown
    var dropdown = document.getElementsByClassName("dropdown-btn");
    for (var i = 0; i < dropdown.length; i++) {
        dropdown[i].addEventListener("click", function(e) {
            this.classList.toggle("active");
            var dropdownContent = this.nextElementSibling;
            if (dropdownContent.style.display === "block") {
                dropdownContent.style.display = "none";
            } else {
                dropdownContent.style.display = "block";
            }
            e.stopPropagation(); // Evitar que el click se propague
        });
    }

    // Asegurarse de que los enlaces dentro del sidebar sean clickeables
    var sidebarLinks = document.querySelectorAll('.sidenav a');
    sidebarLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.stopPropagation(); // Evitar que el click se propague al contenedor padre
        });
    });

    // Prevenir que los clicks en los enlaces del sidebar activen otros eventos
    document.querySelector('.sidenav').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.stopPropagation();
        }
    });
});

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

            // Muestra u oculta el contenido de la pagina
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
    // Ocultar todas las unidades
    const allUnits = document.querySelectorAll('.video-section');
    const tituloMain = document.querySelector('.titulo-main');
    allUnits.forEach(unit => {
        unit.style.display = 'none';
    });

    // Mostrar la unidad seleccionada
    const nextUnit = document.getElementById(unitId);
    if (nextUnit) {
        nextUnit.style.display = 'block';
        const title = nextUnit.querySelector('h3').innerText;

        // Actualizar título principal
        if (tituloMain) {
            tituloMain.textContent = title;
        }

        // Activar el enlace correspondiente
        const correspondingLink = Array.from(links)
            .find(link => link.getAttribute('data-titulo') === title);
        
        if (correspondingLink) {
            links.forEach(link => link.classList.remove('clicked'));
            correspondingLink.classList.add('clicked');

            // Activar el dropdown-btn correspondiente
            const parentDropdown = correspondingLink.closest('.dropdown-container')
                .previousElementSibling;
            
            if (parentDropdown) {
                // Desactivar otros dropdowns
                document.querySelectorAll('.dropdown-btn').forEach(btn => {
                    btn.classList.remove('active');
                    const dropdownContent = btn.nextElementSibling;
                    if (dropdownContent) dropdownContent.style.display = 'none';
                });

                // Activar el dropdown correspondiente
                parentDropdown.classList.add('active');
                const dropdownContent = parentDropdown.nextElementSibling;
                if (dropdownContent) dropdownContent.style.display = 'block';
            }
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
    const allLevels = document.querySelector

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

