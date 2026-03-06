from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

# Dados baseados nas regras descritas
PROFESSORES = [
    {"id": 1, "nome": "Prof A", "disciplina": "Inglês"},
    {"id": 2, "nome": "Prof B", "disciplina": "Inglês"},
    {"id": 3, "nome": "Prof C", "disciplina": "Inglês"},  # Extra para 2 turmas na tarde
    {"id": 4, "nome": "Prof D", "disciplina": "Espanhol"},
    {"id": 5, "nome": "Prof E", "disciplina": "Espanhol"},
    {"id": 6, "nome": "Prof F", "disciplina": "Espanhol"},  # Extra
    {"id": 7, "nome": "Prof G", "disciplina": "Ciências"},
    {"id": 8, "nome": "Prof H", "disciplina": "Ciências"},
    {"id": 9, "nome": "Prof I", "disciplina": "Ensino Religioso"},
    {"id": 10, "nome": "Prof J", "disciplina": "Outra"}  # Placeholder
]

TURMAS = [f"Turma {i+1}" for i in range(10)]
DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
HORARIOS = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "14:00-15:00"]  # Manhã e tarde

def gerar_horarios():
    # Lógica simplificada baseada nas regras
    alocacao = []

    # Inglês/Espanhol: 10 turmas, cada prof pega até 5, mas 4. 2 profs para 8, +1 para 2 na tarde
    prof_ingles = [p for p in PROFESSORES if p["disciplina"] == "Inglês"]
    prof_espanhol = [p for p in PROFESSORES if p["disciplina"] == "Espanhol"]
    
    # Alocar Inglês: 2 profs para 8 turmas (4 cada), 1 prof para 2 turmas na tarde
    for i, prof in enumerate(prof_ingles[:2]):
        turmas_prof = TURMAS[i*4:(i+1)*4]  # 4 turmas cada
        for turma in turmas_prof:
            alocacao.append({"disciplina": "Inglês", "professor": prof["nome"], "turma": turma, "turno": "Manhã"})
    
    # Último prof para 2 turmas na tarde
    prof_extra = prof_ingles[2]
    for turma in TURMAS[8:10]:  # Últimas 2
        alocacao.append({"disciplina": "Inglês", "professor": prof_extra["nome"], "turma": turma, "turno": "Tarde"})
    
    # Mesmo para Espanhol
    for i, prof in enumerate(prof_espanhol[:2]):
        turmas_prof = TURMAS[i*4:(i+1)*4]
        for turma in turmas_prof:
            alocacao.append({"disciplina": "Espanhol", "professor": prof["nome"], "turma": turma, "turno": "Manhã"})
    
    prof_extra_esp = prof_espanhol[2]
    for turma in TURMAS[8:10]:
        alocacao.append({"disciplina": "Espanhol", "professor": prof_extra_esp["nome"], "turma": turma, "turno": "Tarde"})
    
    # Ciências: cada prof 5 turmas
    prof_ciencias = [p for p in PROFESSORES if p["disciplina"] == "Ciências"]
    for i, prof in enumerate(prof_ciencias):
        turmas_prof = TURMAS[i*5:(i+1)*5]  # 5 cada
        for turma in turmas_prof:
            alocacao.append({"disciplina": "Ciências", "professor": prof["nome"], "turma": turma, "turno": "Manhã"})
    
    # Ensino Religioso: todas as turmas
    prof_religiao = next(p for p in PROFESSORES if p["disciplina"] == "Ensino Religioso")
    for turma in TURMAS:
        alocacao.append({"disciplina": "Ensino Religioso", "professor": prof_religiao["nome"], "turma": turma, "turno": "Manhã"})
    
    return alocacao

@app.route('/')
def home():
    return jsonify({"message": "Gerador de Horários - Backend em Python"})

@app.route('/gerar_horarios')
def gerar_horarios_route():
    horarios = gerar_horarios()
    
    # Gerar planilha Excel
    df = pd.DataFrame(horarios)
    df.to_excel('BACKEND/horarios.xlsx', index=False)
    
    # Retornar JSON para o frontend
    return jsonify({"message": "Planilha gerada com sucesso! Verifique a pasta BACKEND.", "horarios": horarios})

if __name__ == '__main__':
    app.run(debug=True)