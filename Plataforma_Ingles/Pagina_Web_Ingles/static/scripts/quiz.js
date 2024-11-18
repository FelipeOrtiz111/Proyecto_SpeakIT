console.log("Hola desde quiz.js");
const url = window.location.href;
const quizBox = document.getElementById("quiz-box");
const scoreBox = document.getElementById("score-box");
const resultBox = document.getElementById("result-box");

$.ajax({
    type: 'GET',
    url: `${url}data/`,
    success: function(response){
        //console.log("Respuesta recibida:", response);
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
                            resDiv.classList.add('bg-warning');
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

quizForm.addEventListener("submit", e => {
    e.preventDefault();
    sendData();
});

