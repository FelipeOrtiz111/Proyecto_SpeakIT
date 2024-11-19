//console.log("Hola desde quiz.js");
const url = window.location.href;
const quizBox = document.getElementById("quiz-box");
const scoreBox = document.getElementById("score-box");
const resultBox = document.getElementById("result-box");
const timerBox = document.getElementById("timer-box");
const startButton = document.getElementById("start-quiz");
const quizForm = document.getElementById("quiz-form");

let quizData = null;

// Función para cargar las preguntas
const loadQuizQuestions = (data) => {
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
}

// Modificar el AJAX inicial para mejor manejo de errores
$.ajax({
    type: 'GET',
    url: `${url}data/`,
    success: function(response){
        quizData = response;
        if (!response.data || response.data.length === 0) {
            console.log("No se recibieron datos del quiz");
            if (quizBox) {
                quizBox.innerHTML = '<p>No hay preguntas disponibles para este quiz.</p>';
                if (startButton) startButton.style.display = 'none';
            }
        }
    },
    error: function(error){
        console.error("Error al obtener los datos del quiz:", error);
        if (quizBox) {
            quizBox.innerHTML = '<p>Error al cargar las preguntas del quiz. Por favor, intente más tarde.</p>';
            if (startButton) startButton.style.display = 'none';
        }
    }
});

// Solo agregar el event listener al botón si existe
if (startButton) {
    startButton.addEventListener('click', () => {
        startButton.style.display = 'none';
        if (quizForm) quizForm.style.display = 'block';
        if (quizData && quizData.data) loadQuizQuestions(quizData.data);
        if (quizData && quizData.time) activateTimer(quizData.time);
    });
}

const activateTimer = (time) => {
    if (time.toString().length < 2){
        timerBox.innerHTML = `<b>0${time}:00</b>`; 
    } else {
        timerBox.innerHTML = `<b>${time}:00</b>`;
    }

    let minutes = time - 1
    let seconds = 60
    let displaySeconds
    let displayMinutes

    const timer = setInterval(() => {   
        seconds--
        if (seconds < 0){
            minutes--;
            seconds = 59;
        }
        if (minutes.toString().length < 2){
            displayMinutes = '0'+minutes;
        } else {
            displayMinutes = minutes;
        }

        if (seconds.toString().length < 2){
            displaySeconds = '0'+seconds;
        } else {
            displaySeconds = seconds;
        }

        if (minutes==0 && seconds==0){
            timerBox.innerHTML = `<b>00:00</b>`;
            setTimeout(() => {
                clearInterval(timer);
                alert("Tiempo agotado");
                sendData();
            }, 500);
        }

        timerBox.innerHTML = `<b>${displayMinutes}:${displaySeconds}</b>`;
    }, 1000);
}

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
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(response){
            //console.log("Respuesta recibida:", response);
            const results = response.results;
            console.log(results);
            quizForm.classList.add("not-visible");

            scoreBox.innerHTML = `${response.passed ? 'Aprobado' : 'Ups...'} Tu resultado es ${response.score.toFixed(2)}%`;

            results.forEach(res=>{
                const resDiv = document.createElement("div");
                for (const [question, resp] of Object.entries(res)){
                    //console.log(question, resp);

                    resDiv.innerHTML += question;
                    const cls = ['container', 'p-3', 'my-2', 'border', 'border-primary', 'rounded', 'h5'];
                    resDiv.classList.add(...cls);

                    if (resp=='not answered'){
                        resDiv.innerHTML += '<b>No respondida</b>';
                        resDiv.classList.add('bg-danger');
                    } else {
                        const answer = resp['answered'];
                        const correct = resp['correct_answer'];

                        if (answer==correct){
                            resDiv.classList.add('bg-success');
                            resDiv.innerHTML += `<b>Contestada: ${answer}</b>`;
                        } else {
                            resDiv.classList.add('bg-danger');
                            resDiv.innerHTML += `<b>| Correcta: ${correct}</b>`;
                            resDiv.innerHTML += `<b>| Contestada: ${answer}</b>`;
                        }
                    }
                }
                resultBox.append(resDiv);
            })
        },
        error: function(error){
            console.error("Error al enviar los datos del quiz:", error);
        }
    })
}

// Verificar si estamos en la página de un quiz específico
if (quizForm) {
    quizForm.addEventListener("submit", e => {
        e.preventDefault();
        sendData();
    });
}

