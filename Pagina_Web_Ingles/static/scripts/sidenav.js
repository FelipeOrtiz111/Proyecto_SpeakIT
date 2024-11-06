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
        
        // Si el enlace ya está activo, lo desactiva y muestra el mensaje inicial
        if (this.classList.contains('active-link')) {
            this.classList.remove('active-link');
            videoSections.forEach(video => video.style.display = 'none'); // Oculta todos los videos
            noVideoMessage.style.display = 'block'; // Muestra el mensaje "No se encuentra video"
        } else {
            // Limpia las selecciones anteriores
            links.forEach(item => item.classList.remove('active-link'));
            videoSections.forEach(video => video.style.display = 'none');
            
            // Marca el enlace actual como activo
            this.classList.add('active-link');
            
            // Muestra el video correspondiente
            let videoFound = false;
            videoSections.forEach(video => {
                const title = video.querySelector('h3').innerText;
                if (title === selectedTitle) {
                    video.style.display = 'block';
                    videoFound = true;
                }
            });

            // Muestra u oculta el mensaje "No se encuentra video"
            noVideoMessage.style.display = videoFound ? 'none' : 'block';
        }
    });
});