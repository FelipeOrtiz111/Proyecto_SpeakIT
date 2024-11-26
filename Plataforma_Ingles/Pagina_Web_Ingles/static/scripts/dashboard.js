document.addEventListener('DOMContentLoaded', function() {
    const userResults = JSON.parse(document.getElementById('user-results-data').textContent);
    
    // Preparar datos para el gráfico
    const quizNames = [];
    const scores = [];
    const attempts = [];
    
    userResults.forEach(result => {
        quizNames.push(result.quiz_name);
        scores.push(result.score);
        attempts.push(result.attempt_number);
    });

    // Crear gráfico de progreso
    const ctx = document.getElementById('progressChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: quizNames,
            datasets: [{
                label: 'Puntaje (%)',
                data: scores,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Progreso en Quizes'
                }
            }
        }
    });

    // Crear gráfico de intentos
    const ctxAttempts = document.getElementById('attemptsChart').getContext('2d');
    new Chart(ctxAttempts, {
        type: 'bar',
        data: {
            labels: quizNames,
            datasets: [{
                label: 'Número de Intentos',
                data: attempts,
                backgroundColor: 'rgb(153, 102, 255)',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }
        }
    });
});