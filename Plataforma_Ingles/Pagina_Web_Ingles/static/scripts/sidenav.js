document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que el loading termine
    const loadingScreen = document.querySelector('.loading-screen');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('main');
    
    function initializeSidenav() {
        if (!sidebar || !mainContent) return;

        const toggleBtn = document.querySelector('.toggle-btn');
        const closeBtn = document.querySelector('.close-btn');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function() {
                sidebar.classList.toggle('active');
                mainContent.classList.toggle('shifted');
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted');
            });
        }
        
        // Cerrar sidebar al hacer clic fuera
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && 
                !toggleBtn.contains(event.target) && 
                sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                mainContent.classList.remove('shifted');
            }
        });
    }

    // Inicializar sidenav después de que la pantalla de carga se haya removido
    if (loadingScreen) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.removedNodes.contains(loadingScreen)) {
                    initializeSidenav();
                    observer.disconnect();
                }
            });
        });

        observer.observe(document.body, {
            childList: true
        });
    } else {
        initializeSidenav();
    }
});

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

    // Desactiva todos los enlaces y oculta todos los videos si el enlace ya estaba activo
    if (this.classList.contains('clicked')) {
      links.forEach(item => item.classList.remove('clicked'));
      videoSections.forEach(video => video.style.display = 'none');
      if (noVideoMessage) {
        noVideoMessage.style.display = 'block';
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
  allUnits.forEach(unit => {
      unit.style.display = 'none';
  });

  const nextUnit = document.getElementById(unitId);
  if (nextUnit) {
      nextUnit.style.display = 'block';
      
      // Encontrar y activar el enlace correspondiente
      const title = nextUnit.querySelector('h3').innerText;
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
  allUnits.forEach(unit => {
      unit.style.display = 'none';
  });
  
  const previousUnit = document.getElementById(unitId);
  if (previousUnit) {
      previousUnit.style.display = 'block';
      
      // Encontrar y activar el enlace correspondiente
      const title = previousUnit.querySelector('h3').innerText;
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

