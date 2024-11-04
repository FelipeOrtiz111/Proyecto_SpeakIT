// Selecciona todos los botones de despliegue del menú
var dropdown = document.getElementsByClassName("dropdown-btn");

document.querySelectorAll('.dc-a').forEach(link => {
  link.addEventListener('click', function(event) {
      event.preventDefault();
      const unidadId = this.getAttribute('data-unidad');  // Obtén el ID de la unidad

      // Verifica que unidadId no sea null o undefined
      if (unidadId) {
          // Realiza la solicitud AJAX para cargar los videos de la unidad seleccionada
          fetch(`/videos/${unidadId}/`)
              .then(response => response.text())
              .then(html => {
                  // Actualiza el contenedor de los videos con el contenido cargado
                  document.querySelector('.video-section-container').innerHTML = html;
              })
              .catch(error => console.error('Error al cargar los videos:', error));
      }
  });
});

// Agrega el evento de clic a cada botón de despliegue del menú
for (let i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;

    // Alterna la visibilidad del contenido desplegable
    dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
  });
}

// Función para alternar la descripción expandida de los videos
function toggleDescription(element) {
  const videoSection = element.closest('.video-section');
  videoSection.classList.toggle('expanded');
}
