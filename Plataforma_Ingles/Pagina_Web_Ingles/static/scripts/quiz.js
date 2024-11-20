const url = window.location.href;
const quizBox = document.getElementById("quiz-box");
const scoreBox = document.getElementById("score-box");
const resultBox = document.getElementById("result-box");
const timerBox = document.getElementById("timer-box");
const startButton = document.getElementById("start-quiz");
const quizForm = document.getElementById("quiz-form");

let quizData = null;

// Agregar una variable global para el timer
let quizTimer = null;

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

// Solo hacer la llamada AJAX si estamos en una página de quiz específica
if (quizBox && startButton) {
    $.ajax({
        type: 'GET',
        url: `${url}data/`,
        success: function(response){
            quizData = response;
            if (!response.data || response.data.length === 0) {
                if (quizBox) {
                    quizBox.innerHTML = '<p>No hay preguntas disponibles para este quiz.</p>';
                    if (startButton) startButton.style.display = 'none';
                }
            }
        },
        error: function(error){
            if (quizBox) {
                quizBox.innerHTML = '<p>Error al cargar el quiz. Por favor, intente más tarde.</p>';
                if (startButton) startButton.style.display = 'none';
            }
        }
    });
}

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

    quizTimer = setInterval(() => {   // Guardamos la referencia del timer
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
                clearInterval(quizTimer);
                alert("Tiempo agotado");
                sendData();
            }, 500);
        }

        timerBox.innerHTML = `<b>${displayMinutes}:${displaySeconds}</b>`;
    }, 1000);
}

const csrf = document.getElementsByName("csrfmiddlewaretoken");

const sendData = () => {
    // Detener el timer al enviar las respuestas
    if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
    }

    const submitButton = quizForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

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
            resultBox.innerHTML = '';
            const retryBox = document.getElementById('retry-box');
            retryBox.innerHTML = '';
            
            const results = response.results;
            quizForm.classList.add("not-visible");

            scoreBox.innerHTML = `${response.passed ? 'Aprobado' : 'Ups...'} Tu resultado es ${response.score.toFixed(2)}%`;

            results.forEach(res=>{
                const resDiv = document.createElement("div");
                for (const [question, resp] of Object.entries(res)){
                    resDiv.innerHTML += question;
                    const cls = ['container', 'p-3', 'my-2', 'border', 'rounded', 'h5'];
                    resDiv.classList.add(...cls);

                    if (resp=='not answered'){
                        resDiv.innerHTML += '<br><span class="badge bg-secondary">No respondida</span>';
                        resDiv.classList.add('bg-light');
                    } else {
                        const answer = resp['answered'];
                        const correctAnswer = resp['correct_answer'];
                        
                        if (answer === correctAnswer) {
                            resDiv.classList.add('bg-success', 'text-white');
                            resDiv.innerHTML += `<br><span class="badge bg-white text-success">Contestada: ${answer}</span>`;
                        } else {
                            resDiv.classList.add('bg-danger', 'text-white');
                            resDiv.innerHTML += `<br><span class="badge bg-white text-danger">Contestada: ${answer}</span>`;
                            resDiv.innerHTML += `<br><span class="badge bg-white text-success">Respuesta correcta: ${correctAnswer}</span>`;
                        }
                    }
                }
                resultBox.append(resDiv);
            });

            if (!response.passed) {
                if (response.attempts_left > 0) {
                    retryBox.innerHTML = `
                        <button onclick="retryQuiz()" class="btn btn-primary">
                            Reintentar Quiz (${response.attempts_left} intentos restantes)
                        </button>
                    `;
                } else {
                    retryBox.innerHTML = `
                        <div class="alert alert-warning">
                            Has agotado todos tus intentos para este quiz.
                        </div>
                    `;
                }
            }
        },
        error: function(error){
            console.error("Error al enviar los datos del quiz:", error);
            submitButton.disabled = false;
        }
    })
}

// Función para reiniciar el quiz
const retryQuiz = () => {
    quizBox.innerHTML = '';
    scoreBox.innerHTML = '';
    resultBox.innerHTML = '';
    document.getElementById('retry-box').innerHTML = '';
    
    quizForm.classList.remove("not-visible");
    quizForm.style.display = 'block';
    
    const submitButton = quizForm.querySelector('button[type="submit"]');
    submitButton.disabled = false;
    
    if (quizData && quizData.data) {
        loadQuizQuestions(quizData.data);
        if (quizData.time) activateTimer(quizData.time);
    }
}

// Verificar si estamos en la página de un quiz específico
if (quizForm) {
    quizForm.addEventListener("submit", e => {
        e.preventDefault();
        sendData();
    });
}

// Función para guardar el estado antes de volver
function saveReturnState() {
    localStorage.setItem('returnToSection', 'pru-e'); // ID del botón "Prueba tu Conocimiento"
    localStorage.setItem('returnToContent', 'Quiz de Unidades.');
}

