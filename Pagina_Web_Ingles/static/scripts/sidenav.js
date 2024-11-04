var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  });
}
// Activa los contenedores de los videos
function toggleDescription(element) {
  const videoSection = element.closest('.video-section');
  videoSection.classList.toggle('expanded');
}

const links = document.querySelectorAll('.dropdown-container a.dc-a');
const videoSections = document.querySelectorAll('.video-section');

links.forEach(link => {
    link.addEventListener('click', function() {
        // Limpia las selecciones anteriores
        links.forEach(item => item.classList.remove('active'));
        videoSections.forEach(video => video.style.display = 'none');

        // Marca el enlace como activo
        this.classList.add('active');

        // Muestra el video correspondiente
        const selectedTitle = this.getAttribute('data-titulo');
        videoSections.forEach(video => {
            const title = video.querySelector('h3').innerText;
            if (title === selectedTitle) {
                video.style.display = 'block';
            }
        });
    });
});