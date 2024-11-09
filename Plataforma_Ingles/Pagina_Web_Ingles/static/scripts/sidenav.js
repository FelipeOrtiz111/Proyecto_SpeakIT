document.addEventListener("DOMContentLoaded", function() {
  // Oculta todos los videos al cargar la página
  const videoSections = document.querySelectorAll('.video-section');
  videoSections.forEach(video => video.style.display = 'none');

  // Muestra el mensaje por defecto
  const noVideoMessage = document.querySelector('.no-video');
  noVideoMessage.style.display = 'block';
});

var dropdown = document.getElementsByClassName("dropdown-btn");

for (let i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var dropdownContent = this.nextElementSibling;
      dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
  });
}

//Version Antigua cuando los videos se mostraban en forma de lista
//function toggleDescription(element) {
//  const videoSection = element.closest('.video-section');
//  const videoContainer = videoSection.querySelector('.video-container');
//  videoContainer.style.display = videoContainer.style.display === "block" ? "none" : "block";
//}

const links = document.querySelectorAll('.dropdown-container a.dc-a');
const videoSections = document.querySelectorAll('.video-section');
const noVideoMessage = document.querySelector('.no-video');

links.forEach(link => {
  link.addEventListener('click', function() {
    const selectedTitle = this.getAttribute('data-titulo');

    // Desactiva todos los enlaces y oculta todos los videos si el enlace ya estaba activo
    if (this.classList.contains('clicked')) {
      links.forEach(item => item.classList.remove('clicked'));
      videoSections.forEach(video => video.style.display = 'none');
      document.querySelector('.no-video').style.display = 'block';
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
      const noVideoMessage = document.querySelector('.no-video');
      noVideoMessage.style.display = videoFound ? 'none' : 'block';
    }
  });
});
