function toggleAddQuizForm() {
    var form = document.getElementById('add-quiz-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function toggleAddQuestionForm() {
    var form = document.getElementById('add-question-form');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        form.querySelector('form').reset();
    } else {
        form.style.display = 'none';
    }
}

function addAnswer() {
    const tbody = document.querySelector('#answersTable tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <input type="text" class="form-control answer-text" name="answer_text[]">
        </td>
        <td class="text-center">
            <input type="checkbox" class="form-check-input custom-checkbox" name="correct_answers[]" value="${tbody.children.length}">
        </td>
        <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeAnswer(this)">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </td>
    `;
    tbody.appendChild(newRow);
}

function removeAnswer(button) {
    const tbody = document.querySelector('#answersTable tbody');
    if (tbody.children.length > 1) {
        button.closest('tr').remove();
    } else {
        alert('Debe haber al menos una respuesta');
    }
}

function setAction(action, keepOpen = false) {
    document.getElementById('form-action').value = action;
}

// Check if the form should be open on page load
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('keep_open') === 'true') {
        toggleAddQuestionForm();
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}