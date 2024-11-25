document.addEventListener('DOMContentLoaded', function() {
    const dashboardDataElement = document.getElementById('dashboard-data');
    if (!dashboardDataElement) return;
    
    const dashboardData = JSON.parse(dashboardDataElement.textContent);
    const students = Object.keys(dashboardData.student_progress);
    
    // 1. Gráfico de promedios
    const averageCtx = document.getElementById('averageScoresChart').getContext('2d');
    new Chart(averageCtx, {
        type: 'bar',
        data: {
            labels: students,
            datasets: [{
                label: 'Promedio de Puntajes',
                data: students.map(student => dashboardData.student_progress[student].average),
                backgroundColor: '#4a1d6a'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // 2. Gráfico de progreso individual
    const progressCtx = document.getElementById('studentProgressChart').getContext('2d');
    new Chart(progressCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: Math.max(...students.map(s => dashboardData.student_progress[s].scores.length)) }, (_, i) => `Intento ${i + 1}`),
            datasets: students.map(student => ({
                label: student,
                data: dashboardData.student_progress[student].scores,
                borderColor: getRandomColor(),
                fill: false
            }))
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // 3. Gráfico de tasa de completitud
    const completionCtx = document.getElementById('completionRateChart').getContext('2d');
    new Chart(completionCtx, {
        type: 'doughnut',
        data: {
            labels: students,
            datasets: [{
                data: students.map(student => dashboardData.student_progress[student].completion_rate),
                backgroundColor: students.map(() => getRandomColor())
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}