document.addEventListener("DOMContentLoaded", function() {
  // Ocultar todos los videos al cargar la página
  const videoSections = document.querySelectorAll('.video-section');
  const noVideoMessage = document.querySelector('.no-video');

  // Solo ejecutar si hay secciones de video
  if (videoSections.length > 0) {
    videoSections.forEach(video => video.style.display = 'none');

    // Mostrar mensaje por defecto si existe
    if (noVideoMessage) {
      noVideoMessage.style.display = 'block';
    }
  }

  // Recuperar estado guardado y volver a la sección y contenido anterior
  const returnToSection = localStorage.getItem('returnToSection');
  const returnToContent = localStorage.getItem('returnToContent');

  if (returnToSection && returnToContent) {
    const sectionButton = document.querySelector(`.${returnToSection}`);
    if (sectionButton) {
      sectionButton.click();
    }

    const contentLink = Array.from(document.querySelectorAll('.dc-a'))
      .find(a => a.getAttribute('data-titulo') === returnToContent);
    if (contentLink) {
      contentLink.click();
    }

    localStorage.removeItem('returnToSection');
    localStorage.removeItem('returnToContent');
  }
});

// Manejo de dropdowns
var dropdown = document.getElementsByClassName("dropdown-btn");
for (let i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
  });
}

// Función de navegación entre las unidades
const links = document.querySelectorAll('.dropdown-container a.dc-a');
links.forEach(link => {
  link.addEventListener('click', function() {
    const selectedTitle = this.getAttribute('data-titulo');
    const noVideoMessage = document.querySelector('.no-video');

    // Desactivar todos los enlaces y ocultar videos si ya estaba activo
    if (this.classList.contains('clicked')) {
      links.forEach(item => item.classList.remove('clicked'));
      videoSections.forEach(video => video.style.display = 'none');
      if (noVideoMessage) {
        noVideoMessage.style.display = 'block';
      }
    } else {
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

      if (noVideoMessage) {
        noVideoMessage.style.display = videoFound ? 'none' : 'block';
      }
    }
  });
});

let lastSelected = {};

// Función para comprobar respuestas
function checkAnswer(option, feedbackId) {
  const feedback = document.getElementById(feedbackId);
  const questionName = option.name;

  if (lastSelected[questionName] === option) {
      option.checked = false;
      feedback.style.display = "none";
      lastSelected[questionName] = null;
  } else {
      if (option.value === 'correct') {
          feedback.textContent = "¡Correcto!";
          feedback.className = "feedback correct";
      } else {
          feedback.textContent = "Incorrecto";
          feedback.className = "feedback incorrect";
      }

      feedback.style.display = "block";
      lastSelected[questionName] = option;
  }
}

// Función para mostrar la siguiente unidad o nivel
function showNextUnit(unitId) {
  const allUnits = document.querySelectorAll('.video-section');
  allUnits.forEach(unit => {
      unit.style.display = 'none';
  });

  const nextUnit = document.getElementById(unitId);
  if (nextUnit) {
      nextUnit.style.display = 'block';
  }
}

// Función para mostrar la unidad o nivel anterior
function showPreviousUnit(unitId) {
  const allUnits = document.querySelectorAll('.video-section');
  allUnits.forEach(unit => {
      unit.style.display = 'none';
  });

  const previousUnit = document.getElementById(unitId);
  if (previousUnit) {
      previousUnit.style.display = 'block';
  }
}

// Funciones para manejar los botones "Subir al siguiente nivel" y "Volver al nivel anterior"
function showNextLevel(levelId) {
  const allLevels = document.querySelectorAll('.video-section');
  allLevels.forEach(level => level.style.display = 'none');

  const nextLevel = document.getElementById(levelId);
  if (nextLevel) {
      nextLevel.style.display = 'block';
  }
}

function showPreviousLevel(levelId) {
  const allLevels = document.querySelectorAll('.video-section');
  allLevels.forEach(level => level.style.display = 'none');

  const previousLevel = document.getElementById(levelId);
  if (previousLevel) {
      previousLevel.style.display = 'block';
  }
}