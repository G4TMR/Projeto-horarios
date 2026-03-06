// app.js - Lógica do frontend para o Gerador de Horários

document.addEventListener('DOMContentLoaded', () => {
    const btnGerarApi = document.getElementById('btn-gerar-api');
    const timetableContainer = document.getElementById('timetable-container');

    // Função para gerar a grade baseada nos dados do backend
    function gerarGrade(horarios = []) {
        const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const horariosSlots = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'];

        let html = '<div class="timetable">';
        // Cabeçalhos
        html += '<div class="timetable-header">Horário</div>';
        dias.forEach(dia => {
            html += `<div class="timetable-header">${dia}</div>`;
        });

        // Linhas de horário
        horariosSlots.forEach(slot => {
            html += `<div class="time-slot">${slot}</div>`;
            dias.forEach(dia => {
                // Encontrar aula para este slot e dia (simplificado: aleatório ou baseado em turno)
                const aula = horarios.find(h => h.turma && Math.random() > 0.7); // Placeholder: 30% chance de aula
                if (aula) {
                    html += `<div class="class-card">
                        <div class="subject-name">${aula.disciplina}</div>
                        <div class="prof-name">${aula.professor}</div>
                        <div class="turma">${aula.turma}</div>
                    </div>`;
                } else {
                    html += '<div class="class-card vazio">Vazio</div>';
                }
            });
        });

        html += '</div>';
        timetableContainer.innerHTML = html;
    }

    // Função para chamar o backend
    function chamarBackend() {
        fetch('http://127.0.0.1:5000/gerar_horarios')
            .then(response => response.json())
            .then(data => {
                console.log('Dados recebidos:', data);
                alert(data.message);
                // Atualizar a grade com os horários
                gerarGrade(data.horarios);
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao conectar com o backend.');
            });
    }

    // Evento do botão
    btnGerarApi.addEventListener('click', chamarBackend);

    // Inicializar com grade vazia
    gerarGrade();
});