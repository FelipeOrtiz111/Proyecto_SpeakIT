console.log("Hola desde quiz.js");
const url = window.location.href;
const quizBox = document.getElementById("quiz-box");

// Verificar si el elemento quizBox existe
if (!quizBox) {
    console.error("Elemento quiz box no encontrado!");
} else {
    $.ajax({
        type: 'GET',
        url: `${url}data/`,
        success: function(response){
            console.log("Respuesta recibida:", response);
            const data = response.data;
            
            if (!data || data.length === 0) {
                console.log("No se recibieron datos del quiz");
                quizBox.innerHTML = '<p>No hay preguntas disponibles para este quiz.</p>';
                return;
            }
            
            data.forEach(el => {
                for (const [question, answers] of Object.entries(el)){
                    quizBox.innerHTML += `
                        <hr>
                        <div class="mb-2">
                            <b>${question}</b>
                        </div>
                    `;

                    answers.forEach(answer => {
                        quizBox.innerHTML += `
                            <div class="form-check">
                                <input class="ans" type="radio" name="${question}" id="${question}-${answer}" value="${answer}">
                                <label class="form-check-label" for="${question}-${answer}">${answer}</label>
                            </div>
                        `;
                    });
                }
            });
        },
        error: function(error){
            console.error("Error al obtener los datos del quiz:", error);
            quizBox.innerHTML = '<p>Error al cargar las preguntas del quiz.</p>';
        }
    });
}

const quizForm = document.getElementById("quiz-form");
const csrf = document.getElementsByName("csrfmiddlewaretoken");

const sendData = () => {
    const elements = [...document.getElementsByClassName("ans")];
    const data = {}
    data['csrfmiddlewaretoken'] = csrf[0].value;
    elements.forEach(el=>{
        if (el.checked){
            data[el.name] = el.value;
        } else {
            if (!data[el.name]){
                data[el.name] = null;
            }
        }
    })
    
    $.ajax({
        type: 'POST',
        url: `${url}save/`,
        data: data,
        success: function(response){
            console.log("Respuesta recibida:", response);
        },
        error: function(error){
            console.error("Error al enviar los datos del quiz:", error);
        }
    })
}

// Agregar verificación de existencia antes de usar quizForm
if (quizForm) {
    quizForm.addEventListener("submit", e => {
        e.preventDefault();
        sendData();
    });
} else {
    console.log("Formulario de quiz no encontrado en esta página");
}
