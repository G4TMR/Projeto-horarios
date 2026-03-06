// script.js - Lógica principal do Gerador de Horários

// Estado global da aplicação
let appState = {
    escola: {
        nome: '',
        responsavel: '',
        anoLetivo: '',
        turno: ''
    },
    turmas: [],
    professores: [],
    disciplinas: [],
    turmaAtiva: 0,
    horarios: [],
    aulasAlocadas: {} // Armazena aulas alocadas manualmente
};

// Carregar dados do localStorage
function carregarDados() {
    try {
        const dados = localStorage.getItem('horarioAppState');
        if (dados) {
            const parsed = JSON.parse(dados);
            appState = { ...appState, ...parsed };
            console.log('Dados carregados do localStorage');
        } else {
            console.log('Nenhum dado no localStorage');
        }
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        console.log('Limpando localStorage corrompido');
        localStorage.clear();
    }
}

// Salvar dados no localStorage
function salvarDados() {
    try {
        localStorage.setItem('horarioAppState', JSON.stringify(appState));
        alert('Dados salvos com sucesso!');
    } catch (erro) {
        console.error('Erro ao salvar:', erro);
        alert('Erro ao salvar dados. Tente novamente.');
    }
}

// FUNÇÃO GLOBAL DE RESET - chamar no console: window.resetarApp()
window.resetarApp = function() {
    if (confirm('Deseja resetar toda a aplicação? Todos os dados serão perdidos.')) {
        localStorage.clear();
        location.reload();
    }
};

// Mudar entre views
function mostrarView(viewId) {
    document.querySelectorAll('[id$="-view"], [id$="-screen"]').forEach(el => {
        el.classList.add('view-hidden');
    });
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('view-hidden');
    }
}

// Inicializar dados padrão se primeira vez
function inicializarDados() {
    if (appState.turmas.length === 0) {
        appState.turmas = ['Turma 1', 'Turma 2', 'Turma 3', 'Turma 4', 'Turma 5',
                           'Turma 6', 'Turma 7', 'Turma 8', 'Turma 9', 'Turma 10'];
    }
    
    if (appState.professores.length === 0) {
        appState.professores = [
            { id: 1, nome: "Prof A", disciplina: "Inglês" },
            { id: 2, nome: "Prof B", disciplina: "Inglês" },
            { id: 3, nome: "Prof C", disciplina: "Inglês" },
            { id: 4, nome: "Prof D", disciplina: "Espanhol" },
            { id: 5, nome: "Prof E", disciplina: "Espanhol" },
            { id: 6, nome: "Prof F", disciplina: "Espanhol" },
            { id: 7, nome: "Prof G", disciplina: "Ciências" },
            { id: 8, nome: "Prof H", disciplina: "Ciências" },
            { id: 9, nome: "Prof I", disciplina: "Ensino Religioso" },
            { id: 10, nome: "Prof J", disciplina: "Português" }
        ];
    }

    if (appState.disciplinas.length === 0) {
        appState.disciplinas = ['Inglês', 'Espanhol', 'Ciências', 'Ensino Religioso', 'Português'];
    }
}

// Preencher seletor de turmas
function atualizarSeletorTurmas() {
    const selector = document.getElementById('class-selector');
    selector.innerHTML = '';
    appState.turmas.forEach((turma, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = turma;
        selector.appendChild(option);
    });
    selector.value = appState.turmaAtiva;
    selector.addEventListener('change', (e) => {
        appState.turmaAtiva = parseInt(e.target.value);
        atualizarGrade();
    });
}

// Atualizar lista de professores
function atualizarListaProfessores() {
    const lista = document.getElementById('professor-list');
    lista.innerHTML = '';
    appState.professores.forEach(prof => {
        const item = document.createElement('div');
        item.className = 'prof-item';
        item.draggable = true;
        item.innerHTML = `<strong>${prof.nome}</strong> - ${prof.disciplina}`;
        
        // Eventos de drag
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('professor', JSON.stringify(prof));
            item.style.opacity = '0.6';
        });
        
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });
        
        lista.appendChild(item);
    });
}

