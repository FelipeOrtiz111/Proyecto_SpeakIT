document.addEventListener('DOMContentLoaded', function() {
    const dashboardData = JSON.parse(document.getElementById('dashboard-data')?.textContent || '{}');
    
    if (!dashboardData) return;

    // Gráfico de promedios
    const averageCtx = document.getElementById('averageScoresChart').getContext('2d');
    new Chart(averageCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(dashboardData.student_progress),
            datasets: [{
                label: 'Promedio de Puntajes',
                data: Object.values(dashboardData.student_progress).map(student => student.average),
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

    // Gráfico de progreso individual
    const progressCtx = document.getElementById('studentProgressChart').getContext('2d');
    new Chart(progressCtx, {
        type: 'line',
        data: {
            labels: Object.keys(dashboardData.student_progress),
            datasets: Object.entries(dashboardData.student_progress).map(([student, data]) => ({
                label: student,
                data: data.scores,
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
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}