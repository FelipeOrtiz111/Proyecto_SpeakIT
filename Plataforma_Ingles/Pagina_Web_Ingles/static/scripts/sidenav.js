document.addEventListener("DOMContentLoaded", function() {
  // Oculta todos los videos al cargar la página
  const videoSections = document.querySelectorAll('.video-section');
  const noVideoMessage = document.querySelector('.no-video');

  // Solo ejecuta el código si hay secciones de video en la página
  if (videoSections.length > 0) {
    videoSections.forEach(video => video.style.display = 'none');

    // Muestra el mensaje por defecto solo si existe el elemento
    if (noVideoMessage) {
      noVideoMessage.style.display = 'block';
    }
  }

  // Recuperar el estado guardado
  const returnToSection = localStorage.getItem('returnToSection');
  const returnToContent = localStorage.getItem('returnToContent');

  if (returnToSection && returnToContent) {
    // Encontrar y hacer clic en el botón de la sección
    const sectionButton = document.querySelector(`.${returnToSection}`);
    if (sectionButton) {
      sectionButton.click();
    }

    // Encontrar y hacer clic en el enlace del contenido
    const contentLink = Array.from(document.querySelectorAll('.dc-a'))
      .find(a => a.getAttribute('data-titulo') === returnToContent);
    if (contentLink) {
      contentLink.click();
    }

    // Limpiar el estado guardado
    localStorage.removeItem('returnToSection');
    localStorage.removeItem('returnToContent');
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

    // Eliminar la clase 'active' de todos los enlaces
    links.forEach(item => item.classList.remove('active'));

    // Agregar la clase 'active' al enlace seleccionado
    this.classList.add('active');

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

// Función para mostrar la siguiente unidad
function showNextUnit(unitId) {
  const allUnits = document.querySelectorAll('.video-section');
  allUnits.forEach(unit => {
      unit.style.display = 'none';
  });

  const nextUnit = document.getElementById(unitId);
  if (nextUnit) {
      nextUnit.style.display = 'block';
  }

  // Cambiar la clase 'active' del enlace correspondiente
  setActiveLink(unitId);
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
  }

  // Cambiar la clase 'active' del enlace correspondiente
  setActiveLink(unitId);
}

// Funciones para manejar los botones "Subir al siguiente nivel" y "Volver al nivel anterior"
function showNextLevel(levelId) {
  const allLevels = document.querySelectorAll('.video-section');
  allLevels.forEach(level => level.style.display = 'none');

  const nextLevel = document.getElementById(levelId);
  if (nextLevel) {
      nextLevel.style.display = 'block';
  }

  // Cambiar la clase 'active' del enlace correspondiente
  setActiveLink(levelId);
}

function showPreviousLevel(levelId) {
  const allLevels = document.querySelectorAll('.video-section');
  allLevels.forEach(level => level.style.display = 'none');

  const previousLevel = document.getElementById(levelId);
  if (previousLevel) {
      previousLevel.style.display = 'block';
  }

  // Cambiar la clase 'active' del enlace correspondiente
  setActiveLink(levelId);
}

// Función para establecer el enlace activo según la unidad o nivel visible
function setActiveLink(sectionId) {
  const allLinks = document.querySelectorAll('.dropdown-container a.dc-a');
  
  // Eliminar 'active' de todos los enlaces
  allLinks.forEach(link => link.classList.remove('active'));
  
  // Encontrar el enlace correspondiente y agregarle la clase 'active'
  const activeLink = Array.from(allLinks).find(link => link.getAttribute('data-titulo') === sectionId);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}