// Gerar a grade de horários
function atualizarGrade() {
    const container = document.getElementById('timetable');
    if (!container) {
        console.error('Container timetable não encontrado');
        console.error('IDs disponíveis:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }
    
    console.log('Atualizando grade para turma:', appState.turmaAtiva);
    container.innerHTML = ''; // Limpar
    
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const horarios = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];

    // Cabeçalho
    const headerHorario = document.createElement('div');
    headerHorario.className = 'timetable-header';
    headerHorario.textContent = 'Horário';
    container.appendChild(headerHorario);
    
    dias.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'timetable-header';
        header.textContent = dia;
        container.appendChild(header);
    });

    // Linhas de horário
    horarios.forEach((horario, horarioIdx) => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = horario;
        container.appendChild(timeSlot);
        
        dias.forEach((dia, diaIdx) => {
            const cellId = `${appState.turmaAtiva}-${horarioIdx}-${diaIdx}`;
            const aulaSalva = appState.aulasAlocadas[cellId];
            
            const card = document.createElement('div');
            card.className = 'class-card' + (aulaSalva ? '' : ' vazio');
            card.id = cellId;
            card.setAttribute('data-cell', 'true');
            
            if (aulaSalva) {
                card.innerHTML = `
                    <div class="subject-name">${aulaSalva.disciplina}</div>
                    <div class="prof-name">${aulaSalva.nome}</div>
                    <small style="font-size: 0.7rem; cursor: pointer; color: red;" onclick="removerAula('${cellId}')">×</small>
                `;
                card.style.backgroundColor = '#e8f5e9';
            } else {
                card.innerHTML = '<span style="color: #999; font-size: 0.9rem;">Arraste aqui</span>';
                card.style.backgroundColor = '#ffffff';
            }
            
            // Eventos de drop
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                card.style.backgroundColor = '#cfe9ff';
                card.style.border = '2px dashed #3498db';
            });
            
            card.addEventListener('dragleave', () => {
                card.style.border = 'none';
                card.style.backgroundColor = aulaSalva ? '#e8f5e9' : '#ffffff';
            });
            
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                const profData = e.dataTransfer.getData('professor');
                if (profData) {
                    const prof = JSON.parse(profData);
                    alocadAula(cellId, prof);
                }
            });
            
            container.appendChild(card);
        });
    });

    atualizarResumo();
}

// Alocar uma aula
function alocadAula(cellId, prof) {
    appState.aulasAlocadas[cellId] = {
        nome: prof.nome,
        disciplina: prof.disciplina,
        id: prof.id
    };
    salvarDados();
    atualizarGrade();
}

// Remover uma aula
function removerAula(cellId) {
    delete appState.aulasAlocadas[cellId];
    salvarDados();
    atualizarGrade();
}

// Atualizar painel de resumo
function atualizarResumo() {
    const panel = document.getElementById('summary-panel');
    const turmaAtual = appState.turmas[appState.turmaAtiva];
    
    panel.innerHTML = `
        <div class="summary-item">
            <span>Turma Atual:</span>
            <span>${turmaAtual}</span>
        </div>
        <div class="summary-item">
            <span>Total de Professores:</span>
            <span>${appState.professores.length}</span>
        </div>
        <div class="summary-item">
            <span>Total de Disciplinas:</span>
            <span>${appState.disciplinas.length}</span>
        </div>
    `;
}

// Atualizar status global
function atualizarStatusGlobal() {
    const lista = document.getElementById('global-status-list');
    lista.innerHTML = '';
    appState.turmas.forEach(turma => {
        const tag = document.createElement('div');
        tag.className = 'status-tag completed';
        tag.textContent = turma;
        lista.appendChild(tag);
    });
}

// Tela de Boas-vindas
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Carregado - Inicializando aplicação');
    carregarDados();
    inicializarDados();

    const setupForm = document.getElementById('setup-form');
    setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        appState.escola.nome = document.getElementById('school-name').value;
        appState.escola.responsavel = document.getElementById('responsible-name').value;
        appState.escola.anoLetivo = document.getElementById('school-year').value;
        appState.escola.turno = document.getElementById('school-shift').value;

        salvarDados();
        
        mostrarView('scheduler-view');
        atualizarSeletorTurmas();
        atualizarListaProfessores();
        atualizarStatusGlobal();
        atualizarGrade();
    });

    // Botões de navegação
    document.getElementById('manage-btn').addEventListener('click', () => {
        mostrarView('management-view');
        preencherTabelaGerenciamento();
    });

    document.getElementById('back-to-scheduler-btn').addEventListener('click', () => {
        mostrarView('scheduler-view');
    });

    document.getElementById('save-all-btn').addEventListener('click', salvarDados);

    // Botões de download
    document.getElementById('manage-btn').addEventListener('click', () => {
        mostrarView('management-view');
        preencherTabelaGerenciamento();
    });

    // Botão de adicionar professor
    const addProfBtn = document.getElementById('add-prof-supr-btn');
    if (addProfBtn) {
        addProfBtn.addEventListener('click', () => {
            const novoId = Math.max(...appState.professores.map(p => p.id), 0) + 1;
            appState.professores.push({ id: novoId, nome: 'Novo Professor', disciplina: 'Disciplina' });
            preencherTabelaGerenciamento();
            atualizarListaProfessores();
        });
    }

    // Inicialmente mostrar boas-vindas se não tem dados salvos
    if (!localStorage.getItem('horarioAppState')) {
        console.log('Primeira vez - mostrando boas-vindas');
        mostrarView('welcome-screen');
    } else {
        console.log('Dados encontrados - carregando scheduler');
        mostrarView('scheduler-view');
        atualizarSeletorTurmas();
        atualizarListaProfessores();
        atualizarStatusGlobal();
        atualizarGrade();
    }
    
    console.log('Inicialização concluída. AppState:', appState);
});

