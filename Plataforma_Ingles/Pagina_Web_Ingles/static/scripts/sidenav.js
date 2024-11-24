// Sidenav
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
let lastSelected = {};
//Seccion de Unidades
function checkAnswer(option, feedbackId) {
  const feedback = document.getElementById(feedbackId);
  const questionName = option.name;

  // Si el mismo botón ya estaba seleccionado, lo desmarca
  if (lastSelected[questionName] === option) {
      option.checked = false;
      feedback.style.display = "none"; // Oculta el feedback
      lastSelected[questionName] = null; // Resetea la selección
  } else {
      // Actualiza el feedback según la respuesta seleccionada
      if (option.value === 'correct') {
          feedback.textContent = "¡Correcto!";
          feedback.className = "feedback correct";
      } else {
          feedback.textContent = "Incorrecto";
          feedback.className = "feedback incorrect";
      }

      feedback.style.display = "block"; // Muestra el feedback
      lastSelected[questionName] = option; // Guarda el botón seleccionado
  }
}