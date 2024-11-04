document.addEventListener("DOMContentLoaded", function() {
  // Oculta todos los videos al cargar la página
  const videoSections = document.querySelectorAll('.video-section');
  videoSections.forEach(video => video.style.display = 'none');

  // Muestra el mensaje por defecto
  const noVideoMessage = document.querySelector('.no-video');
  noVideoMessage.style.display = 'block';
});

var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var dropdownContent = this.nextElementSibling;
      dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
  });
}

function toggleDescription(element) {
  const videoSection = element.closest('.video-section');
  const videoContainer = videoSection.querySelector('.video-container');

  videoContainer.style.display = videoContainer.style.display === "block" ? "none" : "block";
}

const links = document.querySelectorAll('.dropdown-container a.dc-a');

links.forEach(link => {
  link.addEventListener('click', function() {
      // Limpia las selecciones anteriores
      links.forEach(item => item.classList.remove('active'));
      videoSections.forEach(video => video.style.display = 'none');

      // Marca el enlace como activo
      this.classList.add('active');

      // Muestra el video correspondiente
      const selectedTitle = this.getAttribute('data-titulo');
      let videoFound = false;

      videoSections.forEach(video => {
          const title = video.querySelector('h3').innerText;
          if (title === selectedTitle) {
              video.style.display = 'block';
              videoFound = true;
          }
      });

      // Muestra u oculta el mensaje "No se encuentra video"
      const noVideoMessage = document.querySelector('.no-video');
      noVideoMessage.style.display = videoFound ? 'none' : 'block';
  });
});