// Gerenciamento de Cadastros
function preencherTabelaGerenciamento() {
    const tableContainer = document.getElementById('combined-management-table');
    
    let html = '<table class="management-table"><thead><tr>';
    html += '<th class="col-id">ID</th>';
    html += '<th class="col-nome">Nome</th>';
    html += '<th class="col-materia">Disciplina</th>';
    html += '<th class="col-actions">Ações</th>';
    html += '</tr></thead><tbody>';

    appState.professores.forEach((prof, idx) => {
        html += `<tr>
            <td>${prof.id}</td>
            <td><input type="text" value="${prof.nome}"></td>
            <td><input type="text" value="${prof.disciplina}"></td>
            <td><button class="btn-primary" onclick="deletarProfessor(${idx})">Deletar</button></td>
        </tr>`;
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function deletarProfessor(index) {
    appState.professores.splice(index, 1);
    preencherTabelaGerenciamento();
    atualizarListaProfessores();
}

// ===== FUNÇÕES DE DOWNLOAD =====

// Exportar para Excel
function exportarExcel() {
    try {
        // Verificar se XLSX está carregado
        if (typeof XLSX === 'undefined') {
            alert('Erro: Biblioteca XLSX não carregada. Tente recarregar a página.');
            return;
        }

        const turmaAtual = appState.turmas[appState.turmaAtiva];
        const wb = XLSX.utils.book_new();

        // ===== ABA 1: HORÁRIOS =====
        const dadosHorario = [];
        
        // Cabeçalho com informações da escola
        dadosHorario.push([appState.escola.nome + ' - HORÁRIO']);
        dadosHorario.push(['Turma: ' + turmaAtual]);
        dadosHorario.push(['Responsável: ' + appState.escola.responsavel]);
        dadosHorario.push(['Ano Letivo: ' + appState.escola.anoLetivo]);
        dadosHorario.push(['Turno: ' + appState.escola.turno]);
        dadosHorario.push([]); // Linha vazia
        dadosHorario.push([]); // Outra linha vazia

        // Cabeçalho da grade
        const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
        const horarios = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];
        const header = ['Horário', ...dias];
        dadosHorario.push(header);

        // Preenchimento com professores alocados ou aleatórios
        horarios.forEach((horario, horarioIdx) => {
            const linha = [horario];
            dias.forEach((dia, diaIdx) => {
                const cellId = `${appState.turmaAtiva}-${horarioIdx}-${diaIdx}`;
                const aulaSalva = appState.aulasAlocadas[cellId];
                
                if (aulaSalva) {
                    linha.push(aulaSalva.disciplina + ' - ' + aulaSalva.nome);
                } else {
                    // Se não houver aula salva, deixa vazio (ou pode preencher aleatório)
                    linha.push('');
                }
            });
            dadosHorario.push(linha);
        });

        const ws1 = XLSX.utils.aoa_to_sheet(dadosHorario);
        ws1['!cols'] = [
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 }
        ];
        XLSX.utils.book_append_sheet(wb, ws1, 'Horários');

        // ===== ABA 2: PROFESSORES =====
        const dadosProfessores = [
            ['ID', 'Nome do Professor', 'Disciplina']
        ];
        appState.professores.forEach(prof => {
            dadosProfessores.push([prof.id, prof.nome, prof.disciplina]);
        });
        
        const ws2 = XLSX.utils.aoa_to_sheet(dadosProfessores);
        ws2['!cols'] = [
            { wch: 8 },
            { wch: 25 },
            { wch: 20 }
        ];
        XLSX.utils.book_append_sheet(wb, ws2, 'Professores');

        // ===== ABA 3: TURMAS =====
        const dadosTurmas = [['Turma']];
        appState.turmas.forEach(turma => {
            dadosTurmas.push([turma]);
        });
        
        const ws3 = XLSX.utils.aoa_to_sheet(dadosTurmas);
        ws3['!cols'] = [{ wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws3, 'Turmas');

        // Download
        const nomeArquivo = `Horarios_${turmaAtual.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, nomeArquivo);
        alert('✓ Planilha Excel gerada com sucesso!');
    } catch (erro) {
        console.error('Erro ao gerar Excel:', erro);
        alert('Erro ao gerar Excel. Verifique o console para mais detalhes.');
    }
}

// Exportar para PDF
function exportarPDF() {
    const turmaAtual = appState.turmas[appState.turmaAtiva];
    
    // Gerar linhas da tabela com professores
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const horarios = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'];
    
    let linhasTabela = '';
    horarios.forEach((horario, horarioIdx) => {
        linhasTabela += '<tr>';
        linhasTabela += `<td style="text-align: center; font-weight: bold; padding: 12px; font-size: 11px;">${horario}</td>`;
        dias.forEach((dia, diaIdx) => {
            const cellId = `${appState.turmaAtiva}-${horarioIdx}-${diaIdx}`;
            const aulaSalva = appState.aulasAlocadas[cellId];
            let conteudo = '';
            
            if (aulaSalva) {
                conteudo = `<strong style="font-size: 10px;">${aulaSalva.disciplina}</strong><br/><span style="font-size: 9px;">${aulaSalva.nome}</span>`;
            }
            
            linhasTabela += `<td style="vertical-align: middle; text-align: center; padding: 12px; min-height: 60px; font-size: 10px;">${conteudo}</td>`;
        });
        linhasTabela += '</tr>';
    });

    // Gerar lista de professores em colunas
    let listaProfessores = '';
    const metade = Math.ceil(appState.professores.length / 2);
    let col1 = '<div style="display: inline-block; width: 48%; vertical-align: top;">';
    let col2 = '<div style="display: inline-block; width: 48%; vertical-align: top;">';
    
    appState.professores.forEach((prof, idx) => {
        const item = `<div style="margin: 4px 0; font-size: 11px;"><strong>${prof.nome}</strong> - ${prof.disciplina}</div>`;
        if (idx < metade) {
            col1 += item;
        } else {
            col2 += item;
        }
    });
    col1 += '</div>';
    col2 += '</div>';
    listaProfessores = col1 + col2;

    const element = document.createElement('div');
    element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 15px; line-height: 1.4;">
            <h1 style="text-align: center; color: #2c3e50; margin: 0 0 5px 0; font-size: 24px;">GERADOR DE HORÁRIOS</h1>
            <h2 style="text-align: center; color: #34495e; margin: 0 0 15px 0; font-size: 16px;">${appState.escola.nome}</h2>
            
            <div style="margin: 15px 0; border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 11px;">
                <p style="margin: 3px 0;"><strong>Turma:</strong> ${turmaAtual}</p>
                <p style="margin: 3px 0;"><strong>Responsável:</strong> ${appState.escola.responsavel}</p>
                <p style="margin: 3px 0;"><strong>Ano Letivo:</strong> ${appState.escola.anoLetivo}</p>
                <p style="margin: 3px 0;"><strong>Turno:</strong> ${appState.escola.turno}</p>
            </div>

            <h3 style="color: #2c3e50; margin: 15px 0 8px 0; font-size: 13px;">GRADE DE HORÁRIOS</h3>
            <table border="1" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 10px;">
                <thead style="background-color: #2c3e50; color: white;">
                    <tr>
                        <th style="text-align: center; padding: 8px; font-weight: bold;">Horário</th>
                        <th style="text-align: center; padding: 8px; font-weight: bold;">Segunda</th>
                        <th style="text-align: center; padding: 8px; font-weight: bold;">Terça</th>
                        <th style="text-align: center; padding: 8px; font-weight: bold;">Quarta</th>
                        <th style="text-align: center; padding: 8px; font-weight: bold;">Quinta</th>
                        <th style="text-align: center; padding: 8px; font-weight: bold;">Sexta</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasTabela}
                </tbody>
            </table>

            <h3 style="color: #2c3e50; margin: 15px 0 8px 0; font-size: 13px;">PROFESSORES</h3>
            <div style="font-size: 10px;">
                ${listaProfessores}
            </div>

            <div style="margin-top: 20px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #ccc; padding-top: 8px;">
                <p style="margin: 0;">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
        </div>
    `;

    const opt = {
        margin: 8,
        filename: `Horarios_${turmaAtual}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
    alert('PDF gerado com sucesso!');
}