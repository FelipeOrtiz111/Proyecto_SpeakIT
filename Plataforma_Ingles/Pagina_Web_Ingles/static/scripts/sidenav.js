document.addEventListener("DOMContentLoaded", function () {
  const videoSections = document.querySelectorAll('.video-section');
  const noVideoMessage = document.querySelector('.no-video');

  // Esconde todas las unidades inicialmente
  videoSections.forEach(video => video.style.display = 'none');
  
  // Muestra el mensaje "No se encuentra Video" si no hay videos disponibles
  if (noVideoMessage) {
    noVideoMessage.style.display = videoSections.length > 0 ? 'none' : 'block';
  }

  // Recupera la sección y contenido desde el almacenamiento local
  const returnToSection = localStorage.getItem('returnToSection');
  const returnToContent = localStorage.getItem('returnToContent');

  if (returnToSection && returnToContent) {
    const sectionButton = document.querySelector(`#${returnToSection}`);
    sectionButton && sectionButton.click();

    const contentLink = Array.from(document.querySelectorAll('.dc-a'))
      .find(a => a.getAttribute('data-titulo') === returnToContent);
    contentLink && contentLink.click();

    // Limpia el estado almacenado
    localStorage.removeItem('returnToSection');
    localStorage.removeItem('returnToContent');
  }
});

// Función para mostrar la unidad siguiente
function showNextUnit(unitId) {
  const allUnits = document.querySelectorAll('.video-section');
  allUnits.forEach(unit => unit.style.display = 'none');
  
  const nextUnit = document.getElementById(unitId);
  if (nextUnit) {
    nextUnit.style.display = 'block';
  }
}

// Función para mostrar la unidad anterior
function showPreviousUnit(unitId) {
  const allUnits = document.querySelectorAll('.video-section');
  allUnits.forEach(unit => unit.style.display = 'none');
  
  const previousUnit = document.getElementById(unitId);
  if (previousUnit) {
    previousUnit.style.display = 'block';
  }
}

let lastSelected = {};

// Función de validación de respuestas
function checkAnswer(option, feedbackId) {
  const feedback = document.getElementById(feedbackId);
  const questionName = option.name;

  if (lastSelected[questionName] === option) {
    option.checked = false;
    feedback.style.display = "none";
    lastSelected[questionName] = null;
  } else {
    feedback.textContent = option.value === 'correct' ? "¡Correcto!" : "Incorrecto";
    feedback.className = option.value === 'correct' ? "feedback correct" : "feedback incorrect";
    feedback.style.display = "block";
    lastSelected[questionName] = option;
  }
}