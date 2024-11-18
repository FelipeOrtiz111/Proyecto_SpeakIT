console.log("Quiz script loaded");
const url = window.location.href;
const quizBox = document.getElementById("quiz-box");

console.log("URL:", url);

if (!quizBox) {
    console.error("Quiz box element not found!");
} else {
    $.ajax({
        type: 'GET',
        url: `${url}data`,
        success: function(response){
            console.log("Response received:", response);
            const data = response.data;
            
            if (!data || data.length === 0) {
                console.log("No quiz data received");
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
                                <input class="form-check-input" type="radio" name="${question}" id="${question}-${answer}" value="${answer}">
                                <label class="form-check-label" for="${question}-${answer}">${answer}</label>
                            </div>
                        `;
                    });
                }
            });
        },
        error: function(error){
            console.error("Error fetching quiz data:", error);
            quizBox.innerHTML = '<p>Error al cargar las preguntas del quiz.</p>';
        }
    });
}
