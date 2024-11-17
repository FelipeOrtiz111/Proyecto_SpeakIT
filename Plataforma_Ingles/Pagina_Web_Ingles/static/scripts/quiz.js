console.log("Hola");
const url = window.location.href;

const quizSubmit = document.getElementById("quiz-submit");

$.ajax({
    type: 'GET',
    url: `${url}data`,
    success: function(response){
        // console.log(response);
        data = response.data;
        data.forEach(el => {
            for (const [question, answers] of Object.entries(el)){
                console.log(question)
                console.log(answers)
            }
        });
    },
    error: function(error){
        console.log(error);
    }
});

