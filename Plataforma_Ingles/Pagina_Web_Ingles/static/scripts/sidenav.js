// Sidenav
document.addEventListener("DOMContentLoaded", function() {
  // Ocultar videos y mostrar mensaje inicial
  const videoSections = document.querySelectorAll('.video-section');
  const noVideoMessage = document.querySelector('.no-video');

  if (videoSections.length > 0) {
    videoSections.forEach(video => video.style.display = 'none');
    if (noVideoMessage) noVideoMessage.style.display = 'block';
  }

  // Restaurar estado de sección y contenido al recargar
  const returnToSection = localStorage.getItem('returnToSection');
  const returnToContent = localStorage.getItem('returnToContent');

  if (returnToSection && returnToContent) {
    const sectionButton = document.querySelector(`.${returnToSection}`);
    if (sectionButton) sectionButton.click();

    const contentLink = Array.from(document.querySelectorAll('.dc-a'))
      .find(a => a.getAttribute('data-titulo') === returnToContent);
    if (contentLink) contentLink.click();

    localStorage.removeItem('returnToSection');
    localStorage.removeItem('returnToContent');
  }
});

// Dropdown funcionalidad
const dropdown = document.getElementsByClassName("dropdown-btn");
for (let i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    const dropdownContent = this.nextElementSibling;
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
  });
}

// Manejo de enlaces y videos
const links = document.querySelectorAll('.dropdown-container a.dc-a');
links.forEach(link => {
  link.addEventListener('click', function() {
    const selectedTitle = this.getAttribute('data-titulo');
    const noVideoMessage = document.querySelector('.no-video');

    if (this.classList.contains('clicked')) {
      // Desmarcar y ocultar todo
      links.forEach(item => item.classList.remove('clicked'));
      videoSections.forEach(video => video.style.display = 'none');
      if (noVideoMessage) noVideoMessage.style.display = 'block';
    } else {
      // Activar nuevo enlace y mostrar video correspondiente
      links.forEach(item => item.classList.remove('clicked'));
      this.classList.add('clicked');

      videoSections.forEach(video => video.style.display = 'none');
      let videoFound = false;

      videoSections.forEach(video => {
        const title = video.querySelector('h3').innerText;
        if (title === selectedTitle) {
          video.style.display = 'block';
          videoFound = true;
        }
      });

      if (noVideoMessage) noVideoMessage.style.display = videoFound ? 'none' : 'block';
    }
  });
});

// Feedback para las respuestas
function checkAnswer(option, feedbackId) {
  const feedback = document.getElementById(feedbackId);
  if (option.value === 'correct') {
    feedback.textContent = "¡Correcto!";
    feedback.className = "feedback correct";
  } else {
    feedback.textContent = "Incorrecto";
    feedback.className = "feedback incorrect";
  }
  feedback.style.display = "block";
}

// Navegar entre unidades
function showNextUnit(unitId) {
  navigateUnit(unitId, 'next');
}

function showPreviousUnit(unitId) {
  navigateUnit(unitId, 'previous');
}

function navigateUnit(unitId, direction) {
  const allUnits = document.querySelectorAll('.video-section');
  const links = document.querySelectorAll('.dropdown-container a.dc-a');
  allUnits.forEach(unit => unit.style.display = 'none');

  const targetUnit = document.getElementById(unitId);
  if (targetUnit) {
    targetUnit.style.display = 'block';
    links.forEach(link => {
      if (link.getAttribute('data-titulo') === targetUnit.querySelector('h3').innerText) {
        link.classList.add('clicked');
      } else {
        link.classList.remove('clicked');
        link.style.color = ''; 
      }
    });
  }
}
