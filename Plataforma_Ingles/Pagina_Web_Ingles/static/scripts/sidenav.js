var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

document.querySelectorAll('.dc-a').forEach(link => {
  link.addEventListener('click', function(event) {
      event.preventDefault();
      const unidadId = this.getAttribute('data-unidad');  // Obtén el ID de la unidad

      // Realiza la solicitud AJAX para cargar los videos de la unidad seleccionada
      fetch(`/videos/${unidadId}/`)
          .then(response => response.text())
          .then(html => {
              document.querySelector('.video-section-container').innerHTML = html;
          })
          .catch(error => console.error('Error al cargar los videos:', error));
  });
});

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