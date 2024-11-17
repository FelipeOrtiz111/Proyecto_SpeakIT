console.log("Hola");
const url = window.location.href;

const quizBox = document.getElementById("quiz-box");

$.ajax({
    type: 'GET',
    url: `${url}data`,
    success: function(response){
        // console.log(response);
        data = response.data;
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
        console.log(error);
    }
});

